import { Lender, LenderCategory } from '@/services/types';
import { MOCK_LENDERS } from '@/data/mockLenders';

/** Higher is better: rewards low rate + low points + fast close. */
export function lenderScore(l: Lender): number {
  const rateScore = Math.max(0, 15 - l.ratesFromPct) * 4;
  const pointsScore = Math.max(0, 3 - l.pointsFrom) * 6;
  const speedScore = Math.max(0, 45 - l.closingTimelineDays) / 2;
  return Math.round(rateScore + pointsScore + speedScore);
}

export function lendersForCategory(category: LenderCategory, state?: string): Lender[] {
  const matches = MOCK_LENDERS.filter((l) => l.categories.includes(category));
  const scoped = state ? matches.filter((l) => l.statesServed.includes(state)) : matches;
  const pool = scoped.length > 0 ? scoped : matches;
  return [...pool].sort((a, b) => lenderScore(b) - lenderScore(a));
}
