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
    title: 'Morning supplements & hydration',
    kind: 'hydration',
    items: [
      { id: 'wake-water', label: 'Water', detail: '24 oz' },
      { id: 'wake-salt', label: 'Sea salt', detail: '1/2 tsp' },
      { id: 'wake-vitc', label: 'Vitamin C', detail: '1,000 mg' },
      { id: 'wake-b12', label: 'Vitamin B12', detail: '1,000 mcg', note: 'Sublingual or oral, empty stomach' },
      { id: 'wake-biotin', label: 'Biotin', detail: '5,000-10,000 mcg', note: 'Taken early for optimal absorption' },
      { id: 'wake-gte', label: 'Green tea extract', detail: '400-500 mg' },
    ],
    pairing: 'Sodium pulls the first 24 oz into the cell instead of straight through you. Vitamin C is the cofactor for the collagen synthesis the morning stack is aimed at, and B12, biotin and green tea extract all land fasted — before meal 1 gets in the way of absorption.',
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
    title: 'Meal 1 — Pre-workout smoothie',
    kind: 'meal',
    items: [
      { id: 'm1-whey', label: 'Whey isolate', detail: '1 scoop' },
      { id: 'm1-oats', label: 'Rolled oats or cream of rice', detail: '40 g dry' },
      { id: 'm1-banana', label: 'Banana', detail: '1 medium' },
      { id: 'm1-ab', label: 'Almond butter', detail: '1/2 tbsp' },
      { id: 'm1-liquid', label: 'Water or unsweetened almond milk', detail: '10-12 oz' },
    ],
    pairing: 'Fast-digesting carbs and protein that will not sit heavy in your gut during explosive training. Blitz 30 seconds and drink immediately.',
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
    title: 'Meal 2 — Post-workout whole food bowl',
    kind: 'meal',
    items: [
      { id: 'm2-rice', label: 'Cooked jasmine rice', detail: '7 oz / 200 g' },
      { id: 'm2-protein', label: 'Cooked 93/7 ground beef', detail: '6 oz / 170 g' },
      { id: 'm2-greens', label: 'Steamed greens (broccoli or spinach)', detail: '1 cup' },
    ],
    pairing: 'Restores glycogen; beef iron and zinc plus spinach nitrates enhance vascularity. Built off the 4-meal batch in the mini-fridge.',
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
    title: 'Meal 3 — Mid-shift meal',
    kind: 'meal',
    items: [
      { id: 'm3-sweet', label: 'Baked sweet potato', detail: '~7-8 oz', note: 'Or 7 oz cooked jasmine rice' },
      { id: 'm3-protein', label: 'Cooked chicken breast', detail: '6 oz / 170 g' },
      { id: 'm3-avo', label: 'Avocado, sliced fresh', detail: '1/4' },
    ],
    pairing: 'Sustained complex carbs and healthy fats for mid-shift anabolism. Packed in the cooler bag with an ice pack before you leave.',
  },
  {
    id: 'meal-4',
    time: 1200,
    title: 'Meal 4 — High-protein shift snack',
    kind: 'meal',
    items: [
      { id: 'm4-yogurt', label: 'Plain 0% Greek yogurt', detail: '1.5 cups / 340 g' },
      { id: 'm4-almonds', label: 'Raw almonds', detail: '1 oz / 28 g' },
      { id: 'm4-berries', label: 'Fresh blueberries', detail: '1/2 cup' },
    ],
    pairing: 'No stove required on shift. Antioxidant-dense blueberries support glutathione in clearing cellular waste; high protein holds mTOR signaling up.',
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
      { id: 'm5-protein', label: 'Pan-seared salmon', detail: '8 oz / 225 g raw', note: 'Or 4 whole eggs + 4 egg whites' },
      { id: 'm5-greens', label: 'Mixed greens or baby spinach', detail: '2 cups' },
      { id: 'm5-evoo', label: 'Extra virgin olive oil', detail: '1 tbsp', note: 'With salt, pepper, lemon juice' },
    ],
    pairing: 'Slow-digesting protein and healthy lipids overnight; omega-3s and salmon lipids work with KPV to lower systemic inflammation, and zinc preserves the copper/zinc balance alongside GHK-Cu.',
  },
  {
    id: 'night-supps',
    time: 1365,
    title: 'Nighttime supplements — with meal 5',
    kind: 'supplement',
    items: [
      { id: 'n-omega', label: 'Omega-3 fish oil', detail: '2,000 mg EPA/DHA' },
      { id: 'n-zinc', label: 'Zinc picolinate', detail: '30 mg' },
      { id: 'n-mag', label: 'Magnesium glycinate', detail: '400 mg' },
    ],
    pairing: 'These go down with meal 5, not after it: the omega-3s need the fat from the salmon and olive oil to absorb properly. Zinc maintains the 10:1 ratio alongside GHK-Cu, and magnesium glycinate opens the door on the 7.5-8 hour sleep window.',
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
