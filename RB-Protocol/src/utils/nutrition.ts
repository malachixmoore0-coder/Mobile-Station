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
  'meal-1': { kcal: 790, protein: 44, carbs: 96, fat: 26 },
  shake: { kcal: 370, protein: 36, carbs: 52, fat: 1 },
  'meal-2': { kcal: 860, protein: 66, carbs: 88, fat: 24 },
  'meal-3': { kcal: 700, protein: 60, carbs: 48, fat: 24 },
  'meal-4': { kcal: 450, protein: 40, carbs: 28, fat: 18 },
  'meal-5': { kcal: 680, protein: 52, carbs: 14, fat: 46 },
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
