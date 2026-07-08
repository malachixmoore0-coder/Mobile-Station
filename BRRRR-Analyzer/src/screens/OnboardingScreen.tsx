import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/theme';
import { Chip } from '@/components/Chip';
import { TownChips } from '@/components/TownChips';
import { useSettings } from '@/context/SettingsContext';

const BUDGET_PRESETS: [number, number, string][] = [
  [0, 100_000, 'Under $100k'],
  [100_000, 200_000, '$100k–200k'],
  [200_000, 350_000, '$200k–350k'],
  [350_000, 2_000_000, '$350k+'],
];

interface Props {
  onDone: () => void;
}

export function OnboardingScreen({ onDone }: Props) {
  const { preferences, updatePreferences, allNeighborhoods } = useSettings();
  const [city, setCity] = useState(preferences.city);
  const [state, setState] = useState(preferences.state);
  const [budget, setBudget] = useState<[number, number]>([preferences.minBudget, preferences.maxBudget]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>(preferences.targetNeighborhoods);
  const [minUnits, setMinUnits] = useState(preferences.minUnits);

  const finish = () => {
    updatePreferences({
      city: city.trim() || preferences.city,
      state: state.trim() || preferences.state,
      minBudget: budget[0],
      maxBudget: budget[1],
      targetNeighborhoods: neighborhoods,
      minUnits,
      onboarded: true,
    });
    onDone();
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconWrap}>
          <Ionicons name="trending-up" size={28} color={colors.white} />
        </View>
        <Text style={styles.title}>Welcome to BRRRR Scout</Text>
        <Text style={styles.subtitle}>
          Tell us your budget, target area, and unit count — we'll surface multi-family listings that fit the
          BRRRR method and score each one for you.
        </Text>

        <Text style={styles.label}>Market (city & state)</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.inputCity]}
            value={city}
            onChangeText={setCity}
            placeholder="City"
            placeholderTextColor={colors.inkFaint}
          />
          <TextInput
            style={[styles.input, styles.inputState]}
            value={state}
            onChangeText={setState}
            placeholder="State"
            placeholderTextColor={colors.inkFaint}
            autoCapitalize="characters"
            maxLength={2}
          />
        </View>

        <Text style={styles.label}>Budget</Text>
        <View style={styles.wrapRow}>
          {BUDGET_PRESETS.map(([min, max, label]) => (
            <Chip
              key={label}
              label={label}
              active={budget[0] === min && budget[1] === max}
              onPress={() => setBudget([min, max])}
            />
          ))}
        </View>

        <Text style={styles.label}>Nearby towns (optional)</Text>
        <TownChips values={neighborhoods} onChange={setNeighborhoods} suggestions={allNeighborhoods} />

        <Text style={styles.label}>Minimum units</Text>
        <View style={styles.stepperRow}>
          <TouchableOpacity style={styles.stepBtn} onPress={() => setMinUnits((n) => Math.max(2, n - 1))}>
            <Ionicons name="remove" size={18} color={colors.ink} />
          </TouchableOpacity>
          <Text style={styles.stepValue}>{minUnits}+ units</Text>
          <TouchableOpacity style={styles.stepBtn} onPress={() => setMinUnits((n) => Math.min(20, n + 1))}>
            <Ionicons name="add" size={18} color={colors.ink} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={finish}>
          <Text style={styles.ctaLabel}>Start browsing</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.footnote}>
          You can change any of this later in Settings — including adding real listing/contractor data feeds.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl * 2 },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { fontSize: 26, fontWeight: '800', color: colors.ink, marginBottom: spacing.sm },
  subtitle: { fontSize: 14, color: colors.inkDim, lineHeight: 20, marginBottom: spacing.xl },
  label: { fontSize: 13, fontWeight: '700', color: colors.inkDim, marginTop: spacing.lg, marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  input: {
    minWidth: 0,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  inputCity: { flex: 2 },
  inputState: { flex: 1 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { fontSize: 15, fontWeight: '700', color: colors.ink },
  cta: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  ctaLabel: { color: colors.white, fontSize: 15, fontWeight: '700' },
  footnote: { fontSize: 12, color: colors.inkFaint, textAlign: 'center', marginTop: spacing.md },
});
