/**
 * Weekly shopping list derived from the five daily meals plus the post-workout
 * shake, which only lands on the four training days.
 */
export interface GroceryLine {
  item: string;
  weekly: string;
  aisle: 'Protein' | 'Carbs' | 'Produce' | 'Fats & extras' | 'Powders';
}

const TRAINING_DAYS = 4;
const DAYS = 7;

export const GROCERIES: GroceryLine[] = [
  { item: 'Lean ground beef (93/7) or chicken breast', weekly: `${DAYS * 8} oz (~3.5 lb)`, aisle: 'Protein' },
  { item: 'Chicken breast or turkey (shift meal)', weekly: `${DAYS * 8} oz (~3.5 lb)`, aisle: 'Protein' },
  { item: 'Salmon fillets', weekly: `${DAYS * 8} oz (~3.5 lb)`, aisle: 'Protein' },
  { item: 'Eggs (salmon swap)', weekly: '1 dozen backup', aisle: 'Protein' },
  { item: 'Plain Greek yogurt', weekly: `${DAYS * 1.5} cups (~3 large tubs)`, aisle: 'Protein' },

  { item: 'Rolled oats', weekly: `${DAYS} cups`, aisle: 'Carbs' },
  { item: 'Jasmine rice (dry)', weekly: `~${(DAYS * 1.5 * 0.33).toFixed(1)} cups dry -> ${DAYS * 1.5} cooked`, aisle: 'Carbs' },
  { item: 'Sweet potatoes', weekly: `${DAYS} large`, aisle: 'Carbs' },

  { item: 'Bananas', weekly: `${DAYS}`, aisle: 'Produce' },
  { item: 'Spinach / greens (cooking)', weekly: `${DAYS} cups cooked (~2 large bags)`, aisle: 'Produce' },
  { item: 'Salad greens', weekly: `${DAYS} large servings`, aisle: 'Produce' },
  { item: 'Avocado', weekly: `${Math.ceil(DAYS / 2)}`, aisle: 'Produce' },
  { item: 'Blueberries', weekly: `${DAYS * 0.5} cups`, aisle: 'Produce' },

  { item: 'Almond butter', weekly: `${DAYS * 2} tbsp (~1 jar)`, aisle: 'Fats & extras' },
  { item: 'Raw almonds', weekly: `${DAYS} oz`, aisle: 'Fats & extras' },
  { item: 'Extra virgin olive oil', weekly: '1 bottle (rolling)', aisle: 'Fats & extras' },
  { item: 'Sea salt', weekly: `${(DAYS * 0.5).toFixed(1)} tsp`, aisle: 'Fats & extras' },

  { item: 'Whey isolate', weekly: `${DAYS} scoops + ${TRAINING_DAYS} x 40 g post-workout`, aisle: 'Powders' },
  { item: 'Fast carbs (cluster dextrin / dextrose / cream of rice)', weekly: `${TRAINING_DAYS * 50} g`, aisle: 'Powders' },
  { item: 'Creatine monohydrate', weekly: `${DAYS * 5} g`, aisle: 'Powders' },
  { item: 'L-Citrulline', weekly: `${TRAINING_DAYS * 6} g`, aisle: 'Powders' },
  { item: 'Beta-alanine', weekly: `${(TRAINING_DAYS * 3.2).toFixed(1)} g`, aisle: 'Powders' },
];

export const AISLES: GroceryLine['aisle'][] = ['Protein', 'Carbs', 'Produce', 'Fats & extras', 'Powders'];
