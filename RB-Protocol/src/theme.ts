/**
 * RB Protocol design tokens.
 * Dark "locker room at 5am" theme — near-black surfaces, a volt accent for the
 * live/next moment, and one color per protocol block type so the timeline is
 * readable at a glance without reading the labels.
 */
export const colors = {
  bg: '#0B0D0C',
  bgAlt: '#121614',
  card: '#161A18',
  cardAlt: '#1D2320',
  border: '#252C28',
  divider: '#1E2521',

  ink: '#F2F5F1',
  inkDim: '#9AA69E',
  inkFaint: '#65726B',

  volt: '#C6FF2A',
  voltSoft: '#26300E',
  voltDim: '#8FBB1F',

  // Block-type accents (shared by the timeline, Fuel and Stack screens).
  hydration: '#3BA9F5',
  hydrationSoft: '#0F2436',
  injection: '#C77DFF',
  injectionSoft: '#291635',
  meal: '#FF9F45',
  mealSoft: '#331F0E',
  supplement: '#4FD1A5',
  supplementSoft: '#0E2B22',
  workout: '#C6FF2A',
  workoutSoft: '#26300E',
  move: '#7C8B84',
  moveSoft: '#1B211E',
  sleep: '#6C7BFF',
  sleepSoft: '#171B36',

  danger: '#FF5A4E',
  dangerSoft: '#341512',
  white: '#FFFFFF',
  overlay: 'rgba(5, 7, 6, 0.72)',
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
  pop: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 26,
    elevation: 10,
  },
};

export type BlockKind =
  | 'hydration'
  | 'injection'
  | 'meal'
  | 'supplement'
  | 'workout'
  | 'move'
  | 'sleep';

/** Accent pair + icon for a protocol block type. */
export function kindStyle(kind: BlockKind): { color: string; soft: string; icon: string } {
  switch (kind) {
    case 'hydration': return { color: colors.hydration, soft: colors.hydrationSoft, icon: 'water' };
    case 'injection': return { color: colors.injection, soft: colors.injectionSoft, icon: 'medical' };
    case 'meal': return { color: colors.meal, soft: colors.mealSoft, icon: 'restaurant' };
    case 'supplement': return { color: colors.supplement, soft: colors.supplementSoft, icon: 'nutrition' };
    case 'workout': return { color: colors.workout, soft: colors.workoutSoft, icon: 'barbell' };
    case 'move': return { color: colors.move, soft: colors.moveSoft, icon: 'walk' };
    case 'sleep': return { color: colors.sleep, soft: colors.sleepSoft, icon: 'moon' };
  }
}
