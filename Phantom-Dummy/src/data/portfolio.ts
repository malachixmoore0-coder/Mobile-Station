/**
 * Static seed data for the dummy wallet. None of this is real — there are no
 * private keys, no network calls and no funds. It exists purely to make the
 * demo look convincing. The live "market" movement is layered on top of these
 * base values by WalletContext.
 */

export interface TokenSeed {
  symbol: string;
  name: string;
  amount: number;
  basePrice: number;
  /** 24h change anchor (%) — jitters slightly while "live". */
  change24h: number;
}

export interface Token extends TokenSeed {
  price: number; // live
  value: number; // live (amount * price)
}

export interface NftSeed {
  id: string;
  name: string;
  collection: string;
  floorSol: number;
  glyph: string; // emoji stand-in for artwork
  tint: string;
}

export interface Activity {
  id: string;
  type: 'receive' | 'send' | 'swap' | 'stake' | 'buy';
  title: string;
  subtitle: string;
  amount: string;
  usd: string;
  positive: boolean;
  time: string;
}

export const WALLET = {
  name: 'Account 1',
  address: '7xKQ9vRtPmZ4nBfA2cJhLwDeYsUgN8qXr3VkM6tHbCa',
  avatar: '🦄',
};

export interface Account {
  id: string;
  name: string;
  address: string;
  avatar: string;
  /** Display-only USD total for the account switcher. */
  total: number;
}

export const ACCOUNTS: Account[] = [
  { id: 'a1', name: 'Main', address: '7xKQ9vRtPmZ4nBfA2cJhLwDeYsUgN8qXr3VkM6tHbCa', avatar: '🦄', total: 372283 },
  { id: 'a2', name: 'Degen', address: 'D3gZ8pQ1Lk7mNvXyR2tBwCfYsUaH9qKx5VnM4eJbTac', avatar: '🔥', total: 48210 },
  { id: 'a3', name: 'Savings', address: 'Sv9aBcD2eF3gH4jK5lM6nP7qR8sT1uV2wX3yZ4aBcDe', avatar: '🏦', total: 156400 },
  { id: 'a4', name: 'NFT Vault', address: 'Nf7tVa1uLt2xY3zA4bC5dE6fG7hJ8kL9mN1pQ2rS3tU', avatar: '🖼️', total: 89750 },
];

export const NETWORKS = ['All networks', 'Solana', 'Ethereum', 'Bitcoin', 'Base', 'Polygon'] as const;
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD'] as const;

