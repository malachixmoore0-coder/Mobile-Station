import React, { useState } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/theme';
import { Chip } from '@/components/Chip';
import { SearchFilters, ListingStatus } from '@/services/types';

const BUDGET_PRESETS: [number, number, string][] = [
  [0, 100_000, 'Under $100k'],
  [100_000, 200_000, '$100k–200k'],
  [200_000, 350_000, '$200k–350k'],
  [350_000, 2_000_000, '$350k+'],
];

const STATUS_OPTIONS: ListingStatus[] = ['Active', 'Pending', 'Sold', 'Off Market'];
const SORT_OPTIONS: { key: SearchFilters['sortBy']; label: string }[] = [
  { key: 'brrrrScore', label: 'BRRRR score' },
  { key: 'cashFlow', label: 'Cash flow' },
  { key: 'price', label: 'Price' },
  { key: 'daysOnMarket', label: 'Days on market' },
];

interface Props {
  visible: boolean;
  filters: SearchFilters;
  neighborhoods: string[];
  onApply: (filters: SearchFilters) => void;
  onClose: () => void;
}

export function FiltersModal({ visible, filters, neighborhoods, onApply, onClose }: Props) {
  const [draft, setDraft] = useState(filters);

  React.useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  const toggleNeighborhood = (n: string) => {
    setDraft((d) => ({
      ...d,
      neighborhoods: d.neighborhoods.includes(n)
        ? d.neighborhoods.filter((x) => x !== n)
        : [...d.neighborhoods, n],
    }));
  };

  const toggleStatus = (s: ListingStatus) => {
    setDraft((d) => ({
      ...d,
      status: d.status.includes(s) ? d.status.filter((x) => x !== s) : [...d.status, s],
    }));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.section}>Budget</Text>
            <View style={styles.wrapRow}>
              {BUDGET_PRESETS.map(([min, max, label]) => (
                <Chip
                  key={label}
                  label={label}
                  active={draft.minPrice === min && draft.maxPrice === max}
                  onPress={() => setDraft((d) => ({ ...d, minPrice: min, maxPrice: max }))}
                />
              ))}
            </View>

            <Text style={styles.section}>Town</Text>
            {neighborhoods.length === 0 ? (
              <Text style={styles.emptyHint}>
                Add towns in Settings to filter by them here.
              </Text>
            ) : (
              <View style={styles.wrapRow}>
                {neighborhoods.map((n) => (
                  <Chip key={n} label={n} active={draft.neighborhoods.includes(n)} onPress={() => toggleNeighborhood(n)} />
                ))}
              </View>
            )}

            <Text style={styles.section}>Minimum units</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setDraft((d) => ({ ...d, minUnits: Math.max(2, d.minUnits - 1) }))}
              >
                <Ionicons name="remove" size={18} color={colors.ink} />
              </TouchableOpacity>
              <Text style={styles.stepValue}>{draft.minUnits}+ units</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setDraft((d) => ({ ...d, minUnits: Math.min(20, d.minUnits + 1) }))}
              >
                <Ionicons name="add" size={18} color={colors.ink} />
              </TouchableOpacity>
            </View>

            <Text style={styles.section}>Status</Text>
            <View style={styles.wrapRow}>
              {STATUS_OPTIONS.map((s) => (
                <Chip key={s} label={s} active={draft.status.includes(s)} onPress={() => toggleStatus(s)} />
              ))}
            </View>

            <Text style={styles.section}>Sort by</Text>
            <View style={styles.wrapRow}>
              {SORT_OPTIONS.map((o) => (
                <Chip
                  key={o.key}
                  label={o.label}
                  active={draft.sortBy === o.key}
                  onPress={() => setDraft((d) => ({ ...d, sortBy: o.key }))}
                />
              ))}
            </View>

            <Text style={styles.section}>Min transit score</Text>
            <View style={styles.wrapRow}>
              {[0, 40, 50, 60, 70].map((v) => (
                <Chip
                  key={v}
                  label={v === 0 ? 'Any' : `${v}+`}
                  active={draft.minTransitScore === v}
                  onPress={() => setDraft((d) => ({ ...d, minTransitScore: v }))}
                />
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.applyBtn} activeOpacity={0.85} onPress={() => onApply(draft)}>
            <Text style={styles.applyLabel}>Show results</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '85%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { fontSize: 20, fontWeight: '800', color: colors.ink },
  section: { fontSize: 13, fontWeight: '700', color: colors.inkDim, marginTop: spacing.lg, marginBottom: spacing.sm },
  emptyHint: { fontSize: 12, color: colors.inkFaint, fontStyle: 'italic' },
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
  applyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  applyLabel: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
