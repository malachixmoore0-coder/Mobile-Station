export const SOLANA_RPC_ENDPOINTS = {
  mainnet: 'https://api.mainnet-beta.solana.com',
  helius: 'https://rpc.helius.xyz/?api-key=',
  quicknode: 'https://api.mainnet-beta.solana.com',
};

export const DEFAULT_RPC = SOLANA_RPC_ENDPOINTS.mainnet;

// Jupiter V6 API
export const JUPITER_API = 'https://quote-api.jup.ag/v6';

// PumpFun WebSocket for new launches
export const PUMPFUN_WS = 'wss://pumpportal.fun/api/data';

// Raydium API for new pools
export const RAYDIUM_API = 'https://api.raydium.io/v2';

// DexScreener for price data
export const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';

// Well-known token mints
export const SOL_MINT = 'So11111111111111111111111111111111111111112';
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Lamports per SOL
export const LAMPORTS_PER_SOL = 1_000_000_000;

export const DEFAULT_CONFIG = {
  enabled: false,
  buyAmountSol: 0.1,
  slippageBps: 1000, // 10%
  maxMarketCapUsd: 500_000,
  minLiquidityUsd: 5_000,
  minSafetyScore: 40,
  autosell: true,
  takeProfitPct: 100,  // 2x
  stopLossPct: -50,
  trailingStopPct: 20,
  maxPositions: 5,
  priorityFeeLamports: 100_000,
  monitorPumpFun: true,
  monitorRaydium: true,
  monitorMoonshot: false,
  requireLPBurned: false,
  maxDevHoldingPct: 20,
  maxTopHolderPct: 30,
  cooldownMs: 2000,
};
