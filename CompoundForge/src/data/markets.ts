import { MarketSymbol } from '@/types';

/** Demo-only reference symbols. Prices are simulated locally, not live market data. */
export const MARKET_SYMBOLS: MarketSymbol[] = [
  { id: 'spx', label: 'S&P 500', fullName: 'S&P 500 Index', basePrice: 5825, volatility: 0.006, color: '#3DFCB0' },
  { id: 'ndq', label: 'Nasdaq', fullName: 'Nasdaq Composite', basePrice: 19150, volatility: 0.009, color: '#33D6FF' },
  { id: 'dji', label: 'Dow Jones', fullName: 'Dow Jones Industrial Avg', basePrice: 42450, volatility: 0.005, color: '#8B5CF6' },
  { id: 'btc', label: 'BTC', fullName: 'Bitcoin / USD', basePrice: 96500, volatility: 0.02, color: '#FFC24B' },
  { id: 'eth', label: 'ETH', fullName: 'Ethereum / USD', basePrice: 3350, volatility: 0.024, color: '#FF66A3' },
  { id: 'vix', label: 'VIX', fullName: 'CBOE Volatility Index', basePrice: 14.2, volatility: 0.03, color: '#FF4D6D' },
];
