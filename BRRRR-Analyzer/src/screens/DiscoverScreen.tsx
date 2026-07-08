import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/theme';
import { DEFAULT_FILTERS, Property } from '@/services/types';
import { useListings } from '@/services/listingsProvider';
import { useSettings } from '@/context/SettingsContext';
import { PropertyCard } from '@/components/PropertyCard';
import { LiveIndicator } from '@/components/LiveIndicator';
import { FiltersModal } from '@/components/FiltersModal';

interface Props {
  onSelectProperty: (id: string) => void;
}

export function DiscoverScreen({ onSelectProperty }: Props) {
  const { preferences, allNeighborhoods } = useSettings();
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    minPrice: preferences.minBudget,
    maxPrice: preferences.maxBudget,
    minUnits: preferences.minUnits,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { properties, allCount, isLive, lastUpdated, error } = useListings(filters);

  const activeFilterCount =
    (filters.neighborhoods.length > 0 ? 1 : 0) +
    (filters.status.length !== DEFAULT_FILTERS.status.length ? 1 : 0) +
    (filters.minTransitScore > 0 ? 1 : 0);

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>
            {preferences.city}, {preferences.state} · {properties.length} of {allCount} matching
          </Text>
        </View>
        <LiveIndicator isLive={isLive} lastUpdated={lastUpdated} />
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning-outline" size={14} color={colors.poor} />
          <Text style={styles.errorText}>Live feed error — showing last known data. {error}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.filterBar} activeOpacity={0.8} onPress={() => setFiltersOpen(true)}>
        <Ionicons name="options-outline" size={16} color={colors.primary} />
        <Text style={styles.filterBarText}>Filters</Text>
        {activeFilterCount > 0 && (
          <View style={styles.filterCount}>
            <Text style={styles.filterCountText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <FlatList<Property>
        data={properties}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <PropertyCard
            property={item}
            onPress={() => onSelectProperty(item.id)}
            isTopPick={index === 0 && filters.sortBy === 'brrrrScore' && properties.length > 1}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="business-outline" size={32} color={colors.inkFaint} />
            <Text style={styles.emptyText}>No properties match these filters yet.</Text>
            <Text style={styles.emptySub}>Try widening your budget or town picks.</Text>
          </View>
        }
      />

      <FiltersModal
        visible={filtersOpen}
        filters={filters}
        neighborhoods={preferences.targetNeighborhoods.length > 0 ? preferences.targetNeighborhoods : allNeighborhoods}
        onApply={(next) => {
          setFilters(next);
          setFiltersOpen(false);
        }}
        onClose={() => setFiltersOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: { fontSize: 26, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: 13, color: colors.inkDim, marginTop: 2 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.poorSoft,
    borderRadius: radius.sm,
  },
  errorText: { color: colors.poor, fontSize: 12, flex: 1 },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  filterBarText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  filterCount: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterCountText: { color: colors.white, fontSize: 10, fontWeight: '800' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl * 2, gap: 6 },
  emptyText: { color: colors.inkDim, fontWeight: '600', fontSize: 15 },
  emptySub: { color: colors.inkFaint, fontSize: 13 },
});
