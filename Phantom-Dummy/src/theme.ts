/**
 * Phantom-inspired dark theme tokens.
 * Colours chosen to mirror the look of the real Phantom wallet app
 * (deep charcoal background, signature lavender accent, mint/coral deltas).
 */
export const colors = {
  bg: '#131419',
  bgElevated: '#1B1C24',
  card: '#21222C',
  cardAlt: '#272834',
  border: '#2C2D3A',
  accent: '#AB9FF2', // Phantom lavender
  accentSoft: '#7A6FE0',
  text: '#FFFFFF',
  textDim: '#9B9CB0',
  textFaint: '#6B6C7C',
  up: '#21D07A',
  upSoft: '#1F8A57',
  down: '#FF6B6B',
  downSoft: '#C24B4B',
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
};
