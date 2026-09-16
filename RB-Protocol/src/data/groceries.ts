/**
 * Weekly shopping list sized to the actual portions: five meals a day, plus
 * the post-workout shake on the four training days. Batch quantities match the
 * cook-once-eat-four prep in recipes.ts.
 */
export interface GroceryLine {
  item: string;
  weekly: string;
  aisle: 'Protein' | 'Carbs' | 'Produce' | 'Fats & extras' | 'Powders';
  /** Called out when the amount comes from a batch cook rather than per-meal. */
  batchNote?: string;
}

export const GROCERIES: GroceryLine[] = [
  { item: '93/7 lean ground beef', weekly: '~3.5 lb', aisle: 'Protein', batchNote: '2 lb per 4-bowl batch' },
  { item: 'Boneless skinless chicken breast', weekly: '~3.5 lb', aisle: 'Protein', batchNote: '2 lb per 4-meal batch' },
  { item: 'Salmon fillets', weekly: '7 x 8 oz (~3.5 lb)', aisle: 'Protein' },
  { item: 'Eggs (salmon swap)', weekly: '1 dozen backup', aisle: 'Protein' },
  { item: 'Plain 0% Greek yogurt', weekly: '7 x 340 g (~5.3 lb)', aisle: 'Protein' },

  { item: 'White jasmine rice (dry)', weekly: '~3.5 cups dry', aisle: 'Carbs', batchNote: '2 cups dry per batch' },
  { item: 'Medium sweet potatoes', weekly: '7', aisle: 'Carbs', batchNote: '4 per batch' },
  { item: 'Rolled oats or cream of rice', weekly: '280 g dry (7 x 40 g)', aisle: 'Carbs' },

  { item: 'Bananas', weekly: '7 medium', aisle: 'Produce' },
  { item: 'Frozen greens (broccoli or spinach)', weekly: '7 cups', aisle: 'Produce', batchNote: '4 cups per batch' },
  { item: 'Mixed greens / baby spinach', weekly: '14 cups (~2 clamshells)', aisle: 'Produce' },
  { item: 'Avocado', weekly: '2 (1/4 per day)', aisle: 'Produce' },
  { item: 'Fresh blueberries', weekly: '3.5 cups', aisle: 'Produce' },
  { item: 'Lemons', weekly: '2', aisle: 'Produce' },

  { item: 'Almond butter', weekly: '3.5 tbsp (1 jar lasts weeks)', aisle: 'Fats & extras' },
  { item: 'Raw almonds', weekly: '7 oz (7 x 28 g)', aisle: 'Fats & extras' },
  { item: 'Extra virgin olive oil', weekly: '7 tbsp + cooking oil', aisle: 'Fats & extras' },
  { item: 'Unsweetened almond milk', weekly: '~2.5 qt', aisle: 'Fats & extras' },
  { item: 'Sea salt, black pepper, garlic powder, paprika', weekly: 'restock as needed', aisle: 'Fats & extras' },

  { item: 'Whey isolate', weekly: '7 scoops + 4 x 40 g post-workout', aisle: 'Powders' },
  { item: 'Fast carbs (cluster dextrin / dextrose / cream of rice)', weekly: '200 g (4 x 50 g)', aisle: 'Powders' },
  { item: 'Creatine monohydrate', weekly: '35 g (7 x 5 g)', aisle: 'Powders' },
  { item: 'L-Citrulline', weekly: '24 g (4 x 6 g)', aisle: 'Powders' },
  { item: 'Beta-alanine', weekly: '12.8 g (4 x 3.2 g)', aisle: 'Powders' },
];

export const AISLES: GroceryLine['aisle'][] = ['Protein', 'Carbs', 'Produce', 'Fats & extras', 'Powders'];
