import React, {
  createContext,
  useContext,
  useReducer,
  useRef,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  TokenInfo,
  SniperConfig,
  Position,
  Transaction,
  SniperStats,
  SniperStatus,
  Alert,
} from '../types';
import { DEFAULT_CONFIG } from '../utils/constants';
import { TokenMonitor } from '../services/tokenMonitor';
import { executeSwap, getSolBalance, getTokenBalance } from '../services/swapService';
import { fetchTokenSafetyData } from '../services/rugDetector';

interface SniperState {
  config: SniperConfig;
  status: SniperStatus;
  tokenFeed: TokenInfo[];
  positions: Position[];
  transactions: Transaction[];
  stats: SniperStats;
  alerts: Alert[];
  solBalance: number;
  solPriceUsd: number;
}

type Action =
  | { type: 'SET_CONFIG'; payload: Partial<SniperConfig> }
  | { type: 'SET_STATUS'; payload: SniperStatus }
  | { type: 'ADD_TOKEN'; payload: TokenInfo }
  | { type: 'ADD_POSITION'; payload: Position }
  | { type: 'UPDATE_POSITION'; payload: { id: string; updates: Partial<Position> } }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_STATS'; payload: Partial<SniperStats> }
  | { type: 'ADD_ALERT'; payload: Alert }
  | { type: 'DISMISS_ALERT'; payload: string }
  | { type: 'SET_BALANCE'; payload: number }
  | { type: 'SET_SOL_PRICE'; payload: number };

const initialStats: SniperStats = {
  totalTrades: 0,
  wins: 0,
  losses: 0,
  totalPnlSol: 0,
  totalPnlUsd: 0,
  winRate: 0,
  avgPnlPct: 0,
  bestTradePnl: 0,
  worstTradePnl: 0,
};

function reducer(state: SniperState, action: Action): SniperState {
  switch (action.type) {
    case 'SET_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'ADD_TOKEN':
      return {
        ...state,
        tokenFeed: [action.payload, ...state.tokenFeed].slice(0, 200),
      };
    case 'ADD_POSITION':
      return { ...state, positions: [action.payload, ...state.positions] };
    case 'UPDATE_POSITION':
      return {
        ...state,
        positions: state.positions.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions].slice(0, 100),
      };
    case 'UPDATE_STATS':
      return { ...state, stats: { ...state.stats, ...action.payload } };
    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [action.payload, ...state.alerts].slice(0, 10),
      };
    case 'DISMISS_ALERT':
      return {
        ...state,
        alerts: state.alerts.filter((a) => a.id !== action.payload),
      };
    case 'SET_BALANCE':
      return { ...state, solBalance: action.payload };
    case 'SET_SOL_PRICE':
      return { ...state, solPriceUsd: action.payload };
    default:
      return state;
  }
}

interface SniperContextType {
  state: SniperState;
  updateConfig: (config: Partial<SniperConfig>) => void;
  startSniper: () => void;
  stopSniper: () => void;
  manualBuy: (token: TokenInfo) => Promise<void>;
  manualSell: (position: Position) => Promise<void>;
  dismissAlert: (id: string) => void;
}

const SniperContext = createContext<SniperContextType | null>(null);

