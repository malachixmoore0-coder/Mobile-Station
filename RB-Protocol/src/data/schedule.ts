import { Block, DayIndex, DayType } from '@/types';

/** Mon-Fri run the 4-day split; Wed, Sat and Sun are active recovery. */
const DAY_TYPES: Record<DayIndex, DayType> = {
  0: 'recovery',    // Sun
  1: 'upper-power', // Mon
  2: 'lower-speed', // Tue
  3: 'recovery',    // Wed
  4: 'upper-hyper', // Thu
  5: 'lower-hyper', // Fri
  6: 'recovery',    // Sat
};

export function dayTypeFor(day: DayIndex): DayType {
  return DAY_TYPES[day];
}

export function isTrainingDay(day: DayIndex): boolean {
  return DAY_TYPES[day] !== 'recovery';
}

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * The master timeline. Times are minutes from midnight; blocks at the same
 * minute keep their array order (the two morning syringes, for instance).
 * `trainingOnly` blocks drop off entirely on recovery days — that's the
 * "No IGF-1 LR3" rule from the protocol.
 */
const MASTER: Block[] = [
  {
    id: 'wake',
    time: 450,
    title: 'Wake up & hydration',
    kind: 'hydration',
    items: [
      { id: 'wake-water', label: 'Water', detail: '24 oz' },
      { id: 'wake-salt', label: 'Sea salt', detail: '1/2 tsp' },
      { id: 'wake-vitc', label: 'Vitamin C', detail: '1,000 mg' },
    ],
    pairing: 'Sodium pulls the first 24 oz into the cell instead of straight through you. Vitamin C is the cofactor for the collagen synthesis the morning stack is aimed at.',
  },
  {
    id: 'syringe-1',
    time: 450,
    title: 'Syringe 1 — Sub-Q blend',
    kind: 'injection',
    items: [
      { id: 'pep-ghk', label: 'GHK-Cu' },
      { id: 'pep-bpc', label: 'BPC-157' },
      { id: 'pep-tb', label: 'TB-500' },
      { id: 'pep-kpv', label: 'KPV' },
    ],
    pairing: 'Fasted, before the first meal. Log the site so you rotate instead of hammering one spot.',
  },
  {
    id: 'syringe-2',
    time: 455,
    title: 'Syringe 2 — Glutathione',
    kind: 'injection',
    items: [{ id: 'pep-glut', label: 'Glutathione' }],
    pairing: 'Drawn and pinned separately from syringe 1 — keeping it out of that blend is what preserves pH stability.',
  },
  {
    id: 'meal-1',
    time: 480,
    title: 'Meal 1 — Pre-workout fuel',
    kind: 'meal',
    items: [
      { id: 'm1-oats', label: 'Rolled oats', detail: '1 cup' },
      { id: 'm1-whey', label: 'Whey isolate', detail: '1 scoop' },
      { id: 'm1-banana', label: 'Banana', detail: '1' },
      { id: 'm1-ab', label: 'Almond butter', detail: '2 tbsp' },
    ],
    pairing: 'Complex carbs for sustained training energy; collagen amino acids (proline/glycine) to synergize with GHK-Cu.',
  },
  {
    id: 'pre-supps',
    time: 540,
    title: 'Pre-workout supplements',
    kind: 'supplement',
    items: [
      { id: 'pre-creatine', label: 'Creatine monohydrate', detail: '5 g' },
      { id: 'pre-citrulline', label: 'L-Citrulline', detail: '6 g', trainingOnly: true },
      { id: 'pre-beta', label: 'Beta-alanine', detail: '3.2 g', trainingOnly: true },
    ],
    pairing: 'L-Citrulline drives nitric oxide production, enhancing vascular delivery of BPC-157 and TB-500 to targeted tissues.',
    recoveryNote: 'Recovery day — creatine only. The pump ingredients have nothing to feed.',
  },
  {
    id: 'gym',
    time: 555,
    title: 'Gym session',
    kind: 'workout',
    items: [
      { id: 'gym-warmup', label: 'Dynamic mobility & explosive warm-up' },
      { id: 'gym-session', label: 'Complete the session' },
    ],
    trainingOnly: true,
  },
  {
    id: 'recovery-move',
    time: 555,
    title: 'Active recovery',
    kind: 'move',
    items: [
      { id: 'rec-walk', label: 'Commute / walking' },
      { id: 'rec-mobility', label: 'Light mobility' },
    ],
    pairing: 'No lifting and no IGF-1 LR3 today. Blood flow and joint work only — this is where the morning stack actually does its job.',
  },
  {
    id: 'igf',
    time: 645,
    title: 'Syringe 3 — IGF-1 LR3',
    kind: 'injection',
    items: [{ id: 'pep-igf', label: 'IGF-1 LR3', note: 'Sub-Q or IM, training days only' }],
    trainingOnly: true,
    pairing: 'Post-workout, and the shake goes in immediately after — do not pin this one and then wander off without carbs.',
  },
  {
    id: 'shake',
    time: 645,
    title: 'Post-workout shake',
    kind: 'meal',
    items: [
      { id: 'pw-carbs', label: 'Fast carbs', detail: '50 g', note: 'Cluster dextrin, dextrose, or cream of rice' },
      { id: 'pw-whey', label: 'Whey isolate', detail: '40 g' },
    ],
    trainingOnly: true,
    pairing: 'Fast carbs prevent blood sugar crashes from IGF-1 LR3 while shunting amino acids directly into depleted muscle fibers.',
  },
  {
    id: 'meal-2',
    time: 720,
    title: 'Meal 2 — Whole food refeed',
    kind: 'meal',
    items: [
      { id: 'm2-protein', label: 'Lean ground beef (93/7) or chicken breast', detail: '8 oz' },
      { id: 'm2-rice', label: 'Jasmine rice', detail: '1.5 cups' },
      { id: 'm2-greens', label: 'Cooked spinach / greens', detail: '1 cup' },
    ],
    pairing: 'Jasmine rice sustains glycogen replenishment; beef provides zinc/iron; spinach supplies nitrates for BPC-157 vascular remodeling.',
  },
  {
    id: 'commute-in',
    time: 795,
    title: 'Commute to Pepsi',
    kind: 'move',
    items: [{ id: 'commute-in-done', label: 'Walk / transit active recovery' }],
  },
  {
    id: 'meal-3',
    time: 990,
    title: 'Meal 3 — Shift meal',
    kind: 'meal',
    items: [
      { id: 'm3-protein', label: 'Grilled chicken breast or turkey', detail: '8 oz' },
      { id: 'm3-sweet', label: 'Sweet potato', detail: '1 large' },
      { id: 'm3-avo', label: 'Avocado', detail: '1/2' },
    ],
    pairing: 'Healthy fats and complex carbs support hormone synthesis and sustained cell hydration during physical shift work.',
  },
  {
    id: 'meal-4',
    time: 1200,
    title: 'Meal 4 — Shift snack',
    kind: 'meal',
    items: [
      { id: 'm4-yogurt', label: 'Plain Greek yogurt', detail: '1.5 cups' },
      { id: 'm4-berries', label: 'Blueberries', detail: '1/2 cup' },
      { id: 'm4-almonds', label: 'Raw almonds', detail: '1 oz' },
    ],
    pairing: 'Antioxidant-dense blueberries support glutathione in clearing cellular waste; high protein maintains elevated mTOR signaling.',
  },
  {
    id: 'commute-home',
    time: 1320,
    title: 'Shift end & commute home',
    kind: 'move',
    items: [{ id: 'commute-home-done', label: 'Off the clock' }],
  },
  {
    id: 'meal-5',
    time: 1365,
    title: 'Meal 5 — Nighttime tissue rebuild',
    kind: 'meal',
    items: [
      { id: 'm5-protein', label: 'Salmon fillet', detail: '8 oz', note: 'Or 4 whole eggs + 4 egg whites' },
      { id: 'm5-salad', label: 'Large green salad + EVOO' },
    ],
    pairing: 'Omega-3s and salmon lipids work with KPV to lower systemic inflammation overnight.',
  },
  {
    id: 'night-supps',
    time: 1370,
    title: 'Nighttime supplements',
    kind: 'supplement',
    items: [
      { id: 'n-mag', label: 'Magnesium glycinate', detail: '400 mg' },
      { id: 'n-zinc', label: 'Zinc picolinate', detail: '30 mg' },
      { id: 'n-omega', label: 'Omega-3s', detail: '2 g' },
    ],
    pairing: 'Zinc maintains the 10:1 ratio needed alongside GHK-Cu.',
  },
  {
    id: 'sleep',
    time: 1425,
    title: 'Sleep',
    kind: 'sleep',
    items: [{ id: 'sleep-done', label: 'Lights out', detail: '7.5 – 8 h' }],
    pairing: 'Every peptide in the stack is cashing its check right here. Short sleep is the one variable that undoes the whole day.',
  },
];

/** The blocks that actually apply to a given weekday, in clock order. */
export function scheduleFor(day: DayIndex): Block[] {
  const training = isTrainingDay(day);
  return MASTER.filter((b) => {
    if (b.trainingOnly && !training) return false;
    if (b.id === 'recovery-move' && training) return false;
    return true;
  }).map((b) => ({
    ...b,
    items: b.items.filter((i) => training || !i.trainingOnly),
  }));
}

/** Every checkable id for a day — used for the adherence ring. */
export function checkableIds(blocks: Block[]): string[] {
  return blocks.flatMap((b) => b.items.map((i) => i.id));
}
