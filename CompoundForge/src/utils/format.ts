export function formatCurrency(value: number, opts?: { compact?: boolean }): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  if (opts?.compact && abs >= 1000) {
    const units = [
      { v: 1_000_000_000, s: 'B' },
      { v: 1_000_000, s: 'M' },
      { v: 1_000, s: 'K' },
    ];
    for (const u of units) {
      if (abs >= u.v) {
        return `${sign}$${(abs / u.v).toFixed(abs / u.v >= 100 ? 0 : 2)}${u.s}`;
      }
    }
  }
  return `${sign}$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatSigned(value: number): string {
  return value >= 0 ? `+${formatCurrency(value)}` : formatCurrency(value);
}
