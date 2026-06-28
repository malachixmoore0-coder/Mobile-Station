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

/** "Cash" balance shown as its own row on Home (like Phantom's USD cash). */
export const CASH_USD = 12840.55;

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
  /** Market cap in USD (drives the "$344M MC" label). */
  marketCap: number;
  verified?: boolean;
}

/** Movers shown on the Trade + Explore leaderboards, mirroring the app. */
export const TRENDING: TrendingToken[] = [
  { symbol: 'BONK', name: 'Bonk', price: 0.00000412, change24h: -2.39, marketCap: 344_000_000, verified: true },
  { symbol: 'ANSEM', name: 'Ansem', price: 0.0237, change24h: 9715.1, marketCap: 24_000_000, verified: true },
  { symbol: 'KLED', name: 'Kled', price: 0.0229, change24h: 10.05, marketCap: 23_000_000, verified: true },
  { symbol: 'ASTEROID', name: 'Asteroid', price: 0.00603383, change24h: 9.82, marketCap: 6_000_000 },
  { symbol: 'WORLD', name: 'world', price: 0.00170142, change24h: -61.36, marketCap: 1_700_000 },
  { symbol: 'WIF', name: 'dogwifhat', price: 2.45, change24h: 11.42, marketCap: 2_450_000_000, verified: true },
  { symbol: 'JUP', name: 'Jupiter', price: 1.18, change24h: 7.94, marketCap: 1_590_000_000, verified: true },
];

/** Prediction markets (Predict tab). */
export interface PredictOutcome {
  label: string;
  flag?: string;
  pct: number;
}
export interface PredictMatch {
  id: string;
  category: string;
  title: string;
  when: string;
  outcomes: PredictOutcome[];
}

export const PREDICT_FEATURED = {
  category: 'Sports',
  emoji: '⚽️',
  a: { label: 'Canada', flag: '🇨🇦', pct: 57 },
  b: { label: 'South Africa', flag: '🇿🇦', pct: 17 },
  draw: 26,
  when: 'Jun 28 · 3:00PM EDT',
};

/** A crypto price market with an up/down split. */
export const PREDICT_CRYPTO = {
  asset: 'Bitcoin',
  symbol: 'BTC',
  target: 59833.53,
  up: 76,
  down: 24,
};

export const PREDICT_MATCHES: PredictMatch[] = [
  {
    id: 'm1',
    category: 'World Cup',
    title: 'South Africa vs Canada',
    when: 'in 13h',
    outcomes: [
      { label: 'South Africa', flag: '🇿🇦', pct: 17 },
      { label: 'Canada', flag: '🇨🇦', pct: 57 },
      { label: 'Draw', pct: 26 },
    ],
  },
  {
    id: 'm2',
    category: 'World Cup',
    title: 'Brazil vs Japan',
    when: 'in 1d',
    outcomes: [
      { label: 'Brazil', flag: '🇧🇷', pct: 57 },
      { label: 'Japan', flag: '🇯🇵', pct: 19 },
      { label: 'Draw', pct: 24 },
    ],
  },
  {
    id: 'm3',
    category: 'World Cup',
    title: 'Germany vs Paraguay',
    when: 'in 2d',
    outcomes: [
      { label: 'Germany', flag: '🇩🇪', pct: 72 },
      { label: 'Paraguay', flag: '🇵🇾', pct: 10 },
      { label: 'Draw', pct: 18 },
    ],
  },
];

/** Recent News (Explore tab). */
export interface NewsItem {
  id: string;
  source: string;
  time: string;
  title: string;
  ticker: string;
  sentiment: 'Bullish' | 'Bearish';
}

export const NEWS: NewsItem[] = [
  { id: 'n1', source: 'Reuters', time: '27m ago', title: "Google limits Meta's use of its Gemini AI models, FT reports", ticker: 'GOOGL', sentiment: 'Bearish' },
  { id: 'n2', source: 'Bloomberg', time: '1h ago', title: 'Solana ETF inflows hit record as SOL reclaims key level', ticker: 'SOL', sentiment: 'Bullish' },
  { id: 'n3', source: 'CoinDesk', time: '3h ago', title: 'Bitcoin holds above $64K ahead of jobs data', ticker: 'BTC', sentiment: 'Bullish' },
];

export const EXPLORE_LISTS = ['Featured', 'Top Gainers', 'Majors', 'Top Volume', 'Top Losers', 'AI'] as const;
export const TRADE_FILTERS = ['Featured', 'Top Volume', 'Top Gainers'] as const;

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
