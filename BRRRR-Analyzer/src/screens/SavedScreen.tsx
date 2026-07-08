import React, { useMemo } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';
import { PropertyCard } from '@/components/PropertyCard';
import { usePortfolio } from '@/context/PortfolioContext';
import { useSettings } from '@/context/SettingsContext';
import { getPropertyById } from '@/services/listingsProvider';
import { analyzeBrrrr } from '@/utils/brrrr';
import { applyOverride, DEAL_STAGES, DEAL_STAGE_LABEL, DealStage, Property } from '@/services/types';

interface Props {
  onSelectProperty: (id: string) => void;
}

export function SavedScreen({ onSelectProperty }: Props) {
  const { deals, savedIds } = usePortfolio();
  const { assumptions } = useSettings();

  const sections = useMemo(() => {
    const byStage = new Map<DealStage, Property[]>();
    for (const id of savedIds) {
      const base = getPropertyById(id);
      if (!base) continue;
      const deal = deals[id];
      const effective = applyOverride(base, deal.override);
      const stage = deal.stage;
      const list = byStage.get(stage) ?? [];
      list.push(effective);
      byStage.set(stage, list);
    }
    return DEAL_STAGES.filter((s) => byStage.has(s)).map((stage) => {
      const props = [...(byStage.get(stage) ?? [])].sort(
        (a, b) => analyzeBrrrr(b, assumptions).score - analyzeBrrrr(a, assumptions).score
      );
      return { title: DEAL_STAGE_LABEL[stage], data: props };
    });
  }, [deals, savedIds, assumptions]);

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Pipeline</Text>
        <Text style={styles.subtitle}>
          {savedIds.length} propert{savedIds.length === 1 ? 'y' : 'ies'} you're tracking, grouped by stage
        </Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <PropertyCard property={item} onPress={() => onSelectProperty(item.id)} />}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.data.length}</Text>
          </View>
        )}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={32} color={colors.inkFaint} />
            <Text style={styles.emptyText}>Nothing in your pipeline yet</Text>
            <Text style={styles.emptySub}>Tap the heart on a listing in Discover to start tracking it here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  title: { fontSize: 26, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: 13, color: colors.inkDim, marginTop: 2 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.primary },
  sectionCount: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkFaint,
    backgroundColor: colors.cardAlt,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl * 2, gap: 6 },
  emptyText: { color: colors.inkDim, fontWeight: '600', fontSize: 15 },
  emptySub: { color: colors.inkFaint, fontSize: 13, textAlign: 'center', paddingHorizontal: spacing.xl },
});
