import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Token, TOKEN_SEEDS, CASH_USD, ACCOUNTS } from '@/data/portfolio';
import { useSettings } from '@/context/SettingsContext';

const STORAGE_KEY = 'phantom-wallet-books-v2';

/** Per-account holdings + cash. */
interface Book {
  amounts: Record<string, number>;
  cash: number;
}

const MAIN_TOKENS_VALUE = TOKEN_SEEDS.reduce((sum, s) => sum + s.amount * s.basePrice, 0);

/** A believable starting book for an account, scaled to its headline total. */
function defaultBook(accountId: string): Book {
  const acct = ACCOUNTS.find((a) => a.id === accountId) ?? ACCOUNTS[0];
  const scale = acct.total / MAIN_TOKENS_VALUE;
  return {
    amounts: Object.fromEntries(TOKEN_SEEDS.map((s) => [s.symbol, s.amount * scale])),
    cash: CASH_USD * scale,
  };
}

function initialBooks(): Record<string, Book> {
  return Object.fromEntries(ACCOUNTS.map((a) => [a.id, defaultBook(a.id)]));
}

export interface BankTransfer {
  id: string;
  amount: number;
  bankLast4: string;
  date: number;
}

interface WalletState {
  tokens: Token[];
  cash: number;
  tokensValue: number;
  totalValue: number;
  change24hUsd: number;
  change24hPct: number;
  tick: number;
  lastUp: boolean;
  lastTransfer: BankTransfer | null;
  buy: (symbol: string, usd: number) => { ok: boolean; reason?: string };
  sell: (symbol: string, tokenAmount: number) => { ok: boolean; reason?: string };
  withdrawToBank: (usd: number, bankLast4: string) => { ok: boolean; reason?: string };
  /** Deposit `usd` into the active account's cash balance. */
  addCash: (usd: number) => { ok: boolean; reason?: string };
  /** Restore the active account's starting holdings + cash. */
  resetWallet: () => void;
}

const WalletContext = createContext<WalletState | null>(null);

const TICK_MS = 1600;

/**
 * Stateful, per-account simulated wallet. Each account keeps its own holdings
 * and cash "book"; switching accounts (via Settings) swaps the whole portfolio.
 * You can buy/sell against cash, add money, and send to a bank. Prices random-
 * walk every tick. Persisted to storage. No keys, no chain, no funds.
 */
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { account } = useSettings();
  const activeId = account.id;

  const [books, setBooks] = useState<Record<string, Book>>(initialBooks);
  const [prices, setPrices] = useState<Record<string, number>>(() =>
    Object.fromEntries(TOKEN_SEEDS.map((s) => [s.symbol, s.basePrice])),
  );
  const [changes, setChanges] = useState<Record<string, number>>(() =>
    Object.fromEntries(TOKEN_SEEDS.map((s) => [s.symbol, s.change24h])),
  );
  const [tick, setTick] = useState(0);
  const [lastUp, setLastUp] = useState(true);
  const [lastTransfer, setLastTransfer] = useState<BankTransfer | null>(null);
  const prevTotal = useRef(MAIN_TOKENS_VALUE + CASH_USD);
  const hydrated = useRef(false);

  const book = books[activeId] ?? defaultBook(activeId);

  /** Update the active account's book. */
  const updateBook = (fn: (b: Book) => Book) =>
    setBooks((prev) => ({ ...prev, [activeId]: fn(prev[activeId] ?? defaultBook(activeId)) }));

  // Load persisted books on mount.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const s = JSON.parse(raw);
          if (s.books) setBooks((prev) => ({ ...prev, ...s.books }));
          if (s.lastTransfer) setLastTransfer(s.lastTransfer);
        }
      } catch {
        // ignore corrupt/unavailable storage
      }
      hydrated.current = true;
    })();
  }, []);

  // Persist books after the initial load.
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ books, lastTransfer })).catch(() => {});
  }, [books, lastTransfer]);

  // Live market simulation (shared across accounts).
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
        const amount = book.amounts[s.symbol] ?? 0;
        return { ...s, amount, price, change24h: changes[s.symbol], value: amount * price };
      }),
    [prices, book, changes],
  );

  const tokensValue = useMemo(() => tokens.reduce((sum, t) => sum + t.value, 0), [tokens]);
  const cash = book.cash;
  const totalValue = tokensValue + cash;

  useEffect(() => {
    setLastUp(totalValue >= prevTotal.current);
    prevTotal.current = totalValue;
  }, [totalValue]);

  const buy = (symbol: string, usd: number) => {
    if (!(usd > 0)) return { ok: false, reason: 'Enter an amount' };
    if (usd > book.cash + 1e-6) return { ok: false, reason: 'Not enough cash' };
    const price = prices[symbol];
    if (!price) return { ok: false, reason: 'Unknown token' };
    updateBook((b) => ({ cash: b.cash - usd, amounts: { ...b.amounts, [symbol]: b.amounts[symbol] + usd / price } }));
    return { ok: true };
  };

  const sell = (symbol: string, tokenAmount: number) => {
    if (!(tokenAmount > 0)) return { ok: false, reason: 'Enter an amount' };
    if (tokenAmount > book.amounts[symbol] + 1e-9) return { ok: false, reason: 'Not enough balance' };
    const proceeds = tokenAmount * prices[symbol];
    updateBook((b) => ({ cash: b.cash + proceeds, amounts: { ...b.amounts, [symbol]: b.amounts[symbol] - tokenAmount } }));
    return { ok: true };
  };

  const withdrawToBank = (usd: number, bankLast4: string) => {
    if (!(usd > 0)) return { ok: false, reason: 'Enter an amount' };
    if (usd > totalValue + 1e-6) return { ok: false, reason: 'Amount exceeds balance' };
    updateBook((b) => {
      const bTokensValue = TOKEN_SEEDS.reduce((sum, s) => sum + (b.amounts[s.symbol] ?? 0) * prices[s.symbol], 0);
      const fromCash = Math.min(b.cash, usd);
      const remainder = usd - fromCash;
      const amounts = { ...b.amounts };
      if (remainder > 0 && bTokensValue > 0) {
        const frac = remainder / bTokensValue;
        for (const s of TOKEN_SEEDS) amounts[s.symbol] = (amounts[s.symbol] ?? 0) * (1 - frac);
      }
      return { cash: b.cash - fromCash, amounts };
    });
    setLastTransfer({ id: `${Date.now()}`, amount: usd, bankLast4, date: Date.now() });
    return { ok: true };
  };

  const addCash = (usd: number) => {
    if (!(usd > 0)) return { ok: false, reason: 'Enter an amount' };
    updateBook((b) => ({ ...b, cash: b.cash + usd }));
    return { ok: true };
  };

  const resetWallet = () => {
    setBooks((prev) => ({ ...prev, [activeId]: defaultBook(activeId) }));
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
      addCash,
      resetWallet,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokens, cash, tokensValue, totalValue, change24hUsd, change24hPct, tick, lastUp, lastTransfer, activeId],
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