export function SniperProvider({ children }: { children: React.ReactNode }) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [state, dispatch] = useReducer(reducer, {
    config: DEFAULT_CONFIG as SniperConfig,
    status: 'idle',
    tokenFeed: [],
    positions: [],
    transactions: [],
    stats: initialStats,
    alerts: [],
    solBalance: 0,
    solPriceUsd: 150,
  });

  const monitorRef = useRef<TokenMonitor | null>(null);
  const positionTimers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const lastBuyTime = useRef(0);

  const addAlert = useCallback(
    (type: Alert['type'], message: string) => {
      dispatch({
        type: 'ADD_ALERT',
        payload: { id: Math.random().toString(36).slice(2), type, message, timestamp: Date.now() },
      });
    },
    []
  );

  // Fetch SOL price
  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
        );
        const data = await res.json();
        if (data.solana?.usd) {
          dispatch({ type: 'SET_SOL_PRICE', payload: data.solana.usd });
        }
      } catch {
        // ignore
      }
    };
    fetchSolPrice();
    const interval = setInterval(fetchSolPrice, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Fetch wallet balance
  useEffect(() => {
    if (!wallet.publicKey) return;
    const fetchBalance = async () => {
      const bal = await getSolBalance(connection, wallet.publicKey!);
      dispatch({ type: 'SET_BALANCE', payload: bal });
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 10_000);
    return () => clearInterval(interval);
  }, [wallet.publicKey, connection]);

  const executePositionSell = useCallback(
    async (position: Position) => {
      if (!wallet.publicKey || !wallet.signTransaction) return;
      if (position.status !== 'open') return;

      const tokenBalance = await getTokenBalance(
        connection,
        wallet.publicKey,
        position.token.mint
      );

      if (tokenBalance <= 0) {
        dispatch({
          type: 'UPDATE_POSITION',
          payload: { id: position.id, updates: { status: 'sold', closedAt: Date.now() } },
        });
        return;
      }

      const result = await executeSwap(
        connection,
        { publicKey: wallet.publicKey, signTransaction: wallet.signTransaction as (tx: import('@solana/web3.js').VersionedTransaction) => Promise<import('@solana/web3.js').VersionedTransaction> },
        position.token,
        state.config,
        'sell',
        Math.floor(tokenBalance * 10 ** position.token.decimals)
      );

      const pnlSol = result.success
        ? (result.amountOut || 0) / 1e9 - position.buyPriceSol
        : 0;
      const pnlPct = (pnlSol / position.buyPriceSol) * 100;

      dispatch({
        type: 'UPDATE_POSITION',
        payload: {
          id: position.id,
          updates: {
            status: result.success ? 'sold' : 'failed',
            sellTxSig: result.txSignature,
            closedAt: Date.now(),
            pnlSol,
            pnlPct,
          } as Partial<Position>,
        },
      });

      dispatch({
        type: 'ADD_TRANSACTION',
        payload: {
          id: Math.random().toString(36).slice(2),
          type: result.success ? 'sell' : 'failed',
          token: position.token,
          amountSol: (result.amountOut || 0) / 1e9,
          txSignature: result.txSignature,
          error: result.error,
          timestamp: Date.now(),
          pnlPct,
        },
      });

      if (result.success) {
        addAlert('success', `Sold ${position.token.symbol} ${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(1)}%`);

        // Update stats
        const wins = pnlSol > 0 ? state.stats.wins + 1 : state.stats.wins;
        const losses = pnlSol <= 0 ? state.stats.losses + 1 : state.stats.losses;
        const totalTrades = state.stats.totalTrades + 1;
        dispatch({
          type: 'UPDATE_STATS',
          payload: {
            totalTrades,
            wins,
            losses,
            totalPnlSol: state.stats.totalPnlSol + pnlSol,
            totalPnlUsd: state.stats.totalPnlUsd + pnlSol * state.solPriceUsd,
            winRate: (wins / totalTrades) * 100,
            bestTradePnl: Math.max(state.stats.bestTradePnl, pnlPct),
            worstTradePnl: Math.min(state.stats.worstTradePnl, pnlPct),
          },
        });
      }
    },
    [wallet, connection, state.config, state.stats, state.solPriceUsd, addAlert]
  );

  const processNewToken = useCallback(
    async (token: TokenInfo) => {
      dispatch({ type: 'ADD_TOKEN', payload: token });

      if (!state.config.enabled || state.status !== 'running') return;
      if (!wallet.publicKey || !wallet.signTransaction) return;

      const now = Date.now();
      if (now - lastBuyTime.current < state.config.cooldownMs) return;

      const openPositions = state.positions.filter((p) => p.status === 'open');
      if (openPositions.length >= state.config.maxPositions) return;

      // Apply filters
      if (token.score < state.config.minSafetyScore) return;
      if (state.config.requireLPBurned && !token.hasLPBurned) return;
      if (token.marketCap !== undefined && state.config.maxMarketCapUsd > 0 && token.marketCap > state.config.maxMarketCapUsd) return;
      if (token.liquidity !== undefined && token.liquidity < state.config.minLiquidityUsd) return;
      if (token.devHolding !== undefined && token.devHolding > state.config.maxDevHoldingPct) return;
      if (token.topHolderPct !== undefined && token.topHolderPct > state.config.maxTopHolderPct) return;

      lastBuyTime.current = now;

      addAlert('info', `Sniping ${token.symbol} on ${token.platform}...`);

      const result = await executeSwap(
        connection,
        { publicKey: wallet.publicKey, signTransaction: wallet.signTransaction as (tx: import('@solana/web3.js').VersionedTransaction) => Promise<import('@solana/web3.js').VersionedTransaction> },
        token,
        state.config,
        'buy'
      );

      const txEntry: Transaction = {
        id: Math.random().toString(36).slice(2),
        type: result.success ? 'buy' : 'failed',
        token,
        amountSol: state.config.buyAmountSol,
        amountTokens: result.amountOut,
        txSignature: result.txSignature,
        error: result.error,
        timestamp: Date.now(),
      };
      dispatch({ type: 'ADD_TRANSACTION', payload: txEntry });

      if (result.success) {
        addAlert('success', `Bought ${token.symbol} for ${state.config.buyAmountSol} SOL`);

        const position: Position = {
          id: Math.random().toString(36).slice(2),
          token,
          buyPriceSol: state.config.buyAmountSol,
          buyPriceUsd: state.config.buyAmountSol * state.solPriceUsd,
          amountBought: result.amountOut || 0,
          buyTxSig: result.txSignature!,
          status: 'open',
          openedAt: Date.now(),
          stopLossAt: state.config.buyAmountSol * (1 + state.config.stopLossPct / 100),
          takeProfitAt: state.config.buyAmountSol * (1 + state.config.takeProfitPct / 100),
        };
        dispatch({ type: 'ADD_POSITION', payload: position });

        // Auto-sell monitoring
        if (state.config.autosell) {
          const timer = setInterval(async () => {
            try {
              const safetyData = await fetchTokenSafetyData(token.mint);
              const currentPriceUsd = safetyData.price || 0;
              const currentValueSol =
                state.config.buyAmountSol *
                (currentPriceUsd / (position.buyPriceUsd / state.config.buyAmountSol));
              const pnlPct =
                ((currentValueSol - position.buyPriceSol) / position.buyPriceSol) * 100;

              dispatch({
                type: 'UPDATE_POSITION',
                payload: {
                  id: position.id,
                  updates: { currentPriceUsd, pnlPct, pnlUsd: (pnlPct / 100) * position.buyPriceUsd },
                },
              });

              const shouldSell =
                pnlPct >= state.config.takeProfitPct ||
                pnlPct <= state.config.stopLossPct;

              if (shouldSell) {
                clearInterval(timer);
                positionTimers.current.delete(position.id);
                await executePositionSell(position);
              }
            } catch {
              // ignore monitoring errors
            }
          }, 5000);

          positionTimers.current.set(position.id, timer);
        }
      } else {
        addAlert('error', `Failed to buy ${token.symbol}: ${result.error}`);
      }
    },
    [
      state.config,
      state.status,
      state.positions,
      state.solPriceUsd,
      wallet,
      connection,
      addAlert,
      executePositionSell,
    ]
  );

  const startSniper = useCallback(() => {
    if (!wallet.connected) {
      addAlert('error', 'Connect your Phantom wallet first');
      return;
    }

    dispatch({ type: 'SET_STATUS', payload: 'running' });
    dispatch({
      type: 'SET_CONFIG',
      payload: { enabled: true },
    });
    addAlert('success', 'Sniper started — monitoring for new tokens');

    if (!monitorRef.current) {
      monitorRef.current = new TokenMonitor(state.config);
      monitorRef.current.onToken(processNewToken);
    }
    monitorRef.current.start();
  }, [wallet.connected, state.config, processNewToken, addAlert]);

  const stopSniper = useCallback(() => {
    dispatch({ type: 'SET_STATUS', payload: 'idle' });
    dispatch({ type: 'SET_CONFIG', payload: { enabled: false } });
    addAlert('info', 'Sniper stopped');
    monitorRef.current?.stop();
  }, [addAlert]);

  const manualBuy = useCallback(
    async (token: TokenInfo) => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        addAlert('error', 'Wallet not connected');
        return;
      }
      addAlert('info', `Manual buy: ${token.symbol}...`);
      await processNewToken({ ...token });
    },
    [wallet, processNewToken, addAlert]
  );

  const manualSell = useCallback(
    async (position: Position) => {
      const timer = positionTimers.current.get(position.id);
      if (timer) {
        clearInterval(timer);
        positionTimers.current.delete(position.id);
      }
      await executePositionSell(position);
    },
    [executePositionSell]
  );

  const updateConfig = useCallback((config: Partial<SniperConfig>) => {
    dispatch({ type: 'SET_CONFIG', payload: config });
    monitorRef.current?.updateConfig({ ...state.config, ...config });
  }, [state.config]);

  const dismissAlert = useCallback((id: string) => {
    dispatch({ type: 'DISMISS_ALERT', payload: id });
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      monitorRef.current?.stop();
      positionTimers.current.forEach((t) => clearInterval(t));
    };
  }, []);

  return (
    <SniperContext.Provider
      value={{ state, updateConfig, startSniper, stopSniper, manualBuy, manualSell, dismissAlert }}
    >
      {children}
    </SniperContext.Provider>
  );
}

export function useSniper() {
  const ctx = useContext(SniperContext);
  if (!ctx) throw new Error('useSniper must be used within SniperProvider');
  return ctx;
}

