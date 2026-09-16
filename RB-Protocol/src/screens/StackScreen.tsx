import React from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Tag } from '@/components/Tag';
import { useLog } from '@/context/LogContext';
import { DISCLAIMER, PEPTIDES, SUPPLEMENTS, StackEntry } from '@/data/stack';
import { isTrainingDay } from '@/data/schedule';
import { dayIndex, prettyDate } from '@/utils/date';

export function StackScreen() {
  const { activeDate, isDone, getSite, doses, setDose } = useLog();
  const training = isTrainingDay(dayIndex(activeDate));

  const syringeSite = (entry: StackEntry) => {
    if (entry.syringe === 1) return getSite('syringe-1');
    if (entry.syringe === 2) return getSite('syringe-2');
    if (entry.syringe === 3) return getSite('igf');
    return undefined;
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Stack"
        subtitle={`${prettyDate(activeDate)} · ${training ? 'IGF-1 LR3 day' : 'no IGF-1 LR3 today'}`}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Injectables</Text>
        {PEPTIDES.map((entry) => {
          const skipped = entry.trainingOnly && !training;
          const taken = isDone(entry.id);
          const site = syringeSite(entry);
          return (
            <View key={entry.id} style={[styles.card, skipped && styles.cardSkipped]}>
              <View style={styles.cardHead}>
                <View style={[styles.syringeBadge, skipped && styles.syringeBadgeSkipped]}>
                  <Text style={styles.syringeText}>{entry.syringe ?? '-'}</Text>
                </View>
                <View style={styles.headText}>
                  <Text style={styles.name}>{entry.name}</Text>
                  <Text style={styles.timing}>
                    {entry.route} · {entry.timing}
                  </Text>
                </View>
                {skipped ? (
                  <Tag label="off today" color={colors.inkFaint} soft={colors.cardAlt} />
                ) : (
                  <Tag
                    label={taken ? 'pinned' : 'pending'}
                    color={taken ? colors.injection : colors.inkFaint}
                    soft={taken ? colors.injectionSoft : colors.cardAlt}
                  />
                )}
              </View>

              <View style={styles.doseRow}>
                <Text style={styles.doseLabel}>Your dose</Text>
                <TextInput
                  style={styles.doseInput}
                  value={doses[entry.id] ?? ''}
                  onChangeText={(t) => setDose(entry.id, t)}
                  placeholder="set dose"
                  placeholderTextColor={colors.inkFaint}
                  returnKeyType="done"
                />
                {!!site && !skipped && (
                  <View style={styles.siteChip}>
                    <Ionicons name="location" size={11} color={colors.injection} />
                    <Text style={styles.siteText}>{site}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.role}>{entry.role}</Text>
            </View>
          );
        })}

        <Text style={styles.sectionLabel}>Oral support</Text>
        {SUPPLEMENTS.map((entry) => {
          const skipped = entry.trainingOnly && !training;
          const taken = isDone(entry.id);
          return (
            <View key={entry.id} style={[styles.card, styles.cardTight, skipped && styles.cardSkipped]}>
              <View style={styles.cardHead}>
                <Ionicons
                  name={taken ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={taken ? colors.supplement : colors.border}
                />
                <View style={styles.headText}>
                  <Text style={styles.name}>{entry.name}</Text>
                  <Text style={styles.timing}>{entry.timing}</Text>
                </View>
                <Text style={styles.fixedDose}>{entry.fixedDose}</Text>
              </View>
              <Text style={styles.role}>{entry.role}</Text>
            </View>
          );
        })}

        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>Handling rules built into the schedule</Text>
          {[
            'Syringe 1 (GHK-Cu, BPC-157, TB-500, KPV) and syringe 2 (glutathione) stay separate — pH stability.',
            'IGF-1 LR3 only on training days, post-workout, with 50 g fast carbs going in immediately.',
            'Rotate sub-Q sites daily; the Today screen flags the site you used last.',
            'Zinc at 30 mg nightly holds the ~10:1 ratio against GHK-Cu.',
          ].map((rule) => (
            <View key={rule} style={styles.ruleRow}>
              <Ionicons name="ellipse" size={5} color={colors.volt} style={styles.bullet} />
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>

        <View style={styles.disclaimer}>
          <Ionicons name="alert-circle-outline" size={15} color={colors.inkDim} />
          <Text style={styles.disclaimerText}>{DISCLAIMER}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  cardTight: { paddingVertical: spacing.md },
  cardSkipped: { opacity: 0.5 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  syringeBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.injectionSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syringeBadgeSkipped: { backgroundColor: colors.cardAlt },
  syringeText: { fontSize: 13, fontWeight: '900', color: colors.injection },
  headText: { flex: 1 },
  name: { fontSize: 15, fontWeight: '800', color: colors.ink },
  timing: { fontSize: 11, color: colors.inkFaint, fontWeight: '700', marginTop: 1 },
  fixedDose: { fontSize: 13, fontWeight: '900', color: colors.supplement },
  doseRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  doseLabel: { fontSize: 11, fontWeight: '800', color: colors.inkFaint, textTransform: 'uppercase', letterSpacing: 0.5 },
  doseInput: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.bgAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  siteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.injectionSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  siteText: { fontSize: 11, fontWeight: '800', color: colors.injection },
  role: { fontSize: 12, lineHeight: 18, color: colors.inkDim, marginTop: spacing.sm },
  rulesCard: {
    backgroundColor: colors.bgAlt,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  rulesTitle: { fontSize: 13, fontWeight: '900', color: colors.ink, marginBottom: spacing.sm },
  ruleRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: 4 },
  bullet: { marginTop: 6 },
  ruleText: { flex: 1, fontSize: 12, lineHeight: 18, color: colors.inkDim, fontWeight: '600' },
  disclaimer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  disclaimerText: { flex: 1, fontSize: 11, lineHeight: 17, color: colors.inkFaint },
});
