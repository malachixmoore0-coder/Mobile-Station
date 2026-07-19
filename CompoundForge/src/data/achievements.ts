import { Goal, LedgerEntry, Settings } from '@/types';

export type AchievementContext = {
  ledger: LedgerEntry[];
  settings: Settings;
  goals: Goal[];
  balance: number;
  streak: { current: number; best: number };
};

export type AchievementDef = {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (ctx: AchievementContext) => boolean;
};

const trades = (ctx: AchievementContext) => ctx.ledger.filter((e) => e.kind === 'trade');

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-log',
    title: 'First Blood',
    description: 'Log your first trade',
    icon: '🎯',
    check: (ctx) => trades(ctx).length >= 1,
  },
  {
    id: 'five-logs',
    title: 'In The Habit',
    description: 'Log 5 trading days',
    icon: '📈',
    check: (ctx) => trades(ctx).length >= 5,
  },
  {
    id: 'twenty-logs',
    title: 'Grinder',
    description: 'Log 20 trading days',
    icon: '⚙️',
    check: (ctx) => trades(ctx).length >= 20,
  },
  {
    id: 'streak-3',
    title: 'Warming Up',
    description: 'Hit a 3-day win streak',
    icon: '🔥',
    check: (ctx) => ctx.streak.best >= 3,
  },
  {
    id: 'streak-7',
    title: 'On Fire',
    description: 'Hit a 7-day win streak',
    icon: '🔥',
    check: (ctx) => ctx.streak.best >= 7,
  },
  {
    id: 'streak-14',
    title: 'Unstoppable',
    description: 'Hit a 14-day win streak',
    icon: '⚡',
    check: (ctx) => ctx.streak.best >= 14,
  },
  {
    id: 'streak-30',
    title: 'Iron Discipline',
    description: 'Hit a 30-day win streak',
    icon: '🛡️',
    check: (ctx) => ctx.streak.best >= 30,
  },
  {
    id: 'reach-100',
    title: 'Triple Digits',
    description: 'Reach $100',
    icon: '💵',
    check: (ctx) => ctx.balance >= 100,
  },
  {
    id: 'reach-500',
    title: 'Half a Grand',
    description: 'Reach $500',
    icon: '💰',
    check: (ctx) => ctx.balance >= 500,
  },
  {
    id: 'reach-1000',
    title: 'Four Figures',
    description: 'Reach $1,000',
    icon: '💎',
    check: (ctx) => ctx.balance >= 1000,
  },
  {
    id: 'reach-5000',
    title: 'High Roller',
    description: 'Reach $5,000',
    icon: '🎰',
    check: (ctx) => ctx.balance >= 5000,
  },
  {
    id: 'reach-10000',
    title: 'Five Figures',
    description: 'Reach $10,000',
    icon: '🏆',
    check: (ctx) => ctx.balance >= 10000,
  },
  {
    id: 'reach-25000',
    title: 'Quarter Master',
    description: 'Reach $25,000',
    icon: '👑',
    check: (ctx) => ctx.balance >= 25000,
  },
  {
    id: 'reach-50000',
    title: 'Half Century',
    description: 'Reach $50,000',
    icon: '🚀',
    check: (ctx) => ctx.balance >= 50000,
  },
  {
    id: 'reach-100000',
    title: 'Six Figure Trader',
    description: 'Reach $100,000',
    icon: '🌟',
    check: (ctx) => ctx.balance >= 100000,
  },
  {
    id: 'doubled',
    title: 'Doubled Up',
    description: 'Double your starting balance',
    icon: '✖️',
    check: (ctx) => ctx.balance >= ctx.settings.startingBalance * 2,
  },
  {
    id: 'tenx',
    title: '10x Club',
    description: 'Grow 10x from your starting balance',
    icon: '🔟',
    check: (ctx) => ctx.balance >= ctx.settings.startingBalance * 10,
  },
  {
    id: 'hundredx',
    title: 'Legendary Compounder',
    description: 'Grow 100x from your starting balance',
    icon: '🏔️',
    check: (ctx) => ctx.balance >= ctx.settings.startingBalance * 100,
  },
  {
    id: 'comeback',
    title: 'Comeback Kid',
    description: 'Bounce back with a win right after a loss',
    icon: '🔁',
    check: (ctx) => {
      const t = trades(ctx);
      for (let i = 1; i < t.length; i++) {
        if (t[i - 1].earnings < 0 && t[i].earnings > 0) return true;
      }
      return false;
    },
  },
  {
    id: 'goal-crusher',
    title: 'Goal Crusher',
    description: 'Achieve a custom goal',
    icon: '🥇',
    check: (ctx) => ctx.goals.some((g) => !!g.achievedAt),
  },
];
