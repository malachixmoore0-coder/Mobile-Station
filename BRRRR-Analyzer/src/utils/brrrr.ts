import { Property } from '@/services/types';

export interface BrrrrAssumptions {
  purchaseClosingCostPct: number; // of purchase price
  refiLtvPct: number; // % of ARV lendable on the cash-out refi
  refiRatePct: number; // annual interest rate on the refi loan
  refiTermYears: number;
  refiClosingCostPct: number; // of refi loan amount
  vacancyPct: number; // of gross rent
  managementPct: number; // of gross rent
  maintenanceReservePct: number; // of gross rent (capex + repairs reserve)
  insuranceMonthlyPerUnit: number;
  holdingCostMonthlyPerUnit: number; // utilities/carrying cost during rehab, per vacant/turning unit
}

export const DEFAULT_ASSUMPTIONS: BrrrrAssumptions = {
  purchaseClosingCostPct: 3,
  refiLtvPct: 75,
  refiRatePct: 7.5,
  refiTermYears: 30,
  refiClosingCostPct: 2,
  vacancyPct: 5,
  managementPct: 8,
  maintenanceReservePct: 8,
  insuranceMonthlyPerUnit: 55,
  holdingCostMonthlyPerUnit: 90,
};

export interface RehabBudget {
  low: number;
  high: number;
  mid: number;
}

export interface BrrrrAnalysis {
  purchasePrice: number;
  closingCosts: number;
  rehabBudget: RehabBudget;
  holdingCosts: number;
  totalCashInvested: number;

  arv: number;
  refiLoanAmount: number;
  refiClosingCosts: number;
  cashOutAtRefi: number;
  cashLeftInDeal: number;

  monthlyPI: number;
  grossMonthlyRent: number;
  vacancyLoss: number;
  managementFee: number;
  maintenanceReserve: number;
  insuranceMonthly: number;
  taxesMonthly: number;
  totalMonthlyExpenses: number; // excludes debt service
  monthlyCashFlow: number; // after debt service
  annualCashFlow: number;
  monthlyCashFlowPerUnit: number;

  noiAnnual: number;
  capRate: number; // NOI / ARV
  cashOnCashReturn: number | null; // null == infinite (no cash left in deal)
  dscr: number;

  onePercentRuleActual: number; // grossMonthlyRent / allInCost * 100
  onePercentRulePass: boolean;
  fiftyPercentRuleActual: number; // expense ratio excl. debt service, as % of gross rent
  fiftyPercentRulePass: boolean;

