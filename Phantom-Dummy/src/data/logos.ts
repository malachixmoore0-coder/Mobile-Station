/**
 * Bundled real token logos (fetched from the Trust Wallet asset set).
 * TokenGlyph renders these when present and falls back to a tinted initial
 * badge for tokens without a bundled logo (e.g. meme tokens on the boards).
 */
export const TOKEN_LOGOS: Record<string, number> = {
  SOL: require('../../assets/tokens/SOL.png'),
  ETH: require('../../assets/tokens/ETH.png'),
  BTC: require('../../assets/tokens/BTC.png'),
  USDC: require('../../assets/tokens/USDC.png'),
  JUP: require('../../assets/tokens/JUP.png'),
  WIF: require('../../assets/tokens/WIF.png'),
  JTO: require('../../assets/tokens/JTO.png'),
  BONK: require('../../assets/tokens/BONK.png'),
};
