import { Block } from '@/types';

/** Rough macro estimate per meal block, in grams / kcal. */
export interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Hand-entered estimates for each meal in the protocol. These are ballpark
 * figures for tracking trends, not a food database — swap in your own numbers
 * if you weigh and log precisely.
 */
const MEAL_MACROS: Record<string, Macros> = {
  // Smoothie: 1 scoop isolate, 40 g dry oats, banana, 1/2 tbsp almond butter.
  'meal-1': { kcal: 450, protein: 33, carbs: 58, fat: 9 },
  shake: { kcal: 370, protein: 40, carbs: 52, fat: 1 },
  // Bowl: 200 g cooked rice, 170 g cooked 93/7 beef, 1 cup greens.
  'meal-2': { kcal: 600, protein: 52, carbs: 64, fat: 14 },
  // Shift meal: 200 g sweet potato, 170 g cooked chicken, 1/4 avocado.
  'meal-3': { kcal: 560, protein: 56, carbs: 47, fat: 16 },
  'meal-4': { kcal: 405, protein: 40, carbs: 29, fat: 15 },
  // 225 g raw salmon, 2 cups greens, 1 tbsp EVOO.
  'meal-5': { kcal: 600, protein: 46, carbs: 5, fat: 43 },
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