  score: number; // 0-100 BRRRR fit score
  scoreBreakdown: { label: string; score: number; weight: number }[];
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/** Linear scale of value between [lo, hi] to a 0-100 score. */
function scale(value: number, lo: number, hi: number): number {
  if (hi === lo) return 50;
  return clamp(((value - lo) / (hi - lo)) * 100, 0, 100);
}

function monthlyMortgagePayment(principal: number, annualRatePct: number, years: number): number {
  if (principal <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export function rehabBudget(property: Property): RehabBudget {
  const low = property.rehabItems.reduce((s, i) => s + i.estCostLow, 0);
  const high = property.rehabItems.reduce((s, i) => s + i.estCostHigh, 0);
  return { low, high, mid: Math.round((low + high) / 2) };
}

export function analyzeBrrrr(
  property: Property,
  assumptions: BrrrrAssumptions = DEFAULT_ASSUMPTIONS
): BrrrrAnalysis {
  const a = assumptions;
  const purchasePrice = property.price;
  const closingCosts = round2(purchasePrice * (a.purchaseClosingCostPct / 100));
  const rehab = rehabBudget(property);
  const vacantUnits = property.units.filter((u) => !u.occupied).length || property.unitCount;
  const holdingCosts = round2(a.holdingCostMonthlyPerUnit * vacantUnits * property.rehabTimelineMonths);
  const totalCashInvested = round2(purchasePrice + closingCosts + rehab.mid + holdingCosts);

  const arv = property.arvEstimate;
  const refiLoanAmount = round2(arv * (a.refiLtvPct / 100));
  const refiClosingCosts = round2(refiLoanAmount * (a.refiClosingCostPct / 100));
  const cashOutAtRefi = round2(refiLoanAmount - refiClosingCosts);
  const cashLeftInDeal = round2(totalCashInvested - cashOutAtRefi);

  const monthlyPI = round2(monthlyMortgagePayment(refiLoanAmount, a.refiRatePct, a.refiTermYears));
  const grossMonthlyRent = property.units.reduce((s, u) => s + u.marketRentPostRehab, 0);
  const vacancyLoss = round2(grossMonthlyRent * (a.vacancyPct / 100));
  const managementFee = round2(grossMonthlyRent * (a.managementPct / 100));
  const maintenanceReserve = round2(grossMonthlyRent * (a.maintenanceReservePct / 100));
  const insuranceMonthly = round2(a.insuranceMonthlyPerUnit * property.unitCount);
  const taxesMonthly = round2(property.annualTaxes / 12);
  const totalMonthlyExpenses = round2(
    vacancyLoss + managementFee + maintenanceReserve + insuranceMonthly + taxesMonthly
  );
  const noiMonthly = round2(grossMonthlyRent - totalMonthlyExpenses);
  const noiAnnual = round2(noiMonthly * 12);
  const monthlyCashFlow = round2(noiMonthly - monthlyPI);
  const annualCashFlow = round2(monthlyCashFlow * 12);
  const monthlyCashFlowPerUnit = round2(monthlyCashFlow / property.unitCount);

  const capRate = arv > 0 ? round2((noiAnnual / arv) * 1000) / 10 : 0;
  const cashOnCashReturn =
    cashLeftInDeal > 0 ? round2((annualCashFlow / cashLeftInDeal) * 1000) / 10 : null;
  const dscr = monthlyPI > 0 ? round2((noiMonthly / monthlyPI) * 100) / 100 : 0;

  const allInCost = purchasePrice + rehab.mid;
  const onePercentRuleActual = allInCost > 0 ? round2((grossMonthlyRent / allInCost) * 1000) / 10 : 0;
  const onePercentRulePass = onePercentRuleActual >= 1;
  const fiftyPercentRuleActual =
    grossMonthlyRent > 0 ? round2((totalMonthlyExpenses / grossMonthlyRent) * 1000) / 10 : 0;
  const fiftyPercentRulePass = fiftyPercentRuleActual <= 50;

  const { score, breakdown } = computeScore({
    cashLeftInDeal,
    totalCashInvested,
    cashOnCashReturn,
    monthlyCashFlowPerUnit,
    capRate,
    dscr,
  });

  return {
    purchasePrice,
    closingCosts,
    rehabBudget: rehab,
    holdingCosts,
    totalCashInvested,
    arv,
    refiLoanAmount,
    refiClosingCosts,
    cashOutAtRefi,
    cashLeftInDeal,
    monthlyPI,
    grossMonthlyRent,
    vacancyLoss,
    managementFee,
    maintenanceReserve,
    insuranceMonthly,
    taxesMonthly,
    totalMonthlyExpenses,
    monthlyCashFlow,
    annualCashFlow,
    monthlyCashFlowPerUnit,
    noiAnnual,
    capRate,
    cashOnCashReturn,
    dscr,
    onePercentRuleActual,
    onePercentRulePass,
    fiftyPercentRuleActual,
    fiftyPercentRulePass,
    score,
    scoreBreakdown: breakdown,
  };
}

function computeScore(input: {
  cashLeftInDeal: number;
  totalCashInvested: number;
  cashOnCashReturn: number | null;
  monthlyCashFlowPerUnit: number;
  capRate: number;
  dscr: number;
}): { score: number; breakdown: { label: string; score: number; weight: number }[] } {
  // % of original cash still stuck in the deal after refi — 0% (all cash back out) is ideal.
  const cashLeftPct =
    input.totalCashInvested > 0 ? (input.cashLeftInDeal / input.totalCashInvested) * 100 : 100;
  const cashRecycledScore = 100 - scale(cashLeftPct, 0, 100);

  const cocScore = input.cashOnCashReturn === null ? 100 : scale(input.cashOnCashReturn, 0, 25);
  const cashFlowScore = scale(input.monthlyCashFlowPerUnit, 0, 250);
  const capRateScore = scale(input.capRate, 3, 10);
  const dscrScore = scale(input.dscr, 1.0, 1.6);

  const weights = [
    { label: 'Cash recycled at refi', score: cashRecycledScore, weight: 0.3 },
    { label: 'Cash-on-cash return', score: cocScore, weight: 0.25 },
    { label: 'Cash flow per unit', score: cashFlowScore, weight: 0.2 },
    { label: 'Cap rate', score: capRateScore, weight: 0.15 },
    { label: 'Debt service coverage', score: dscrScore, weight: 0.1 },
  ];

  const score = Math.round(weights.reduce((s, w) => s + w.score * w.weight, 0));
  return { score, breakdown: weights.map((w) => ({ ...w, score: Math.round(w.score) })) };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
