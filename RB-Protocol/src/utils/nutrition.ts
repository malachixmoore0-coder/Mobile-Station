import { Block } from '@/types';

/** Rough macro estimate per meal block, in grams / kcal. */
export interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Target macros per meal, as written into the protocol. The five whole-food
 * meals come to ~3,110 kcal / 220 g protein / 330 g carbs / 99 g fat; the
 * post-workout shake adds ~370 kcal on training days.
 */
const MEAL_MACROS: Record<string, Macros> = {
  // Smoothie: 1 scoop isolate, 60 g dry oats, large banana, 1/2 tbsp almond butter.
  'meal-1': { kcal: 480, protein: 31, carbs: 68, fat: 9 },
  shake: { kcal: 370, protein: 40, carbs: 52, fat: 1 },
  // Bowl: 300 g cooked rice, 170 g cooked 93/7 beef, 1 cup greens.
  'meal-2': { kcal: 770, protein: 48, carbs: 100, fat: 19 },
  // Shift meal: 300 g sweet potato, 170 g cooked chicken, 1/4 avocado.
  'meal-3': { kcal: 730, protein: 55, carbs: 92, fat: 15 },
  // Yogurt + 42 g honey + blueberries + 28 g almonds.
  'meal-4': { kcal: 550, protein: 40, carbs: 62, fat: 16 },
  // 225 g raw salmon, 2 cups greens, 10 g EVOO.
  'meal-5': { kcal: 580, protein: 46, carbs: 8, fat: 40 },
};

export function macrosFor(blockId: string): Macros | undefined {
  return MEAL_MACROS[blockId];
}

export function totalMacros(blocks: Block[]): Macros {
  return blocks.reduce<Macros>(
    (acc, b) => {
      const m = macrosFor(b.id);
      if (!m) return acc;
      return {
        kcal: acc.kcal + m.kcal,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

/** 24 oz on wake + 8 glasses through the day is the app's default target. */
export const WATER_TARGET = 11;
