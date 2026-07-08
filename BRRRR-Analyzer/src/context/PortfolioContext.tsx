import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DealRecord, DealStage, PropertyOverride } from '@/services/types';

const STORAGE_KEY = 'brrrr-scout.deals.v2';

function newDeal(stage: DealStage = 'watching'): DealRecord {
  return { stage, stageHistory: [{ stage, at: Date.now() }], checkedSteps: [], override: {} };
}

interface PortfolioState {
  deals: Record<string, DealRecord>;
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => void;

  getStage: (id: string) => DealStage | undefined;
  setStage: (id: string, stage: DealStage) => void;

  isStepChecked: (id: string, stepId: string) => boolean;
  toggleStep: (id: string, stepId: string) => void;

  getOverride: (id: string) => PropertyOverride;
  setOverride: (id: string, patch: PropertyOverride) => void;

  loaded: boolean;
}

const PortfolioContext = createContext<PortfolioState | null>(null);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [deals, setDeals] = useState<Record<string, DealRecord>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setDeals(JSON.parse(raw));
      } catch {
        // fall back to empty pipeline
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persist = (next: Record<string, DealRecord>) => {
    setDeals(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  };

  const isSaved = (id: string) => !!deals[id];

  const toggleSaved = (id: string) => {
    const next = { ...deals };
    if (next[id]) {
      delete next[id];
    } else {
      next[id] = newDeal();
    }
    persist(next);
  };

  const getStage = (id: string) => deals[id]?.stage;

  const setStage = (id: string, stage: DealStage) => {
    const current = deals[id] ?? newDeal(stage);
    if (current.stage === stage && deals[id]) return;
    const next = {
      ...deals,
      [id]: { ...current, stage, stageHistory: [...current.stageHistory, { stage, at: Date.now() }] },
    };
    persist(next);
  };

  const isStepChecked = (id: string, stepId: string) => !!deals[id]?.checkedSteps.includes(stepId);

  const toggleStep = (id: string, stepId: string) => {
    const current = deals[id] ?? newDeal();
    const checked = current.checkedSteps.includes(stepId)
      ? current.checkedSteps.filter((s) => s !== stepId)
      : [...current.checkedSteps, stepId];
    persist({ ...deals, [id]: { ...current, checkedSteps: checked } });
  };

  const getOverride = (id: string): PropertyOverride => deals[id]?.override ?? {};

  const setOverride = (id: string, patch: PropertyOverride) => {
    const current = deals[id] ?? newDeal();
    persist({ ...deals, [id]: { ...current, override: patch } });
  };

  return (
    <PortfolioContext.Provider
      value={{
        deals,
        savedIds: Object.keys(deals),
        isSaved,
        toggleSaved,
        getStage,
        setStage,
        isStepChecked,
        toggleStep,
        getOverride,
        setOverride,
        loaded,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio(): PortfolioState {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider');
  return ctx;
}
