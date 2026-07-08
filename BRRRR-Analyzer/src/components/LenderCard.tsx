import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing } from '@/theme';
import { formatUsd, formatPct } from '@/utils/format';
import { Lender } from '@/services/types';
import { lenderScore } from '@/services/lendersProvider';

interface Props {
  lender: Lender;
  highlight?: boolean;
}

export function LenderCard({ lender, highlight }: Props) {
  return (
    <View style={[styles.card, highlight && styles.cardHighlight]}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{lender.name}</Text>
            {highlight && (
              <View style={styles.pickBadge}>
                <Ionicons name="ribbon" size={11} color={colors.great} />
                <Text style={styles.pickText}>Best terms</Text>
              </View>
            )}
          </View>
          <Text style={styles.categories}>{lender.categories.join(' · ')}</Text>
        </View>
        <Text style={styles.rate}>{formatPct(lender.ratesFromPct, { decimals: 2 })}+</Text>
      </View>

      <View style={styles.ratingRow}>
        <Ionicons name="star" size={13} color={colors.gold} />
        <Text style={styles.ratingText}>
          {lender.rating.toFixed(1)} ({lender.reviewCount})
        </Text>
        <Text style={styles.metaText}>Up to {lender.maxLtvPct}% LTV</Text>
        <Text style={styles.metaText}>{lender.pointsFrom}+ pts</Text>
      </View>

      <Text style={styles.bio}>{lender.bio}</Text>

      <View style={styles.footerRow}>
        <View>
          <Text style={styles.footerLabel}>Loan range</Text>
          <Text style={styles.footerValue}>
            {formatUsd(lender.minLoanAmount)}–{formatUsd(lender.maxLoanAmount)}
          </Text>
        </View>
        <View>
          <Text style={styles.footerLabel}>Typical close</Text>
          <Text style={styles.footerValue}>~{lender.closingTimelineDays} days</Text>
        </View>
        {!!lender.phone && (
          <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(`tel:${lender.phone}`)}>
            <Ionicons name="call-outline" size={13} color={colors.primary} />
            <Text style={styles.contactText}>{lender.phone}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
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
  categories: { fontSize: 12, color: colors.inkDim, marginTop: 2 },
  rate: { fontSize: 16, fontWeight: '800', color: colors.primaryTint },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: spacing.sm, flexWrap: 'wrap' },
  ratingText: { fontSize: 12, color: colors.ink, fontWeight: '600' },
  metaText: { fontSize: 11, color: colors.inkFaint, fontWeight: '600' },
  bio: { fontSize: 13, color: colors.inkDim, marginTop: spacing.sm, lineHeight: 18 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: spacing.sm,
  },
  footerLabel: { fontSize: 10, color: colors.inkFaint, fontWeight: '600' },
  footerValue: { fontSize: 12, color: colors.ink, fontWeight: '700', marginTop: 1 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  contactText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
});
