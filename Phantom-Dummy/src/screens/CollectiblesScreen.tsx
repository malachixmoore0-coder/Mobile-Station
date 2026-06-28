import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '@/theme';
import { NFTS } from '@/data/portfolio';
import { useToken } from '@/context/WalletContext';
import { useSettings } from '@/context/SettingsContext';
import { formatUsd } from '@/utils/format';

export function CollectiblesScreen() {
  const { showDemoLabels, hideBalances } = useSettings();
  const sol = useToken('SOL');
  const solPrice = sol?.price ?? 170;

  const totalUsd = useMemo(
    () => NFTS.reduce((sum, n) => sum + n.floorSol * solPrice, 0),
    [solPrice],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Collectibles</Text>
        <Ionicons name="grid-outline" size={22} color={colors.textDim} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Floor value</Text>
          <Text style={styles.summaryValue}>{hideBalances ? '••••••' : formatUsd(totalUsd)}</Text>
          <Text style={styles.summarySub}>{NFTS.length} items · {NFTS.reduce((s, n) => s + n.floorSol, 0)} SOL</Text>
        </View>

        <View style={styles.grid}>
          {NFTS.map((n) => (
            <TouchableOpacity key={n.id} style={styles.card} activeOpacity={0.8}>
              <View style={[styles.art, { backgroundColor: n.tint + '33' }]}>
                <Text style={styles.glyph}>{n.glyph}</Text>
              </View>
              <Text style={styles.nftName} numberOfLines={1}>{n.name}</Text>
              <Text style={styles.collection} numberOfLines={1}>{n.collection}</Text>
              <View style={styles.floorRow}>
                <Text style={styles.floorLabel}>Floor</Text>
                <Text style={styles.floorValue}>{n.floorSol} SOL</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {showDemoLabels && <Text style={styles.disclaimer}>Demo collection · simulated floor prices</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const GAP = spacing.md;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 24 },
  summary: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  summaryLabel: { color: colors.textDim, fontSize: 14 },
  summaryValue: { color: colors.text, fontSize: 34, fontWeight: '800', letterSpacing: -1, marginTop: 4 },
  summarySub: { color: colors.textFaint, fontSize: 13, marginTop: 4 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: GAP,
  },
  card: {
    width: '48%',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: 4,
  },
  art: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  glyph: { fontSize: 60 },
  nftName: { color: colors.text, fontSize: 14, fontWeight: '700', paddingHorizontal: 4 },
  collection: { color: colors.textDim, fontSize: 12, paddingHorizontal: 4 },
  floorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  floorLabel: { color: colors.textFaint, fontSize: 12 },
  floorValue: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  disclaimer: { color: colors.textFaint, fontSize: 11, textAlign: 'center', marginTop: spacing.lg },
});
