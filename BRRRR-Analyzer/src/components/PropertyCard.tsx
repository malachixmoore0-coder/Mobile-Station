import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '@/services/types';
import { colors, radius, shadow, spacing } from '@/theme';
import { formatUsd } from '@/utils/format';
import { analyzeBrrrr } from '@/utils/brrrr';
import { ScoreBadge } from '@/components/ScoreBadge';
import { StatusPill } from '@/components/StatusPill';
import { usePortfolio } from '@/context/PortfolioContext';

interface Props {
  property: Property;
  onPress: () => void;
}

export function PropertyCard({ property, onPress }: Props) {
  const { isSaved, toggleSaved } = usePortfolio();
  const analysis = analyzeBrrrr(property);
  const saved = isSaved(property.id);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.photoWrap}>
        <Image source={{ uri: property.photos[0] }} style={styles.photo} />
        <View style={styles.photoOverlayTop}>
          <StatusPill status={property.status} daysOnMarket={property.daysOnMarket} />
          <TouchableOpacity style={styles.saveBtn} onPress={() => toggleSaved(property.id)} hitSlop={8}>
            <Ionicons name={saved ? 'heart' : 'heart-outline'} size={18} color={saved ? colors.poor : colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.scoreOverlay}>
          <ScoreBadge score={analysis.score} />
        </View>
        {property.sources.length > 1 && (
          <View style={styles.sourceOverlay}>
            <Ionicons name="layers-outline" size={11} color={colors.white} />
            <Text style={styles.sourceText}>{property.sources.length} sites</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatUsd(property.price)}</Text>
          <Text style={styles.propType}>{property.propertyType}</Text>
        </View>
        <Text style={styles.address} numberOfLines={1}>{property.address}</Text>
        <Text style={styles.sub} numberOfLines={1}>
          {property.neighborhood} · {property.unitCount} units · {property.sqftTotal.toLocaleString()} sqft
        </Text>

        <View style={styles.statsRow}>
          <Stat label="Cash flow/mo" value={formatUsd(analysis.monthlyCashFlow)} positive={analysis.monthlyCashFlow >= 0} />
          <Stat
            label="Cash-on-cash"
            value={analysis.cashOnCashReturn === null ? '∞' : `${analysis.cashOnCashReturn.toFixed(1)}%`}
            positive
          />
          <Stat label="ARV" value={formatUsd(property.arvEstimate)} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function Stat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, positive !== undefined && { color: positive ? colors.great : colors.poor }]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  photoWrap: { height: 170, backgroundColor: colors.bgAlt },
  photo: { width: '100%', height: '100%' },
  photoOverlayTop: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  saveBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreOverlay: { position: 'absolute', bottom: spacing.sm, left: spacing.sm },
  sourceOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.overlay,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sourceText: { color: colors.white, fontSize: 11, fontWeight: '600' },
  body: { padding: spacing.lg, gap: 4 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  propType: { color: colors.primaryTint, fontSize: 12, fontWeight: '700' },
  address: { color: colors.ink, fontSize: 15, fontWeight: '600', marginTop: 2 },
  sub: { color: colors.inkDim, fontSize: 13 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  stat: { alignItems: 'flex-start' },
  statValue: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  statLabel: { color: colors.inkFaint, fontSize: 11, marginTop: 2 },
});