export interface TrendingToken {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

/** Movers shown on the Explore tab (a mix of held + not-held tokens). */
export const TRENDING: TrendingToken[] = [
  { symbol: 'WIF', name: 'dogwifhat', price: 2.45, change24h: 11.42 },
  { symbol: 'JUP', name: 'Jupiter', price: 1.18, change24h: 7.94 },
  { symbol: 'BONK', name: 'Bonk', price: 0.000027, change24h: 9.65 },
  { symbol: 'PYTH', name: 'Pyth Network', price: 0.41, change24h: 6.12 },
  { symbol: 'RNDR', name: 'Render', price: 8.74, change24h: 5.38 },
  { symbol: 'JTO', name: 'Jito', price: 3.1, change24h: -3.18 },
  { symbol: 'PEPE', name: 'Pepe', price: 0.0000123, change24h: 14.07 },
];

export interface Dapp {
  id: string;
  name: string;
  category: string;
  glyph: string;
  tint: string;
}

export const DAPPS: Dapp[] = [
  { id: 'jupiter', name: 'Jupiter', category: 'Trade', glyph: '🪐', tint: '#22C55E' },
  { id: 'tensor', name: 'Tensor', category: 'NFT Market', glyph: '⚡', tint: '#9B8CFF' },
  { id: 'magiceden', name: 'Magic Eden', category: 'NFT Market', glyph: '🪄', tint: '#E94F8A' },
  { id: 'marinade', name: 'Marinade', category: 'Staking', glyph: '🥩', tint: '#F2A65A' },
  { id: 'drift', name: 'Drift', category: 'Perps', glyph: '🌊', tint: '#5AA9E6' },
  { id: 'kamino', name: 'Kamino', category: 'Lending', glyph: '🏯', tint: '#3AC6C6' },
  { id: 'pumpfun', name: 'Pump.fun', category: 'Launchpad', glyph: '💊', tint: '#7DCB8B' },
  { id: 'phantom', name: 'Phantom Learn', category: 'Education', glyph: '👻', tint: '#AB9FF2' },
];

/** A flex-worthy book for a 20-year-old: ~$372k spread across majors + memes. */
export const TOKEN_SEEDS: TokenSeed[] = [
  { symbol: 'SOL', name: 'Solana', amount: 820, basePrice: 172.4, change24h: 4.82 },
  { symbol: 'ETH', name: 'Ethereum', amount: 18.4, basePrice: 3418.0, change24h: 2.13 },
  { symbol: 'BTC', name: 'Bitcoin', amount: 0.92, basePrice: 64810.0, change24h: 1.27 },
  { symbol: 'USDC', name: 'USD Coin', amount: 38500, basePrice: 1.0, change24h: 0.01 },
  { symbol: 'JUP', name: 'Jupiter', amount: 24000, basePrice: 1.18, change24h: 7.94 },
  { symbol: 'WIF', name: 'dogwifhat', amount: 9500, basePrice: 2.45, change24h: 11.42 },
  { symbol: 'JTO', name: 'Jito', amount: 5200, basePrice: 3.1, change24h: -3.18 },
  { symbol: 'BONK', name: 'Bonk', amount: 92_000_000, basePrice: 0.000027, change24h: 9.65 },
];

export const NFTS: NftSeed[] = [
  { id: 'madlads', name: 'Mad Lad #4417', collection: 'Mad Lads', floorSol: 142, glyph: '🧙', tint: '#E94F4F' },
  { id: 'degods', name: 'DeGod #1209', collection: 'DeGods', floorSol: 98, glyph: '💀', tint: '#B5B5B5' },
  { id: 'smb', name: 'SMB #2288', collection: 'Solana Monkey', floorSol: 61, glyph: '🐵', tint: '#5AA9E6' },
  { id: 'okay', name: 'Okay Bear #771', collection: 'Okay Bears', floorSol: 34, glyph: '🐻', tint: '#7DCB8B' },
  { id: 'clay', name: 'Claynosaurz #993', collection: 'Claynosaurz', floorSol: 27, glyph: '🦕', tint: '#F2A65A' },
  { id: 'tensorian', name: 'Tensorian #145', collection: 'Tensorians', floorSol: 19, glyph: '🤖', tint: '#9B8CFF' },
];

export const ACTIVITY: Activity[] = [
  { id: 'a1', type: 'swap', title: 'Swapped USDC → SOL', subtitle: 'via Jupiter', amount: '+22.4 SOL', usd: '$3,861.76', positive: true, time: '2m ago' },
  { id: 'a2', type: 'receive', title: 'Received SOL', subtitle: 'From Coinbase', amount: '+50 SOL', usd: '$8,620.00', positive: true, time: '1h ago' },
  { id: 'a3', type: 'stake', title: 'Staking reward', subtitle: 'Marinade', amount: '+1.84 SOL', usd: '$317.21', positive: true, time: '5h ago' },
  { id: 'a4', type: 'buy', title: 'Bought WIF', subtitle: 'Apple Pay', amount: '+2,000 WIF', usd: '$4,900.00', positive: true, time: 'Yesterday' },
  { id: 'a5', type: 'send', title: 'Sent USDC', subtitle: 'To kade.sol', amount: '-1,200 USDC', usd: '$1,200.00', positive: false, time: 'Yesterday' },
  { id: 'a6', type: 'swap', title: 'Swapped SOL → JUP', subtitle: 'via Jupiter', amount: '+8,400 JUP', usd: '$9,912.00', positive: true, time: '2d ago' },
  { id: 'a7', type: 'receive', title: 'Received BONK', subtitle: 'Airdrop', amount: '+12,000,000 BONK', usd: '$324.00', positive: true, time: '3d ago' },
  { id: 'a8', type: 'stake', title: 'Staking reward', subtitle: 'Jito', amount: '+0.91 SOL', usd: '$156.88', positive: true, time: '4d ago' },
];

export const TIMEFRAMES = ['1H', '1D', '1W', '1M', '1Y', 'ALL'] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];

/**
 * Deterministic pseudo-random history generator so each token / portfolio gets
 * a believable, repeatable line for every timeframe. Uses a tiny seeded LCG.
 */
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Builds a series of `points` values that drifts upward (a flex chart) and ends
 * exactly at `endValue`. `volatility` controls the wiggle, `trend` the slope.
 */
export function buildSeries(
  endValue: number,
  seed: number,
  points = 60,
  volatility = 0.02,
  trend = 0.22,
): number[] {
  const rand = seededRandom(seed);
  const raw: number[] = [];
  // Start lower so the line trends up to endValue.
  let v = endValue * (1 - trend);
  for (let i = 0; i < points; i++) {
    const drift = (endValue * trend) / points;
    const noise = (rand() - 0.45) * endValue * volatility;
    v = v + drift + noise;
    raw.push(Math.max(v, endValue * 0.05));
  }
  // Normalise the final point to land on endValue.
  const diff = endValue - raw[raw.length - 1];
  return raw.map((p, i) => p + (diff * i) / (points - 1));
}

/** Per-timeframe shaping so switching tabs feels distinct. */
export const TIMEFRAME_SHAPE: Record<Timeframe, { vol: number; trend: number; seed: number }> = {
  '1H': { vol: 0.004, trend: 0.012, seed: 11 },
  '1D': { vol: 0.012, trend: 0.038, seed: 23 },
  '1W': { vol: 0.02, trend: 0.09, seed: 37 },
  '1M': { vol: 0.028, trend: 0.21, seed: 51 },
  '1Y': { vol: 0.04, trend: 0.62, seed: 79 },
  ALL: { vol: 0.05, trend: 0.86, seed: 97 },
};
