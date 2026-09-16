import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BlockCard } from '@/components/BlockCard';
import { WaterTracker } from '@/components/WaterTracker';
import { useLog } from '@/context/LogContext';
import { scheduleFor, isTrainingDay } from '@/data/schedule';
import { dayIndex, prettyDate } from '@/utils/date';
import { macrosFor, totalMacros } from '@/utils/nutrition';
import { AISLES, GROCERIES } from '@/data/groceries';
import { PREP_SESSION, RECIPES } from '@/data/recipes';
import { RecipeCard, StepList } from '@/components/RecipeCard';

type Mode = 'meals' | 'recipes' | 'list';

const MODE_LABEL: Record<Mode, string> = {
  meals: 'Today',
  recipes: 'Meals & prep',
  list: 'Shopping',
};

export function FuelScreen() {
  const { activeDate, isDone } = useLog();
  const [mode, setMode] = useState<Mode>('meals');

  const day = dayIndex(activeDate);
  const blocks = useMemo(() => scheduleFor(day), [day]);
  const meals = blocks.filter((b) => b.kind === 'meal');
  const target = totalMacros(meals);

  // Macros actually banked: a meal counts once every item in it is checked.
  const eaten = meals.reduce(
    (acc, b) => {
      const m = macrosFor(b.id);
      if (!m || !b.items.every((i) => isDone(i.id))) return acc;
      return {
        kcal: acc.kcal + m.kcal,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Fuel"
        subtitle={`${prettyDate(activeDate)} · ${meals.length} meals · ${isTrainingDay(day) ? 'training day' : 'recovery day'}`}
      />

      <View style={styles.tabs}>
        {(['meals', 'recipes', 'list'] as Mode[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.tab, mode === m && styles.tabActive]}
            activeOpacity={0.8}
            onPress={() => setMode(m)}
          >
            <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>{MODE_LABEL[m]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'meals' ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.macroCard}>
            <View style={styles.macroHead}>
              <Text style={styles.kcal}>
                {eaten.kcal.toLocaleString()}
                <Text style={styles.kcalDim}> / {target.kcal.toLocaleString()} kcal</Text>
              </Text>
              <Text style={styles.macroNote}>estimates</Text>
            </View>
            <View style={styles.macroRow}>
              <MacroBar label="Protein" value={eaten.protein} total={target.protein} color={colors.meal} />
              <MacroBar label="Carbs" value={eaten.carbs} total={target.carbs} color={colors.volt} />
              <MacroBar label="Fat" value={eaten.fat} total={target.fat} color={colors.supplement} />
            </View>
          </View>

          <WaterTracker />

          {meals.map((b) => (
            <BlockCard key={b.id} block={b} nowMinutes={null} />
          ))}
        </ScrollView>
      ) : mode === 'recipes' ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.listIntro}>
            Every meal, start to finish: what goes in it, what gets cooked ahead, and the exact
            tare-and-weigh order at the scale.
          </Text>

          {RECIPES.map((r) => (
            <RecipeCard key={r.blockId} recipe={r} />
          ))}

          <View style={styles.prepCard}>
            <View style={styles.prepHead}>
              <Ionicons name="flame" size={16} color={colors.volt} />
              <Text style={styles.prepTitle}>Prep session — cook once, eat four</Text>
            </View>
            <Text style={styles.prepIntro}>
              Both batches run at the same time: rice cooker and skillet for the bowls, one oven
              rack for the chicken and sweet potatoes. Worth doing on a recovery day.
            </Text>
            {PREP_SESSION.map((batch) => (
              <StepList key={batch.title} steps={batch} accent={colors.volt} />
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.listIntro}>
            One week of the protocol: 5 meals a day, plus the post-workout shake on the four
            training days.
          </Text>
          {AISLES.map((aisle) => (
            <View key={aisle} style={styles.aisleCard}>
              <Text style={styles.aisleTitle}>{aisle}</Text>
              {GROCERIES.filter((g) => g.aisle === aisle).map((g) => (
                <View key={g.item} style={styles.groceryRow}>
                  <View style={styles.groceryText}>
                    <Text style={styles.groceryItem}>{g.item}</Text>
                    {!!g.batchNote && <Text style={styles.groceryBatch}>{g.batchNote}</Text>}
                  </View>
                  <Text style={styles.groceryQty}>{g.weekly}</Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function MacroBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.min(1, value / total) : 0;
  return (
    <View style={styles.macroCol}>
      <View style={styles.macroBarTrack}>
        <View style={[styles.macroBarFill, { height: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.macroValue}>
        {value}
        <Text style={styles.macroTotal}>/{total}g</Text>
      </Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  tabs: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.volt, borderColor: colors.volt },
  tabText: { fontSize: 12.5, fontWeight: '800', color: colors.inkDim },
  tabTextActive: { color: colors.bg },
  macroCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  macroHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  kcal: { fontSize: 24, fontWeight: '900', color: colors.ink, letterSpacing: -0.8 },
  kcalDim: { fontSize: 13, color: colors.inkFaint, fontWeight: '700' },
  macroNote: { fontSize: 10, color: colors.inkFaint, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  macroRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.lg },
  macroCol: { flex: 1, alignItems: 'center', gap: 6 },
  macroBarTrack: {
    width: '100%',
    height: 62,
    backgroundColor: colors.bgAlt,
    borderRadius: radius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  macroBarFill: { width: '100%', borderRadius: radius.sm },
  macroValue: { fontSize: 13, fontWeight: '900', color: colors.ink },
  macroTotal: { fontSize: 10, color: colors.inkFaint, fontWeight: '700' },
  macroLabel: { fontSize: 10, color: colors.inkFaint, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  listIntro: { fontSize: 12, color: colors.inkDim, fontWeight: '600', lineHeight: 18 },
  aisleCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  aisleTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.volt,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: spacing.sm,
  },
  groceryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  groceryText: { flex: 1 },
  groceryItem: { fontSize: 13, color: colors.ink, fontWeight: '600' },
  groceryBatch: { fontSize: 10.5, color: colors.inkFaint, fontWeight: '700', marginTop: 1 },
  prepCard: {
    backgroundColor: colors.bgAlt,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  prepHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  prepTitle: { fontSize: 14, fontWeight: '900', color: colors.ink },
  prepIntro: { fontSize: 12, color: colors.inkDim, lineHeight: 18 },
  groceryQty: { fontSize: 12, color: colors.inkDim, fontWeight: '800' },
});
