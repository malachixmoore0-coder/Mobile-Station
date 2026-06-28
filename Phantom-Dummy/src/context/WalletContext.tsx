import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Token, TOKEN_SEEDS } from '@/data/portfolio';

interface WalletState {
  tokens: Token[];
  totalValue: number;
  /** Absolute 24h change in USD, derived from the (jittering) per-token %. */
  change24hUsd: number;
  change24hPct: number;
  /** Monotonic tick counter — lets charts know when to push a new live point. */
  tick: number;
  /** True whenever the most recent tick moved the book up. */
  lastUp: boolean;
}

const WalletContext = createContext<WalletState | null>(null);

const TICK_MS = 1600;

function priceFor(seed: typeof TOKEN_SEEDS[number], price: number): Token {
  return { ...seed, price, value: seed.amount * price };
}

/**
 * Simulates a live market. Every tick each token's price does a small random
 * walk biased gently upward, and its 24h % drifts a touch so the deltas feel
 * alive. Stablecoins are pinned near $1. Pure client-side theatre.
 */
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<Token[]>(() =>
    TOKEN_SEEDS.map((s) => priceFor(s, s.basePrice)),
  );
  const [tick, setTick] = useState(0);
  const [lastUp, setLastUp] = useState(true);
  const prevTotal = useRef(TOKEN_SEEDS.reduce((sum, s) => sum + s.amount * s.basePrice, 0));

  useEffect(() => {
    const id = setInterval(() => {
      setTokens((prev) => {
        const next = prev.map((t) => {
          const isStable = t.symbol === 'USDC';
          // Random walk: stables barely move, memes move a lot.
          const vol = isStable ? 0.0004 : t.symbol === 'BONK' || t.symbol === 'WIF' ? 0.006 : 0.0025;
          const bias = 0.0006; // gentle upward drift so the flex keeps growing
          const pct = (Math.random() - 0.5) * 2 * vol + bias;
          let price = t.price * (1 + pct);
          if (isStable) price = 1 + (Math.random() - 0.5) * 0.0008;
          // Nudge the 24h figure so it visibly breathes.
          const change24h = t.change24h + (Math.random() - 0.5) * 0.08;
          return { ...t, price, change24h, value: t.amount * price };
        });
        const total = next.reduce((sum, t) => sum + t.value, 0);
        setLastUp(total >= prevTotal.current);
        prevTotal.current = total;
        return next;
      });
      setTick((n) => n + 1);
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const value = useMemo<WalletState>(() => {
    const totalValue = tokens.reduce((sum, t) => sum + t.value, 0);
    // Derive yesterday's value from each token's 24h % to keep the delta coherent.
    const prevValue = tokens.reduce((sum, t) => sum + t.value / (1 + t.change24h / 100), 0);
    const change24hUsd = totalValue - prevValue;
    const change24hPct = prevValue > 0 ? (change24hUsd / prevValue) * 100 : 0;
    return { tokens, totalValue, change24hUsd, change24hPct, tick, lastUp };
  }, [tokens, tick, lastUp]);

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
