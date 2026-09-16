import { DayIndex } from '@/types';

/** Local-time YYYY-MM-DD. Never use toISOString here — it shifts the day in UTC-. */
export function dateKey(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export function dayIndex(d: Date): DayIndex {
  return d.getDay() as DayIndex;
}

/** Minutes from midnight -> "7:30 AM". */
export function clock(minutes: number): string {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${`${m}`.padStart(2, '0')} ${suffix}`;
}

export function minutesOfDay(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

/** "Today", "Yesterday", or "Thu, Sep 18". */
export function prettyDate(d: Date, today = new Date()): string {
  if (dateKey(d) === dateKey(today)) return 'Today';
  if (dateKey(d) === dateKey(addDays(today, -1))) return 'Yesterday';
  if (dateKey(d) === dateKey(addDays(today, 1))) return 'Tomorrow';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

/** "in 25m" / "35m ago" relative to the current minute of the day. */
export function relativeToNow(blockMinutes: number, nowMinutes: number): string {
  const delta = blockMinutes - nowMinutes;
  const abs = Math.abs(delta);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const span = h > 0 ? `${h}h ${m}m` : `${m}m`;
  if (delta > 0) return `in ${span}`;
  if (delta < 0) return `${span} ago`;
  return 'now';
}

export function mmss(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${`${s}`.padStart(2, '0')}`;
}
