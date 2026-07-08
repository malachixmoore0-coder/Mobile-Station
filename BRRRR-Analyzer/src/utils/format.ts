/** Currency / number formatting helpers shared across screens. */

export function formatUsd(value: number, opts?: { compact?: boolean }): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  if (opts?.compact !== false && abs >= 1000) {
    return (
      sign +
      '$' +
      abs.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 })
    );
  }
  return (
    sign +
    abs.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

export function formatSignedUsd(value: number, opts?: { compact?: boolean }): string {
  const sign = value >= 0 ? '+' : '-';
  return `${sign}${formatUsd(Math.abs(value), opts)}`;
}

export function formatPct(pct: number, opts?: { signed?: boolean; decimals?: number }): string {
  const sign = opts?.signed && pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(opts?.decimals ?? 1)}%`;
}

export function formatDaysOnMarket(days: number): string {
  if (days === 0) return 'Listed today';
  if (days === 1) return '1 day on market';
  return `${days} days on market`;
}

export function timeAgo(epochMs: number): string {
  const diffMs = Date.now() - epochMs;
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function relativeDate(epochMs: number): string {
  const days = Math.round((Date.now() - epochMs) / (24 * 3600_000));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}
