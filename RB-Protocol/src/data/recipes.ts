/**
 * Full build instructions for each meal: what goes in it, what gets batch
 * cooked ahead, and the exact tare-and-weigh order at the scale.
 * `blockId` links a recipe back to its block on the daily timeline.
 */
export interface Ingredient {
  item: string;
  amount: string;
  /** Acceptable swap, shown inline. */
  alt?: string;
}

export interface Steps {
  title: string;
  steps: string[];
}

export interface Recipe {
  blockId: string;
  name: string;
  time: string;
  /** Where it gets eaten — home, mini-fridge, cooler bag at Pepsi. */
  where: string;
  /** Only the meals that come out of a batch cook. */
  batchOf?: number;
  ingredients: Ingredient[];
  batchPrep?: Steps;
  assembly: Steps;
  purpose: string;
}

export const RECIPES: Recipe[] = [
  {
    blockId: 'meal-1',
    name: 'Pre-workout smoothie',
    time: '8:00 AM',
    where: 'Blender at home',
    ingredients: [
      { item: 'Whey isolate protein powder', amount: '1 scoop' },
      { item: 'Rolled oats', amount: '3/4 cup (60 g dry)', alt: 'Cream of rice' },
      { item: 'Banana', amount: '1 large' },
      { item: 'Almond butter', amount: '1/2 tbsp' },
      { item: 'Water or unsweetened almond milk', amount: '10-12 oz' },
      { item: 'Ice', amount: 'a handful' },
    ],
    assembly: {
      title: 'Kitchen setup & assembly',
      steps: [
        'Place the blender cup on the scale and tare to zero.',
        'Weigh 60 g dry oats straight into the blender.',
        'Add whey, banana, almond butter, milk or water, and ice.',
        'Blitz 30 seconds and drink immediately.',
      ],
    },
    purpose:
      'Fast-digesting carbs and protein that will not sit heavy in your gut during explosive training.',
  },
  {
    blockId: 'meal-2',
    name: 'Post-workout whole food bowl',
    time: '12:00 PM',
    where: 'Home / mini-fridge',
    batchOf: 4,
    ingredients: [
      { item: '93/7 lean ground beef', amount: '2 lbs (32 oz) per batch' },
      { item: 'White jasmine rice', amount: '3.5 cups dry per batch' },
      { item: 'Frozen greens (broccoli or spinach)', amount: '4 cups per batch' },
      { item: 'Garlic powder, salt, black pepper', amount: 'to taste' },
    ],
    batchPrep: {
      title: 'Batch cooking — 4 meals',
      steps: [
        'Rice cooker: 3.5 cups dry jasmine rice + 3.5 cups water, press Cook.',
        'Skillet: brown the beef over medium-high with garlic powder, salt and pepper, about 6-8 minutes. Drain the excess grease.',
        'Greens: microwave the frozen greens 3 minutes.',
      ],
    },
    assembly: {
      title: 'Food scale assembly — per container',
      steps: [
        'Place the container on the scale and tare to zero.',
        'Weigh 10.5 oz (300 g) cooked jasmine rice.',
        'Tare, then weigh 6 oz (170 g) cooked ground beef.',
        'Add 1 cup cooked greens, cover, and store in the mini-fridge.',
      ],
    },
    purpose:
      'Restores glycogen; beef iron and zinc plus spinach nitrates enhance vascularity.',
  },
  {
    blockId: 'meal-3',
    name: 'Mid-shift meal',
    time: '4:30 PM',
    where: 'Packed in the cooler bag for Pepsi',
    batchOf: 4,
    ingredients: [
      { item: 'Boneless skinless chicken breast', amount: '2 lbs (32 oz) per batch' },
      { item: 'Large sweet potatoes (~10-11 oz each)', amount: '4 per batch', alt: '3.5 cups dry jasmine rice' },
      { item: 'Avocado', amount: '1 (sliced fresh daily)' },
      { item: 'Olive oil, paprika, garlic powder, salt, pepper', amount: 'to taste' },
    ],
    batchPrep: {
      title: 'Batch cooking — 4 meals',
      steps: [
        'Slice the chicken breasts, toss in olive oil and seasonings, bake on a sheet pan at 400°F for 22 minutes.',
        'Poke holes in the sweet potatoes with a fork, bake at 400°F for 45 minutes.',
      ],
    },
    assembly: {
      title: 'Food scale assembly — per container',
      steps: [
        'Place the container on the scale and tare to zero.',
        'Weigh 1 cooked sweet potato (~10-11 oz / 300 g), or 10.5 oz cooked rice.',
        'Tare, then weigh 6 oz (170 g) cooked chicken breast.',
        'Slice 1/4 fresh avocado on top before heading to work.',
        'Pack in the cooler bag with an ice pack.',
      ],
    },
    purpose: 'Sustained complex carbs and healthy fats for mid-shift anabolism.',
  },
  {
    blockId: 'meal-4',
    name: 'High-protein shift snack',
    time: '8:00 PM',
    where: 'Packed in the cooler bag for Pepsi',
    ingredients: [
      { item: 'Plain 0% Greek yogurt', amount: '1.5 cups (340 g)' },
      { item: 'Pure honey', amount: '2 tbsp (42 g)' },
      { item: 'Fresh blueberries', amount: '1/2 cup' },
      { item: 'Raw almonds', amount: '1 oz (28 g, ~23 whole)' },
    ],
    assembly: {
      title: 'Kitchen setup & assembly',
      steps: [
        'Place the portable container on the scale and tare to zero.',
        'Scoop 340 g Greek yogurt straight into the container.',
        'Tare, then add 42 g pure honey.',
        'Tare, then add 28 g raw almonds.',
        'Top with 1/2 cup blueberries and pack in the cooler bag with an ice pack.',
      ],
    },
    purpose:
      'High-protein snack requiring no stove; blueberries provide antioxidants to support glutathione action.',
  },
  {
    blockId: 'meal-5',
    name: 'Nighttime tissue rebuild meal',
    time: '10:45 PM',
    where: 'Post-shift at home',
    ingredients: [
      { item: 'Salmon fillet', amount: '8 oz (225 g raw)', alt: '4 whole eggs + 4 egg whites' },
      { item: 'Mixed greens or baby spinach', amount: '2 cups' },
      { item: 'Extra virgin olive oil', amount: '3/4 tbsp (10 g)' },
      { item: 'Salt, pepper, lemon juice', amount: 'to taste' },
    ],
    assembly: {
      title: 'Cooking & fresh assembly',
      steps: [
        'Weigh the raw salmon (225 g) on the scale before it hits the pan.',
        'Skillet over medium-high; season the salmon with salt and pepper and sear 4-5 minutes per side until flaky.',
        'Toss the greens in 3/4 tbsp (10 g) olive oil, salt and lemon juice.',
        'Plate the salmon next to the greens and eat fresh after work.',
      ],
    },
    purpose:
      'Slow-digesting protein, healthy lipids, and zinc to preserve copper/zinc balance alongside GHK-Cu while repairing tissue overnight.',
  },
];

export function recipeFor(blockId: string): Recipe | undefined {
  return RECIPES.find((r) => r.blockId === blockId);
}

/**
 * The two oven/stove batches that cover four days of meals 2 and 3 — worth
 * running back to back on one recovery day.
 */
export const PREP_SESSION: Steps[] = [
  {
    title: 'Batch A — bowls (meal 2 x4)',
    steps: [
      '3.5 cups dry jasmine rice + 3.5 cups water in the rice cooker.',
      '2 lbs 93/7 ground beef browned with garlic powder, salt and pepper; drain.',
      '4 cups frozen greens, microwaved 3 minutes.',
      'Portion into 4 containers: 300 g rice, 170 g beef, 1 cup greens.',
    ],
  },
  {
    title: 'Batch B — shift meals (meal 3 x4)',
    steps: [
      '2 lbs sliced chicken breast tossed in olive oil, paprika, garlic powder, salt and pepper — 400°F for 22 minutes.',
      '4 large sweet potatoes (~10-11 oz each), forked, on the same oven rack — 400°F for 45 minutes.',
      'Portion into 4 containers: 1 sweet potato, 170 g chicken. Avocado stays whole until the morning of.',
    ],
  },
];
