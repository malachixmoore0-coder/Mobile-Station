import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';
import { Recipe, Steps } from '@/data/recipes';
import { macrosFor } from '@/utils/nutrition';
import { Tag } from '@/components/Tag';

/** Numbered instruction list — batch cooking or scale assembly. */
export function StepList({ steps, accent = colors.meal }: { steps: Steps; accent?: string }) {
  return (
    <View style={styles.stepBlock}>
      <Text style={[styles.stepTitle, { color: accent }]}>{steps.title}</Text>
      {steps.steps.map((step, i) => (
        <View key={step} style={styles.stepRow}>
          <Text style={[styles.stepNum, { color: accent }]}>{i + 1}</Text>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

/** A full meal: ingredients, batch cook, and the tare-and-weigh order. */
export function RecipeCard({ recipe, defaultOpen = false }: { recipe: Recipe; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const macros = macrosFor(recipe.blockId);

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.header} activeOpacity={0.8} onPress={() => setOpen((o) => !o)}>
        <View style={styles.headText}>
          <Text style={styles.time}>{recipe.time}</Text>
          <Text style={styles.name}>{recipe.name}</Text>
          <Text style={styles.where}>{recipe.where}</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.inkFaint} />
      </TouchableOpacity>

      <View style={styles.tagRow}>
        {!!macros && <Tag label={`${macros.kcal} kcal`} color={colors.meal} soft={colors.mealSoft} />}
        {!!macros && (
          <Tag
            label={`${macros.protein}p / ${macros.carbs}c / ${macros.fat}f`}
            color={colors.inkDim}
            soft={colors.cardAlt}
          />
        )}
        {!!recipe.batchOf && (
          <Tag label={`batch of ${recipe.batchOf}`} color={colors.volt} soft={colors.voltSoft} />
        )}
      </View>

      {open && (
        <View style={styles.body}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((ing) => (
            <View key={ing.item} style={styles.ingRow}>
              <View style={styles.ingText}>
                <Text style={styles.ingItem}>{ing.item}</Text>
                {!!ing.alt && <Text style={styles.ingAlt}>or {ing.alt}</Text>}
                {!!ing.note && <Text style={styles.ingNote}>{ing.note}</Text>}
              </View>
              <Text style={styles.ingAmount}>{ing.amount}</Text>
            </View>
          ))}

          {!!recipe.batchPrep && <StepList steps={recipe.batchPrep} accent={colors.volt} />}
          <StepList steps={recipe.assembly} />

          <View style={styles.purposeRow}>
            <Ionicons name="flash" size={12} color={colors.meal} />
            <Text style={styles.purpose}>{recipe.purpose}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  headText: { flex: 1 },
  time: { fontSize: 10.5, fontWeight: '900', color: colors.meal, letterSpacing: 0.7 },
  name: { fontSize: 16, fontWeight: '900', color: colors.ink, letterSpacing: -0.3, marginTop: 2 },
  where: { fontSize: 11.5, color: colors.inkFaint, fontWeight: '600', marginTop: 2 },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: spacing.md, flexWrap: 'wrap' },
  body: { marginTop: spacing.lg, gap: spacing.md },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: colors.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  ingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  ingText: { flex: 1 },
  ingItem: { fontSize: 13.5, color: colors.ink, fontWeight: '600' },
  ingAlt: { fontSize: 11, color: colors.inkFaint, fontStyle: 'italic', marginTop: 1 },
  ingNote: { fontSize: 11, color: colors.inkFaint, lineHeight: 16, marginTop: 2 },
  ingAmount: { fontSize: 12.5, color: colors.inkDim, fontWeight: '800' },
  stepBlock: { gap: 6, marginTop: spacing.xs },
  stepTitle: { fontSize: 10.5, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 },
  stepRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  stepNum: { fontSize: 11, fontWeight: '900', width: 12, marginTop: 2 },
  stepText: { flex: 1, fontSize: 13, color: colors.inkDim, lineHeight: 19 },
  purposeRow: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: colors.bgAlt,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  purpose: { flex: 1, fontSize: 11.5, color: colors.inkDim, lineHeight: 17 },
});
