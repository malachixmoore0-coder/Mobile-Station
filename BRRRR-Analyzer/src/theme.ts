/**
 * BRRRR Scout design tokens.
 * Warm, paper-like light theme (real-estate/finance feel) with a deep forest
 * green primary and a signal-amber accent for money/urgency moments.
 */
export const colors = {
  bg: '#F6F5F1',
  bgAlt: '#EFEDE6',
  card: '#FFFFFF',
  cardAlt: '#FBFAF7',
  border: '#E4E1D8',
  divider: '#EDEAE1',

  ink: '#16211C',
  inkDim: '#5B6660',
  inkFaint: '#8D958F',

  primary: '#0F3D2E',
  primarySoft: '#E4EDE8',
  primaryTint: '#1E5F44',

  gold: '#C7962E',
  goldSoft: '#F6ECD3',

  great: '#2E8B57',
  greatSoft: '#E3F3E9',
  good: '#7BA428',
  goodSoft: '#EEF4DE',
  fair: '#C7962E',
  fairSoft: '#F8EFD9',
  poor: '#C1523C',
  poorSoft: '#F8E5E0',

  active: '#2E8B57',
  pending: '#C7962E',
  offMarket: '#8D958F',
  sold: '#C1523C',

  white: '#FFFFFF',
  overlay: 'rgba(15, 20, 17, 0.55)',
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const shadow = {
  card: {
    shadowColor: '#16211C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  pop: {
    shadowColor: '#16211C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};

/** Score band (0-100) -> color group, used for the BRRRR fit badge everywhere. */
export function scoreBand(score: number): { label: string; color: string; soft: string } {
  if (score >= 80) return { label: 'Great fit', color: colors.great, soft: colors.greatSoft };
  if (score >= 65) return { label: 'Good fit', color: colors.good, soft: colors.goodSoft };
  if (score >= 45) return { label: 'Marginal', color: colors.fair, soft: colors.fairSoft };
  return { label: 'Poor fit', color: colors.poor, soft: colors.poorSoft };
}

export function statusColor(status: string): string {
  switch (status) {
    case 'Active': return colors.active;
    case 'Pending': return colors.pending;
    case 'Sold': return colors.sold;
    default: return colors.offMarket;
  }
}
