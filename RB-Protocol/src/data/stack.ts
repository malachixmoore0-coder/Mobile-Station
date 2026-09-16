/**
 * Stack reference. Doses for the injectables are deliberately NOT hard-coded —
 * they're whatever you and your provider settled on, so the app stores them as
 * editable values (see StackContext) and shows "set dose" until you enter one.
 * Oral/supplement amounts are the ones written into the protocol itself.
 */
export interface StackEntry {
  /** Matches the block item id on the timeline so doses resolve straight through. */
  id: string;
  name: string;
  route: 'Sub-Q' | 'Sub-Q / IM' | 'Oral';
  /** Which part of the day an oral belongs to; drives the Stack grouping. */
  slot?: 'morning' | 'pre-workout' | 'night';
  syringe?: 1 | 2 | 3;
  timing: string;
  /** Fixed amount when the protocol specifies one; otherwise user-entered. */
  fixedDose?: string;
  role: string;
  trainingOnly?: boolean;
}

export const PEPTIDES: StackEntry[] = [
  {
    id: 'pep-ghk',
    name: 'GHK-Cu',
    route: 'Sub-Q',
    syringe: 1,
    timing: '7:30 AM, fasted',
    role: 'Copper peptide driving collagen and skin/tissue remodeling. Pairs with the proline and glycine from meal 1, and needs zinc held at roughly 10:1 against it — that is what the 30 mg nighttime zinc is doing.',
  },
  {
    id: 'pep-bpc',
    name: 'BPC-157',
    route: 'Sub-Q',
    syringe: 1,
    timing: '7:30 AM, fasted',
    role: 'Gut and soft-tissue repair. The 6 g L-Citrulline at 9:00 AM raises nitric oxide to improve vascular delivery into the tissue you are actually training.',
  },
  {
    id: 'pep-tb',
    name: 'TB-500',
    route: 'Sub-Q',
    syringe: 1,
    timing: '7:30 AM, fasted',
    role: 'Actin-binding repair peptide for connective tissue — the joint insurance on a split built around sprints, jumps and heavy trap bar work.',
  },
  {
    id: 'pep-kpv',
    name: 'KPV',
    route: 'Sub-Q',
    syringe: 1,
    timing: '7:30 AM, fasted',
    role: 'Anti-inflammatory tripeptide. Works with the omega-3s and salmon lipids in meal 5 to hold systemic inflammation down overnight.',
  },
  {
    id: 'pep-glut',
    name: 'Glutathione',
    route: 'Sub-Q',
    syringe: 2,
    timing: '7:35 AM, separate pin',
    role: 'Master antioxidant. Drawn in its own syringe for pH stability — never blended into syringe 1. Blueberries in meal 4 back it up on the oral side.',
  },
  {
    id: 'pep-igf',
    name: 'IGF-1 LR3',
    route: 'Sub-Q / IM',
    syringe: 3,
    timing: '10:45 AM, training days only',
    trainingOnly: true,
    role: 'Post-workout only, and the 50 g fast carbs + 40 g whey go in immediately after — the carbs are what keep blood sugar from dropping out from under you.',
  },
];

export const SUPPLEMENTS: StackEntry[] = [
  // Morning — all fasted, before meal 1.
  { id: 'wake-vitc', name: 'Vitamin C', route: 'Oral', slot: 'morning', timing: '7:30 AM, fasted', fixedDose: '1,000 mg', role: 'Cofactor for collagen synthesis — the oral half of what GHK-Cu is doing.' },
  { id: 'wake-b12', name: 'Vitamin B12', route: 'Oral', slot: 'morning', timing: '7:30 AM, empty stomach', fixedDose: '1,000 mcg', role: 'Sublingual or oral. Energy and nervous system function, taken on an empty stomach where absorption is best.' },
  { id: 'wake-biotin', name: 'Biotin', route: 'Oral', slot: 'morning', timing: '7:30 AM, fasted', fixedDose: '5,000-10,000 mcg', role: 'Skin, hair and cell growth. Taken early for optimal absorption, and it works the same tissue-quality angle as GHK-Cu.' },
  { id: 'wake-gte', name: 'Green tea extract', route: 'Oral', slot: 'morning', timing: '7:30 AM, fasted', fixedDose: '400-500 mg', role: 'Metabolic rate, fat oxidation and antioxidant load — stacks with glutathione on the oxidative side.' },

  // Pre-workout — the pump ingredients drop off on recovery days.
  { id: 'pre-creatine', name: 'Creatine monohydrate', route: 'Oral', slot: 'pre-workout', timing: '9:00 AM', fixedDose: '5 g', role: 'Daily saturation. Worth keeping on recovery days too.' },
  { id: 'pre-citrulline', name: 'L-Citrulline', route: 'Oral', slot: 'pre-workout', timing: '9:00 AM', fixedDose: '6 g', trainingOnly: true, role: 'Nitric oxide for pump and peptide delivery.' },
  { id: 'pre-beta', name: 'Beta-alanine', route: 'Oral', slot: 'pre-workout', timing: '9:00 AM', fixedDose: '3.2 g', trainingOnly: true, role: 'Buffers the lactic burn on 8-15 rep work and repeat sprints.' },

  // Night — taken with meal 5, not after it.
  { id: 'n-omega', name: 'Omega-3 fish oil', route: 'Oral', slot: 'night', timing: '10:45 PM, with meal 5', fixedDose: '2,000 mg EPA/DHA', role: 'Goes in with the salmon and olive oil — fat is what carries it. Lowers systemic inflammation alongside KPV.' },
  { id: 'n-zinc', name: 'Zinc picolinate', route: 'Oral', slot: 'night', timing: '10:45 PM, with meal 5', fixedDose: '30 mg', role: 'Holds the 10:1 zinc-to-copper ratio against GHK-Cu, and backs immune recovery.' },
  { id: 'n-mag', name: 'Magnesium glycinate', route: 'Oral', slot: 'night', timing: '10:45 PM, with meal 5', fixedDose: '400 mg', role: 'Deep sleep, nervous system relaxation and muscle recovery going into the 7.5-8 hour window.' },
];

/** Section headers for the oral stack, in the order the day runs them. */
export const SUPPLEMENT_SLOTS: { slot: NonNullable<StackEntry['slot']>; label: string }[] = [
  { slot: 'morning', label: 'Morning — fasted, 7:30 AM' },
  { slot: 'pre-workout', label: 'Pre-workout — 9:00 AM' },
  { slot: 'night', label: 'Night — with meal 5, 10:45 PM' },
];

/** Sub-Q sites to rotate through, logged per syringe per day. */
export const INJECTION_SITES = [
  'Abdomen L',
  'Abdomen R',
  'Love handle L',
  'Love handle R',
  'Delt L',
  'Delt R',
  'Quad L',
  'Quad R',
  'Glute L',
  'Glute R',
];

export const DISCLAIMER =
  'This app is a log for a protocol you already run — it does not prescribe anything, and nothing in it is medical advice. Research peptides are not FDA-approved drugs. Keep a provider in the loop, get bloodwork, and stop anything that stops feeling right.';
