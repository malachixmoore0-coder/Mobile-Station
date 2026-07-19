/**
 * CompoundForge design tokens.
 * Dark "trading terminal meets Blender viewport" theme: near-black base,
 * neon mint for gains, neon rose for losses, electric violet for XP/levels,
 * molten gold for milestones.
 */
export const colors = {
  bg: '#0A0B10',
  bgElevated: '#12141C',
  card: '#161923',
  cardAlt: '#1D2130',
  border: '#262B3B',
  divider: '#1E2230',

  ink: '#F4F6FB',
  inkDim: '#9CA3B8',
  inkFaint: '#5C6479',

  mint: '#3DFCB0',
  mintSoft: 'rgba(61, 252, 176, 0.14)',
  mintGlow: 'rgba(61, 252, 176, 0.45)',

  rose: '#FF4D6D',
  roseSoft: 'rgba(255, 77, 109, 0.14)',
  roseGlow: 'rgba(255, 77, 109, 0.45)',

  violet: '#8B5CF6',
  violetSoft: 'rgba(139, 92, 246, 0.16)',
  violetGlow: 'rgba(139, 92, 246, 0.5)',

  gold: '#FFC24B',
  goldSoft: 'rgba(255, 194, 75, 0.15)',
  goldGlow: 'rgba(255, 194, 75, 0.5)',

  cyan: '#33D6FF',
  cyanSoft: 'rgba(51, 214, 255, 0.14)',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(4, 5, 9, 0.72)',
};

export const gradients = {
  bg: ['#0A0B10', '#12111C', '#0A0B10'] as const,
  hero: ['#1B1030', '#0F0B1E', '#0A0B10'] as const,
  mint: ['#3DFCB0', '#1FB983'] as const,
  rose: ['#FF6B8A', '#E01E45'] as const,
  violet: ['#A78BFA', '#6D28D9'] as const,
  gold: ['#FFD979', '#E29A1F'] as const,
  card: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.01)'] as const,
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 10,
  }),
};

export const font = {
  mono: 'System',
};
