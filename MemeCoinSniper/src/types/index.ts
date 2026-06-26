export type Platform = 'pumpfun' | 'raydium' | 'moonshot' | 'unknown';

export interface TokenInfo {
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUri?: string;
  platform: Platform;
  createdAt: number;
  marketCap?: number;
  liquidity?: number;
  price?: number;
  priceChange5m?: number;
  volume5m?: number;
  holders?: number;
  isVerified?: boolean;
  isFrozen?: boolean;
  hasLPBurned?: boolean;
  topHolderPct?: number;
  devHolding?: number;
  score: number; // 0-100 safety score
  txSignature?: string;
}

export interface SniperConfig {
  enabled: boolean;
  buyAmountSol: number;
  slippageBps: number;
  maxMarketCapUsd: number;
  minLiquidityUsd: number;
  minSafetyScore: number;
  autosell: boolean;
  takeProfitPct: number;
  stopLossPct: number;
  trailingStopPct: number;
  maxPositions: number;
  priorityFeeLamports: number;
  monitorPumpFun: boolean;
  monitorRaydium: boolean;
  monitorMoonshot: boolean;
  requireLPBurned: boolean;
  maxDevHoldingPct: number;
  maxTopHolderPct: number;
  cooldownMs: number;
}

export interface Position {
  id: string;
  token: TokenInfo;
  buyPriceSol: number;
  buyPriceUsd: number;
  amountBought: number;
  currentPriceUsd?: number;
  pnlPct?: number;
  pnlUsd?: number;
  buyTxSig: string;
  sellTxSig?: string;
  status: 'open' | 'sold' | 'failed';
  openedAt: number;
  closedAt?: number;
  stopLossAt: number;
  takeProfitAt: number;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'failed';
  token: TokenInfo;
  amountSol: number;
  amountTokens?: number;
  priceSol?: number;
  priceUsd?: number;
  txSignature?: string;
  error?: string;
  timestamp: number;
  pnlPct?: number;
}

export interface SniperStats {
  totalTrades: number;
  wins: number;
  losses: number;
  totalPnlSol: number;
  totalPnlUsd: number;
  winRate: number;
  avgPnlPct: number;
  bestTradePnl: number;
  worstTradePnl: number;
}

export type SniperStatus = 'idle' | 'running' | 'paused' | 'error';

export interface Alert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
}
