import React, { createContext, useContext, useMemo, useState } from 'react';
import { ACCOUNTS, Account } from '@/data/portfolio';

interface SettingsState {
  /** Active account in the switcher. */
  account: Account;
  setAccountId: (id: string) => void;
  /** Privacy mode — masks every balance with dots (a real Phantom feature). */
  hideBalances: boolean;
  toggleHideBalances: () => void;
  /** Whether the honest "simulated balances" notes are shown. */
  showDemoLabels: boolean;
  setShowDemoLabels: (v: boolean) => void;
  faceIdEnabled: boolean;
  setFaceIdEnabled: (v: boolean) => void;
  currency: string;
  setCurrency: (c: string) => void;
  network: string;
  setNetwork: (n: string) => void;
  testnetMode: boolean;
  setTestnetMode: (v: boolean) => void;
}

const SettingsContext = createContext<SettingsState | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [accountId, setAccountId] = useState(ACCOUNTS[0].id);
  const [hideBalances, setHideBalances] = useState(false);
  const [showDemoLabels, setShowDemoLabels] = useState(true);
  const [faceIdEnabled, setFaceIdEnabled] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [network, setNetwork] = useState('All networks');
  const [testnetMode, setTestnetMode] = useState(false);

  const value = useMemo<SettingsState>(() => {
    const account = ACCOUNTS.find((a) => a.id === accountId) ?? ACCOUNTS[0];
    return {
      account,
      setAccountId,
      hideBalances,
      toggleHideBalances: () => setHideBalances((v) => !v),
      showDemoLabels,
      setShowDemoLabels,
      faceIdEnabled,
      setFaceIdEnabled,
      currency,
      setCurrency,
      network,
      setNetwork,
      testnetMode,
      setTestnetMode,
    };
  }, [accountId, hideBalances, showDemoLabels, faceIdEnabled, currency, network, testnetMode]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsState {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

/** Helper: mask a formatted value when privacy mode is on. */
export function maskValue(formatted: string, hidden: boolean): string {
  return hidden ? '••••••' : formatted;
}
