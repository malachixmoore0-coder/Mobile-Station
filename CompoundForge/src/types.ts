export type Settings = {
  startingBalance: number;
  dailyTargetRate: number; // e.g. 0.10 for 10% per trading day
  defaultReinvestPct: number; // 0..1, default reinvest slider position
  weekendsActive: boolean; // true = weekends count as trading days
  username: string;
  avatarUri: string | null;
  onboarded: boolean;
  startDate: string; // ISO date the journey began
};

export type LedgerEntry = {
  id: string;
  day: number;
  date: string; // ISO date
  excluded: boolean;
  earnings: number;
  reinvestPct: number;
  reinvestAmount: number;
  cashOut: number;
  totalPrincipal: number;
  totalCash: number;
  endBalance: number;
  kind: 'trade' | 'manual' | 'excluded';
  note?: string;
};

export type Goal = {
  id: string;
  label: string;
  targetAmount: number;
  createdAt: string;
  achievedAt: string | null;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export type Tier = {
  id: string;
  name: string;
  min: number;
  max: number | null;
  color: string;
  glow: string;
  secondary: string;
  detail: number;
};

export type AppState = {
  loaded: boolean;
  settings: Settings;
  ledger: LedgerEntry[];
  goals: Goal[];
  unlockedAchievements: Record<string, string>; // id -> ISO date unlocked
};

export type MarketSymbol = {
  id: string;
  label: string;
  fullName: string;
  basePrice: number;
  volatility: number;
  color: string;
};
