export function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}

/** Deterministic pseudo-random walk seeded by symbol id, resets each session render. */
export function generateSeries(seedKey: string, basePrice: number, volatility: number, points = 48): number[] {
  const rand = mulberry32(hashString(seedKey));
  const series: number[] = [];
  let value = basePrice;
  for (let i = 0; i < points; i++) {
    const drift = (rand() - 0.48) * volatility;
    value = Math.max(value * (1 + drift), 0.01);
    series.push(value);
  }
  return series;
}

export function nextTick(value: number, volatility: number): number {
  const drift = (Math.random() - 0.49) * volatility;
  return Math.max(value * (1 + drift), 0.01);
}
