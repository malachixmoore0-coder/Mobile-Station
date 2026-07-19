import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Goal, LedgerEntry, Settings } from '@/types';
import { loadState, saveState } from '@/utils/storage';
import {
  computeStreak,
  currentBalance,
  generateId,
  logManualBalance as logManualBalanceEntry,
  logTrade as logTradeEntry,
  winRate as computeWinRate,
} from '@/engine/compound';
import { getTier, getNextTier, tierProgress } from '@/data/tiers';
import { ACHIEVEMENTS, AchievementDef } from '@/data/achievements';
import { toISODate } from '@/utils/dates';

const DEFAULT_SETTINGS: Settings = {
  startingBalance: 50,
  dailyTargetRate: 0.1,
  defaultReinvestPct: 1,
  weekendsActive: false,
  username: 'Trader',
  avatarUri: null,
  onboarded: false,
  startDate: toISODate(new Date()),
};

type Ctx = {
  loaded: boolean;
  settings: Settings;
  ledger: LedgerEntry[];
  goals: Goal[];
  unlockedAchievements: Record<string, string>;
  balance: number;
  tier: ReturnType<typeof getTier>;
  nextTier: ReturnType<typeof getNextTier>;
  tierProgress: number;
  streak: { current: number; best: number };
  winRate: number;
  recentlyUnlocked: AchievementDef[];
  clearRecentlyUnlocked: () => void;
  completeOnboarding: (partial: Partial<Settings>) => void;
  updateSettings: (partial: Partial<Settings>) => void;
  updateProfile: (partial: Pick<Settings, 'username' | 'avatarUri'>) => void;
  logTrade: (earnings: number, reinvestPct: number, note?: string) => void;
  logManualBalance: (newBalance: number, note?: string) => void;
  addGoal: (label: string, targetAmount: number) => void;
  deleteGoal: (id: string) => void;
  resetAll: () => void;
};

const AppStateCtx = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Record<string, string>>({});
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<AchievementDef[]>([]);
  const hydrating = useRef(true);

  useEffect(() => {
    (async () => {
      const saved = await loadState();
      if (saved) {
        if (saved.settings) setSettings({ ...DEFAULT_SETTINGS, ...saved.settings });
        if (saved.ledger) setLedger(saved.ledger);
        if (saved.goals) setGoals(saved.goals);
        if (saved.unlockedAchievements) setUnlockedAchievements(saved.unlockedAchievements);
      }
      hydrating.current = false;
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (hydrating.current) return;
    saveState({ settings, ledger, goals, unlockedAchievements });
  }, [settings, ledger, goals, unlockedAchievements]);

  const balance = useMemo(() => currentBalance(ledger, settings), [ledger, settings]);
  const tier = useMemo(() => getTier(balance), [balance]);
  const nextTier = useMemo(() => getNextTier(balance), [balance]);
  const progress = useMemo(() => tierProgress(balance), [balance]);
  const streak = useMemo(() => computeStreak(ledger), [ledger]);
  const winRate = useMemo(() => computeWinRate(ledger), [ledger]);

  const evaluateAchievements = useCallback(
    (nextLedger: LedgerEntry[], nextGoals: Goal[]) => {
      const nextBalance = currentBalance(nextLedger, settings);
      const ctx = { ledger: nextLedger, settings, goals: nextGoals, balance: nextBalance, streak: computeStreak(nextLedger) };
      const newlyUnlocked: AchievementDef[] = [];
      setUnlockedAchievements((prev) => {
        const next = { ...prev };
        for (const def of ACHIEVEMENTS) {
          if (next[def.id]) continue;
          if (def.check(ctx)) {
            next[def.id] = new Date().toISOString();
            newlyUnlocked.push(def);
          }
        }
        return next;
      });
      if (newlyUnlocked.length > 0) {
        setRecentlyUnlocked((prev) => [...prev, ...newlyUnlocked]);
      }
    },
    [settings]
  );

  const completeOnboarding = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial, onboarded: true, startDate: toISODate(new Date()) }));
  }, []);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const updateProfile = useCallback((partial: Pick<Settings, 'username' | 'avatarUri'>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const logTrade = useCallback(
    (earnings: number, reinvestPct: number, note?: string) => {
      setLedger((prev) => {
        const entry = logTradeEntry(prev, settings, { earnings, reinvestPct, note });
        const next = [...prev, entry];
        setGoals((prevGoals) => {
          const nextBalance = entry.endBalance;
          const nextGoals = prevGoals.map((g) =>
            !g.achievedAt && nextBalance >= g.targetAmount ? { ...g, achievedAt: new Date().toISOString() } : g
          );
          evaluateAchievements(next, nextGoals);
          return nextGoals;
        });
        return next;
      });
    },
    [settings, evaluateAchievements]
  );

  const logManualBalance = useCallback(
    (newBalance: number, note?: string) => {
      setLedger((prev) => {
        const entry = logManualBalanceEntry(prev, settings, newBalance, note);
        const next = [...prev, entry];
        setGoals((prevGoals) => {
          const nextGoals = prevGoals.map((g) =>
            !g.achievedAt && newBalance >= g.targetAmount ? { ...g, achievedAt: new Date().toISOString() } : g
          );
          evaluateAchievements(next, nextGoals);
          return nextGoals;
        });
        return next;
      });
    },
    [settings, evaluateAchievements]
  );

  const addGoal = useCallback((label: string, targetAmount: number) => {
    setGoals((prev) => [
      ...prev,
      { id: generateId(), label, targetAmount, createdAt: new Date().toISOString(), achievedAt: null },
    ]);
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const clearRecentlyUnlocked = useCallback(() => setRecentlyUnlocked([]), []);

  const resetAll = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setLedger([]);
    setGoals([]);
    setUnlockedAchievements({});
    setRecentlyUnlocked([]);
  }, []);

  const value: Ctx = {
    loaded,
    settings,
    ledger,
    goals,
    unlockedAchievements,
    balance,
    tier,
    nextTier,
    tierProgress: progress,
    streak,
    winRate,
    recentlyUnlocked,
    clearRecentlyUnlocked,
    completeOnboarding,
    updateSettings,
    updateProfile,
    logTrade,
    logManualBalance,
    addGoal,
    deleteGoal,
    resetAll,
  };

  return <AppStateCtx.Provider value={value}>{children}</AppStateCtx.Provider>;
}

export function useAppState(): Ctx {
  const ctx = useContext(AppStateCtx);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
