/** Currency / number formatting helpers shared across screens. */

export function formatUsd(value: number, opts?: { compact?: boolean }): string {
  if (opts?.compact && Math.abs(value) >= 1000) {
    return (
      '$' +
      value.toLocaleString('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
      })
    );
  }
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Price formatting that keeps precision for sub-cent tokens (e.g. BONK). */
export function formatPrice(value: number): string {
  if (value >= 1) {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (value >= 0.01) {
    return '$' + value.toFixed(4);
  }
  return '$' + value.toFixed(8).replace(/0+$/, '');
}

export function formatAmount(amount: number, symbol?: string): string {
  let str: string;
  if (amount >= 1_000_000) {
    str = amount.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 2 });
  } else if (amount >= 1) {
    str = amount.toLocaleString('en-US', { maximumFractionDigits: 4 });
  } else {
    str = amount.toLocaleString('en-US', { maximumFractionDigits: 6 });
  }
  return symbol ? `${str} ${symbol}` : str;
}

export function formatPct(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

/** Compact market-cap label, e.g. "$344M". */
export function formatMcap(value: number): string {
  return (
    '$' +
    value.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: value >= 1e9 ? 2 : 0 })
  );
}

export function formatSignedUsd(value: number): string {
  const sign = value >= 0 ? '+' : '-';
  return `${sign}${formatUsd(Math.abs(value))}`;
}

export function shortAddress(addr: string): string {
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}
