export function formatSol(amount: number, decimals = 4): string {
  if (amount === 0) return '0 SOL';
  if (Math.abs(amount) < 0.0001) return `<0.0001 SOL`;
  return `${amount.toFixed(decimals)} SOL`;
}

export function formatUsd(amount: number): string {
  if (amount === 0) return '$0.00';
  if (Math.abs(amount) < 0.01) return `<$0.01`;
  if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (Math.abs(amount) >= 1_000) return `$${(amount / 1_000).toFixed(2)}K`;
  return `$${amount.toFixed(2)}`;
}

export function formatPct(pct: number, showSign = true): string {
  const sign = showSign && pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

export function formatAddress(addr: string, chars = 4): string {
  if (!addr) return '';
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

export function formatTimestamp(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return new Date(ts).toLocaleTimeString();
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

export function scoreColor(score: number): string {
  if (score >= 70) return 'text-accent-green';
  if (score >= 40) return 'text-accent-yellow';
  return 'text-accent-red';
}

export function pnlColor(pnl: number): string {
  if (pnl > 0) return 'text-accent-green';
  if (pnl < 0) return 'text-accent-red';
  return 'text-gray-400';
}
