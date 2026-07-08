import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';
import { Chip } from '@/components/Chip';
import { PropertyCard } from '@/components/PropertyCard';
import { usePortfolio } from '@/context/PortfolioContext';
import { mockListingsEngine } from '@/services/mockListingsEngine';
import { analyzeBrrrr } from '@/utils/brrrr';
import { Property } from '@/services/types';

interface Props {
  onSelectProperty: (id: string) => void;
}

type SortKey = 'brrrrScore' | 'cashFlow' | 'price';

export function SavedScreen({ onSelectProperty }: Props) {
  const { savedIds } = usePortfolio();
  const [sortBy, setSortBy] = useState<SortKey>('brrrrScore');

  const saved = useMemo(() => {
    const all = mockListingsEngine.getSnapshot();
    const props = savedIds.map((id) => all.find((p) => p.id === id)).filter((p): p is Property => !!p);
    const withScore = props.map((p) => ({ property: p, analysis: analyzeBrrrr(p) }));
    withScore.sort((a, b) => {
      if (sortBy === 'price') return a.property.price - b.property.price;
      if (sortBy === 'cashFlow') return b.analysis.monthlyCashFlow - a.analysis.monthlyCashFlow;
      return b.analysis.score - a.analysis.score;
    });
    return withScore.map((w) => w.property);
  }, [savedIds, sortBy]);

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
        <Text style={styles.subtitle}>{saved.length} propert{saved.length === 1 ? 'y' : 'ies'} on your watchlist</Text>
      </View>

      {saved.length > 0 && (
        <View style={styles.sortRow}>
          <Chip label="Best score" active={sortBy === 'brrrrScore'} onPress={() => setSortBy('brrrrScore')} />
          <Chip label="Best cash flow" active={sortBy === 'cashFlow'} onPress={() => setSortBy('cashFlow')} />
          <Chip label="Lowest price" active={sortBy === 'price'} onPress={() => setSortBy('price')} />
        </View>
      )}

      <FlatList
        data={saved}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <PropertyCard property={item} onPress={() => onSelectProperty(item.id)} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={32} color={colors.inkFaint} />
            <Text style={styles.emptyText}>Nothing saved yet</Text>
            <Text style={styles.emptySub}>Tap the heart on a listing in Discover to add it here.</Text>
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
  sortRow: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing.lg, marginBottom: spacing.md, flexWrap: 'wrap' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl * 2, gap: 6 },
  emptyText: { color: colors.inkDim, fontWeight: '600', fontSize: 15 },
  emptySub: { color: colors.inkFaint, fontSize: 13, textAlign: 'center', paddingHorizontal: spacing.xl },
});
