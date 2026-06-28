/**
 * Phantom-inspired dark theme tokens.
 * Colours chosen to mirror the look of the real Phantom wallet app
 * (deep charcoal background, signature lavender accent, mint/coral deltas).
 */
export const colors = {
  bg: '#000000', // current Phantom is near-pure black
  bgElevated: '#121214',
  card: '#1C1C1F',
  cardAlt: '#242427',
  border: '#222224',
  accent: '#AB9FF2', // Phantom lavender
  accentSoft: '#7A6FE0',
  text: '#FFFFFF',
  textDim: '#9A9AA2',
  textFaint: '#6A6A72',
  up: '#34C77B',
  upSoft: '#1F8A57',
  down: '#FF5C5C',
  downSoft: '#C24B4B',
  verified: '#4DA8FF',
  white: '#FFFFFF',
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

/** Brand colours for each token, used for the round token glyphs. */
export const tokenColors: Record<string, string> = {
  SOL: '#9945FF',
  ETH: '#627EEA',
  BTC: '#F7931A',
  USDC: '#2775CA',
  JUP: '#22C55E',
  WIF: '#D4A574',
  JTO: '#3AC6C6',
  BONK: '#FB923C',
  PYTH: '#7C3AED',
  RNDR: '#FB4B4B',
  PEPE: '#4CAF50',
  MON: '#7B5BD6',
  SOLPUMP: '#3DBF6B',
  ANSEM: '#E8A33D',
  KLED: '#5B8DEF',
  ASTEROID: '#C77DFF',
  WORLD: '#4FD9C9',
  CASH: '#34C77B',
};
