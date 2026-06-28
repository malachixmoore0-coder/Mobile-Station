import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Token, TOKEN_SEEDS, CASH_USD } from '@/data/portfolio';

export interface BankTransfer {
  id: string;
  amount: number;
  bankLast4: string;
  date: number;
}

interface WalletState {
  tokens: Token[];
  cash: number;
  /** Tokens value only (excludes cash). */
  tokensValue: number;
  /** Headline balance = tokens + cash. */
  totalValue: number;
  change24hUsd: number;
  change24hPct: number;
  tick: number;
  lastUp: boolean;
  lastTransfer: BankTransfer | null;
  /** Spend `usd` of cash to buy `symbol` at the live price. */
  buy: (symbol: string, usd: number) => { ok: boolean; reason?: string };
  /** Sell `tokenAmount` of `symbol` back to cash at the live price. */
  sell: (symbol: string, tokenAmount: number) => { ok: boolean; reason?: string };
  /** Withdraw `usd` to a bank — drains cash first, then liquidates tokens pro-rata. */
  withdrawToBank: (usd: number, bankLast4: string) => { ok: boolean; reason?: string };
}

const WalletContext = createContext<WalletState | null>(null);

const TICK_MS = 1600;

/**
 * Stateful, simulated wallet. Holdings (per-token amounts) and a cash balance
 * are mutable: you can buy with cash, sell back to cash, and "send to bank"
 * which lowers the headline balance. Prices random-walk every tick, so buying
 * and waiting for a rise then selling really does grow the cash balance.
 * Entirely client-side theatre — no keys, no chain, no funds.
 */
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [amounts, setAmounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(TOKEN_SEEDS.map((s) => [s.symbol, s.amount])),
  );
  const [prices, setPrices] = useState<Record<string, number>>(() =>
    Object.fromEntries(TOKEN_SEEDS.map((s) => [s.symbol, s.basePrice])),
  );
  const [changes, setChanges] = useState<Record<string, number>>(() =>
    Object.fromEntries(TOKEN_SEEDS.map((s) => [s.symbol, s.change24h])),
  );
  const [cash, setCash] = useState(CASH_USD);
  const [tick, setTick] = useState(0);
  const [lastUp, setLastUp] = useState(true);
  const [lastTransfer, setLastTransfer] = useState<BankTransfer | null>(null);
  const prevTotal = useRef(TOKEN_SEEDS.reduce((sum, s) => sum + s.amount * s.basePrice, 0) + CASH_USD);

  useEffect(() => {
    const id = setInterval(() => {
      setPrices((prev) => {
        const next: Record<string, number> = {};
        for (const s of TOKEN_SEEDS) {
          const isStable = s.symbol === 'USDC';
          const vol = isStable ? 0.0004 : s.symbol === 'BONK' || s.symbol === 'WIF' ? 0.006 : 0.0025;
          const bias = 0.0006;
          const pct = (Math.random() - 0.5) * 2 * vol + bias;
          let p = prev[s.symbol] * (1 + pct);
          if (isStable) p = 1 + (Math.random() - 0.5) * 0.0008;
          next[s.symbol] = p;
        }
        return next;
      });
      setChanges((prev) => {
        const next: Record<string, number> = {};
        for (const s of TOKEN_SEEDS) next[s.symbol] = prev[s.symbol] + (Math.random() - 0.5) * 0.08;
        return next;
      });
      setTick((n) => n + 1);
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const tokens = useMemo<Token[]>(
    () =>
      TOKEN_SEEDS.map((s) => {
        const price = prices[s.symbol];
        const amount = amounts[s.symbol];
        return { ...s, amount, price, change24h: changes[s.symbol], value: amount * price };
      }),
    [prices, amounts, changes],
  );

  const tokensValue = useMemo(() => tokens.reduce((sum, t) => sum + t.value, 0), [tokens]);
  const totalValue = tokensValue + cash;

  useEffect(() => {
    setLastUp(totalValue >= prevTotal.current);
    prevTotal.current = totalValue;
  }, [totalValue]);

  const buy = (symbol: string, usd: number) => {
    if (!(usd > 0)) return { ok: false, reason: 'Enter an amount' };
    if (usd > cash + 1e-6) return { ok: false, reason: 'Not enough cash' };
    const price = prices[symbol];
    if (!price) return { ok: false, reason: 'Unknown token' };
    setCash((c) => c - usd);
    setAmounts((a) => ({ ...a, [symbol]: a[symbol] + usd / price }));
    return { ok: true };
  };

  const sell = (symbol: string, tokenAmount: number) => {
    if (!(tokenAmount > 0)) return { ok: false, reason: 'Enter an amount' };
    if (tokenAmount > amounts[symbol] + 1e-9) return { ok: false, reason: 'Not enough balance' };
    const proceeds = tokenAmount * prices[symbol];
    setAmounts((a) => ({ ...a, [symbol]: a[symbol] - tokenAmount }));
    setCash((c) => c + proceeds);
    return { ok: true };
  };

  const withdrawToBank = (usd: number, bankLast4: string) => {
    if (!(usd > 0)) return { ok: false, reason: 'Enter an amount' };
    if (usd > totalValue + 1e-6) return { ok: false, reason: 'Amount exceeds balance' };
    // Take from cash first; cover the remainder by liquidating tokens pro-rata.
    const fromCash = Math.min(cash, usd);
    let remainder = usd - fromCash;
    setCash((c) => c - fromCash);
    if (remainder > 0 && tokensValue > 0) {
      const frac = remainder / tokensValue;
      setAmounts((a) => {
        const next = { ...a };
        for (const s of TOKEN_SEEDS) next[s.symbol] = a[s.symbol] * (1 - frac);
        return next;
      });
    }
    setLastTransfer({ id: `${Date.now()}`, amount: usd, bankLast4, date: Date.now() });
    return { ok: true };
  };

  const change24hUsd = useMemo(() => {
    const prevValue = tokens.reduce((sum, t) => sum + t.value / (1 + t.change24h / 100), 0);
    return tokensValue - prevValue;
  }, [tokens, tokensValue]);
  const change24hPct = tokensValue - change24hUsd > 0 ? (change24hUsd / (tokensValue - change24hUsd)) * 100 : 0;

  const value = useMemo<WalletState>(
    () => ({
      tokens,
      cash,
      tokensValue,
      totalValue,
      change24hUsd,
      change24hPct,
      tick,
      lastUp,
      lastTransfer,
      buy,
      sell,
      withdrawToBank,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokens, cash, tokensValue, totalValue, change24hUsd, change24hPct, tick, lastUp, lastTransfer],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}

export function useToken(symbol: string): Token | undefined {
  const { tokens } = useWallet();
  return tokens.find((t) => t.symbol === symbol);
}
