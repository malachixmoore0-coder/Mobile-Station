import { LedgerEntry, Settings } from '@/types';
import { addDays, isWeekend, toISODate } from '@/utils/dates';

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export type Totals = { totalPrincipal: number; totalCash: number; day: number; date: string };

export function baselineTotals(settings: Settings): Totals {
  return { totalPrincipal: settings.startingBalance, totalCash: 0, day: 0, date: settings.startDate };
}

export function getLatest(ledger: LedgerEntry[], settings: Settings): Totals {
  if (ledger.length === 0) return baselineTotals(settings);
  const last = ledger[ledger.length - 1];
  return { totalPrincipal: last.totalPrincipal, totalCash: last.totalCash, day: last.day, date: last.date };
}

export function currentBalance(ledger: LedgerEntry[], settings: Settings): number {
  const t = getLatest(ledger, settings);
  return t.totalPrincipal + t.totalCash;
}

export function logTrade(
  ledger: LedgerEntry[],
  settings: Settings,
  params: { earnings: number; reinvestPct: number; note?: string }
): LedgerEntry {
  const latest = getLatest(ledger, settings);
  const reinvestAmount = params.earnings > 0 ? params.earnings * params.reinvestPct : params.earnings;
  const cashOut = params.earnings > 0 ? params.earnings - reinvestAmount : 0;
  const totalPrincipal = latest.totalPrincipal + reinvestAmount;
  const totalCash = latest.totalCash + cashOut;
  return {
    id: generateId(),
    day: latest.day + 1,
    date: toISODate(new Date()),
    excluded: false,
    earnings: params.earnings,
    reinvestPct: params.reinvestPct,
    reinvestAmount,
    cashOut,
    totalPrincipal,
    totalCash,
    endBalance: totalPrincipal + totalCash,
    kind: 'trade',
    note: params.note,
  };
}

export function logManualBalance(ledger: LedgerEntry[], settings: Settings, newBalance: number, note?: string): LedgerEntry {
  const latest = getLatest(ledger, settings);
  const currentEnd = latest.totalPrincipal + latest.totalCash;
  const delta = newBalance - currentEnd;
  return {
    id: generateId(),
    day: latest.day + 1,
    date: toISODate(new Date()),
    excluded: false,
    earnings: delta,
    reinvestPct: 1,
    reinvestAmount: delta,
    cashOut: 0,
    totalPrincipal: latest.totalPrincipal + delta,
    totalCash: latest.totalCash,
    endBalance: newBalance,
    kind: 'manual',
    note: note ?? 'Manual balance update',
  };
}

export function computeStreak(ledger: LedgerEntry[]): { current: number; best: number } {
  let current = 0;
  for (let i = ledger.length - 1; i >= 0; i--) {
    const e = ledger[i];
    if (e.kind === 'manual') continue;
    if (e.earnings > 0) current++;
    else break;
  }
  let best = 0;
  let run = 0;
  for (const e of ledger) {
    if (e.kind === 'manual') continue;
    if (e.earnings > 0) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return { current, best: Math.max(best, current) };
}

export function winRate(ledger: LedgerEntry[]): number {
  const trades = ledger.filter((e) => e.kind === 'trade');
  if (trades.length === 0) return 0;
  return trades.filter((e) => e.earnings > 0).length / trades.length;
}

export type ProjectionPoint = { date: string; balance: number; trading: boolean };

export function projectForward(
  startBalance: number,
  dailyRate: number,
  weekendsActive: boolean,
  startDate: string,
  tradingDays: number
): ProjectionPoint[] {
  const points: ProjectionPoint[] = [{ date: startDate, balance: startBalance, trading: false }];
  let balance = startBalance;
  let date = startDate;
  let counted = 0;
  let guard = 0;
  while (counted < tradingDays && guard < tradingDays * 3 + 30) {
    guard++;
    date = addDays(date, 1);
    if (!weekendsActive && isWeekend(date)) {
      points.push({ date, balance, trading: false });
      continue;
    }
    balance = balance * (1 + dailyRate);
    counted++;
    points.push({ date, balance, trading: true });
  }
  return points;
}

export function daysToGoal(
  startBalance: number,
  dailyRate: number,
  weekendsActive: boolean,
  startDate: string,
  goal: number,
  maxCalendarDays = 5000
): { calendarDays: number; tradingDays: number; reached: boolean; finalBalance: number; finalDate: string } {
  let balance = startBalance;
  let date = startDate;
  let tradingDays = 0;
  let calendarDays = 0;
  if (balance >= goal) return { calendarDays: 0, tradingDays: 0, reached: true, finalBalance: balance, finalDate: date };
  while (balance < goal && calendarDays < maxCalendarDays) {
    date = addDays(date, 1);
    calendarDays++;
    if (!weekendsActive && isWeekend(date)) continue;
    balance *= 1 + dailyRate;
    tradingDays++;
  }
  return { calendarDays, tradingDays, reached: balance >= goal, finalBalance: balance, finalDate: date };
}
