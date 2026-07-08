import { Property, RehabItem, TradeCategory } from '@/services/types';
import { BrrrrAnalysis } from '@/utils/brrrr';
import { formatUsd } from '@/utils/format';

export type PlanPhase = 'Buy' | 'Rehab' | 'Rent' | 'Refinance' | 'Repeat';

export interface PlanStep {
  phase: PlanPhase;
  title: string;
  detail: string;
}

const PRIORITY_ORDER: Record<RehabItem['priority'], number> = {
  critical: 0,
  recommended: 1,
  cosmetic: 2,
};

export interface TradeGroup {
  trade: TradeCategory;
  items: RehabItem[];
  costLow: number;
  costHigh: number;
  topPriority: RehabItem['priority'];
}

export function groupRehabByTrade(property: Property): TradeGroup[] {
  const map = new Map<TradeCategory, RehabItem[]>();
  for (const item of property.rehabItems) {
    const list = map.get(item.trade) ?? [];
    list.push(item);
    map.set(item.trade, list);
  }
  const groups: TradeGroup[] = Array.from(map.entries()).map(([trade, items]) => ({
    trade,
    items,
    costLow: items.reduce((s, i) => s + i.estCostLow, 0),
    costHigh: items.reduce((s, i) => s + i.estCostHigh, 0),
    topPriority: items.reduce(
      (top, i) => (PRIORITY_ORDER[i.priority] < PRIORITY_ORDER[top] ? i.priority : top),
      'cosmetic' as RehabItem['priority']
    ),
  }));
  return groups.sort((a, b) => PRIORITY_ORDER[a.topPriority] - PRIORITY_ORDER[b.topPriority]);
}

export function buildActionPlan(property: Property, analysis: BrrrrAnalysis): PlanStep[] {
  const steps: PlanStep[] = [];
  const vacant = property.units.filter((u) => !u.occupied);
  const tradeGroups = groupRehabByTrade(property);
  const critical = tradeGroups.filter((g) => g.topPriority === 'critical');

  steps.push({
    phase: 'Buy',
    title: `Offer at or below ${formatUsd(property.price, { compact: false })}`,
    detail:
      analysis.cashLeftInDeal <= 0
        ? `This price already pencils to pull 100% of your cash back out at refinance. You have room to negotiate up if needed — don't lose the deal over the last few thousand dollars.`
        : `At list price, you'd leave ${formatUsd(analysis.cashLeftInDeal, { compact: false })} in the deal after refinance. Negotiating toward ${formatUsd(property.price - analysis.cashLeftInDeal * 0.6, { compact: false })} would meaningfully improve your cash-on-cash return.`,
  });

  steps.push({
    phase: 'Buy',
    title: 'Line up rehab financing before you are under contract',
    detail: `Budget ${formatUsd(analysis.rehabBudget.low, { compact: false })}–${formatUsd(analysis.rehabBudget.high, { compact: false })} for rehab. A hard-money or bridge lender will typically cover 85-90% of purchase + 100% of rehab draws — get pre-approved so your offer can close in 15-21 days.`,
  });

  steps.push({
    phase: 'Buy',
    title: 'Order inspection focused on the critical-priority items',
    detail:
      critical.length > 0
        ? `Confirm scope and get a second opinion on: ${critical.map((g) => g.trade).join(', ')}. These drive your rehab budget the most — a bad surprise here is what blows up the refi math.`
        : `No critical-priority items flagged — inspection should mainly confirm the cosmetic/recommended scope holds.`,
  });

  steps.push({
    phase: 'Rehab',
    title: `Sequence trades over ~${property.rehabTimelineMonths} month${property.rehabTimelineMonths === 1 ? '' : 's'}`,
    detail: `Start with structural/systems work (${tradeGroups
      .slice(0, 3)
      .map((g) => g.trade)
      .join(', ')}) before cosmetic finishes, so you're not redoing paint or flooring after a plumbing or electrical fix.`,
  });

  if (vacant.length > 0) {
    steps.push({
      phase: 'Rehab',
      title: `Prioritize the ${vacant.length} vacant unit${vacant.length === 1 ? '' : 's'} first`,
      detail: `${vacant.map((u) => u.label).join(', ')} can be fully rehabbed without displacing tenants — get these rent-ready first so you're collecting income while occupied units turn over.`,
    });
  }

  steps.push({
    phase: 'Rehab',
    title: 'Get 2-3 bids per trade from the recommended contractor list',
    detail: `Use the cost-efficient picks below as your baseline bid — anything more than ~15% over their quote needs a reason (warranty, timeline, material grade).`,
  });

  steps.push({
    phase: 'Rent',
    title: 'Re-list turned units at market rent',
    detail: `Target ${formatUsd(
      property.units.reduce((s, u) => s + u.marketRentPostRehab, 0),
      { compact: false }
    )}/mo combined across all ${property.unitCount} units once rehab is complete. Screen for 2+ years income stability — lenders will want seasoned leases for the refi appraisal.`,
  });

  steps.push({
    phase: 'Rent',
    title: 'Hold occupancy 60-90 days before refinancing',
    detail: `Most lenders want either a seasoned lease or a completed-and-stabilized property before they'll use market rent (not just appraised value) to qualify the refinance.`,
  });

  steps.push({
    phase: 'Refinance',
    title: `Refinance into a ${DEFAULT_REFI_LABEL} at ~75% of ARV`,
    detail: `Target appraisal at or above ${formatUsd(property.arvEstimate, { compact: false })}. At 75% LTV that's a ${formatUsd(
      analysis.refiLoanAmount,
      { compact: false }
    )} loan — pulling out roughly ${formatUsd(analysis.cashOutAtRefi, { compact: false })} after refi closing costs.`,
  });

  steps.push({
    phase: 'Refinance',
    title:
      analysis.cashLeftInDeal <= 0
        ? 'You should get all your cash back — verify with your lender before closing'
        : `Plan to leave ${formatUsd(analysis.cashLeftInDeal, { compact: false })} in the deal long-term`,
    detail:
      analysis.cashLeftInDeal <= 0
        ? `Projected cash-out (${formatUsd(analysis.cashOutAtRefi, { compact: false })}) covers your full ${formatUsd(
            analysis.totalCashInvested,
            { compact: false }
          )} cash invested. Confirm the lender's seasoning period and appraisal come in at plan before counting on this.`
        : `That's on ${formatUsd(analysis.totalCashInvested, { compact: false })} invested — a ${
            analysis.cashOnCashReturn !== null ? analysis.cashOnCashReturn.toFixed(1) : '—'
          }% projected cash-on-cash return going forward.`,
  });

  steps.push({
    phase: 'Repeat',
    title: 'Redeploy the cash-out into the next property',
    detail: `Monthly cash flow after refinance is projected at ${formatUsd(analysis.monthlyCashFlow, {
      compact: false,
    })} (${formatUsd(analysis.monthlyCashFlowPerUnit, { compact: false })}/unit). Use the recovered cash as the down payment / rehab budget for your next BRRRR.`,
  });

  return steps;
}

const DEFAULT_REFI_LABEL = '30-yr fixed DSCR or conventional';
