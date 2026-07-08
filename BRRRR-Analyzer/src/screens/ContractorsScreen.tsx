import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing } from '@/theme';
import { Chip } from '@/components/Chip';
import { LiveIndicator } from '@/components/LiveIndicator';
import { Contractor, TradeCategory } from '@/services/types';
import { MOCK_CONTRACTORS } from '@/data/mockContractors';
import { useContractors, costEfficiencyScore } from '@/services/contractorsProvider';

const ALL_TRADES: TradeCategory[] = [
  'General Contractor',
  'Roofing',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Kitchen & Bath',
  'Flooring',
  'Painting',
  'Foundation',
  'Windows & Doors',
  'Landscaping',
];

export function ContractorsScreen() {
  const [trade, setTrade] = useState<TradeCategory | 'All'>('All');
  const tradesNeeded = trade === 'All' ? [] : [trade];
  const { contractors, isLive } = useContractors(tradesNeeded);
  const pool = tradesNeeded.length > 0 ? contractors : MOCK_CONTRACTORS;

  const list = useMemo(() => {
    const filtered = trade === 'All' ? pool : pool.filter((c) => c.trades.includes(trade));
    return [...filtered].sort((a, b) => costEfficiencyScore(b) - costEfficiencyScore(a));
  }, [pool, trade]);

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Contractors</Text>
          <Text style={styles.subtitle}>{list.length} pros ready for your rehab</Text>
        </View>
        <LiveIndicator isLive={isLive} lastUpdated={Date.now()} />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={['All', ...ALL_TRADES]}
        keyExtractor={(t) => t}
        contentContainerStyle={styles.tradeRow}
        renderItem={({ item }) => (
          <Chip label={item} active={trade === item} onPress={() => setTrade(item as TradeCategory | 'All')} />
        )}
      />

      <FlatList
        data={list}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <ContractorCard contractor={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={32} color={colors.inkFaint} />
            <Text style={styles.emptyText}>No contractors found for this trade yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

export function ContractorCard({ contractor, highlight }: { contractor: Contractor; highlight?: boolean }) {
  const efficiency = costEfficiencyScore(contractor);
  const tier = '$'.repeat(contractor.priceTier);

  return (
    <View style={[styles.card, highlight && styles.cardHighlight]}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{contractor.name}</Text>
            {highlight && (
              <View style={styles.pickBadge}>
                <Ionicons name="ribbon" size={11} color={colors.great} />
                <Text style={styles.pickText}>Cost-efficient pick</Text>
              </View>
            )}
          </View>
          <Text style={styles.trades}>{contractor.trades.join(' · ')}</Text>
        </View>
        <Text style={styles.tier}>{tier}</Text>
      </View>

      <View style={styles.ratingRow}>
        <Ionicons name="star" size={13} color={colors.gold} />
        <Text style={styles.ratingText}>
          {contractor.rating.toFixed(1)} ({contractor.reviewCount})
        </Text>
        {contractor.licensed && (
          <View style={styles.verifiedTag}>
            <Ionicons name="shield-checkmark" size={12} color={colors.primaryTint} />
            <Text style={styles.verifiedText}>Licensed & insured</Text>
          </View>
        )}
        <Text style={styles.responseText}>Responds in ~{contractor.responseTimeHours}h</Text>
      </View>

      {!!contractor.bio && <Text style={styles.bio}>{contractor.bio}</Text>}

      <View style={styles.footerRow}>
        <Text style={styles.efficiency}>Efficiency score {efficiency}</Text>
        {!!contractor.phone && (
          <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(`tel:${contractor.phone}`)}>
            <Ionicons name="call-outline" size={13} color={colors.primary} />
            <Text style={styles.contactText}>{contractor.phone}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
  tradeRow: { paddingHorizontal: spacing.lg, gap: 8, paddingBottom: spacing.md },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  cardHighlight: { borderColor: colors.great, borderWidth: 1.5 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontSize: 16, fontWeight: '700', color: colors.ink },
  pickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.greatSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pickText: { color: colors.great, fontSize: 10, fontWeight: '700' },
  trades: { fontSize: 12, color: colors.inkDim, marginTop: 2 },
  tier: { fontSize: 14, fontWeight: '800', color: colors.gold },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm, flexWrap: 'wrap' },
  ratingText: { fontSize: 12, color: colors.ink, fontWeight: '600' },
  verifiedTag: { flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 4 },
  verifiedText: { fontSize: 11, color: colors.primaryTint, fontWeight: '600' },
  responseText: { fontSize: 11, color: colors.inkFaint, marginLeft: 'auto' },
  bio: { fontSize: 13, color: colors.inkDim, marginTop: spacing.sm, lineHeight: 18 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  efficiency: { fontSize: 11, color: colors.inkFaint, fontWeight: '600' },
  contactBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contactText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl * 2, gap: 6 },
  emptyText: { color: colors.inkDim, fontWeight: '600', fontSize: 14, textAlign: 'center', paddingHorizontal: spacing.xl },
});
