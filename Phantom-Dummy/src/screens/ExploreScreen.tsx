import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '@/theme';
import { TRENDING, NEWS, EXPLORE_LISTS } from '@/data/portfolio';
import { useWallet } from '@/context/WalletContext';
import { formatPrice, formatPct, formatMcap } from '@/utils/format';
import { TokenGlyph } from '@/components/TokenGlyph';

interface Props {
  onSelectToken: (symbol: string) => void;
}

const SEGMENTS: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'tokens', label: 'Tokens', icon: 'pricetag' },
  { key: 'perps', label: 'Perps', icon: 'trending-up' },
  { key: 'people', label: 'People', icon: 'people' },
];

export function ExploreScreen({ onSelectToken }: Props) {
  const { tick } = useWallet();
  const [seg, setSeg] = useState('tokens');

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <View style={styles.segments}>
        {SEGMENTS.map((s) => {
          const active = s.key === seg;
          return (
            <TouchableOpacity
              key={s.key}
              style={[styles.segPill, active && styles.segPillActive]}
              activeOpacity={0.8}
              onPress={() => setSeg(s.key)}
            >
              <Ionicons name={s.icon} size={15} color={active ? colors.accent : colors.textDim} />
              <Text style={[styles.segText, active && styles.segTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Trending Tokens */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Trending Tokens</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
      </View>
      {TRENDING.slice(0, 5).map((t) => {
        const tUp = t.change24h >= 0;
        // jitter the price slightly off the shared tick so it feels live
        const live = t.price * (1 + Math.sin((tick + t.symbol.charCodeAt(0)) / 3) * 0.004);
        return (
          <TouchableOpacity key={t.symbol} style={styles.row} activeOpacity={0.65} onPress={() => onSelectToken(t.symbol)}>
            <TokenGlyph symbol={t.symbol} size={36} verified={t.verified} />
            <View style={styles.info}>
              <Text style={styles.name}>{t.name}</Text>
              <Text style={styles.mc}>{formatMcap(t.marketCap)} MC</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.price}>{formatPrice(live)}</Text>
              <Text style={[styles.change, { color: tUp ? colors.up : colors.down }]}>{formatPct(t.change24h)}</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Recent News */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Recent News</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
      </View>
      {NEWS.map((n) => {
        const bull = n.sentiment === 'Bullish';
        return (
          <View key={n.id} style={styles.newsCard}>
            <View style={styles.newsTop}>
              <Text style={styles.newsSource}>{n.source}</Text>
              <Text style={styles.newsTime}>· {n.time}</Text>
            </View>
            <Text style={styles.newsTitle}>{n.title}</Text>
            <View style={styles.newsBottom}>
              <Text style={styles.newsTicker}>{n.ticker}</Text>
              <View style={[styles.sentPill, { backgroundColor: (bull ? colors.up : colors.down) + '22' }]}>
                <Text style={[styles.sentText, { color: bull ? colors.up : colors.down }]}>{n.sentiment}</Text>
              </View>
            </View>
          </View>
        );
      })}

      {/* Lists */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Lists</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
      </View>
      <View style={styles.lists}>
        {EXPLORE_LISTS.map((l) => (
          <TouchableOpacity key={l} style={styles.listPill} activeOpacity={0.8}>
            <Text style={styles.listText}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, paddingTop: spacing.sm },
  segments: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  segPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: colors.bgElevated },
  segPillActive: { backgroundColor: colors.accent + '26' },
  segText: { color: colors.textDim, fontSize: 14, fontWeight: '600' },
  segTextActive: { color: colors.accent },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.lg, marginBottom: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 10 },
  info: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 15, fontWeight: '600' },
  mc: { color: colors.textDim, fontSize: 13 },
  right: { alignItems: 'flex-end', gap: 2 },
  price: { color: colors.text, fontSize: 14, fontWeight: '600' },
  change: { fontSize: 13, fontWeight: '600' },
  newsCard: { backgroundColor: colors.bgElevated, borderRadius: radius.md, padding: spacing.lg, gap: 6, marginBottom: spacing.sm },
  newsTop: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  newsSource: { color: colors.textDim, fontSize: 13, fontWeight: '600' },
  newsTime: { color: colors.textFaint, fontSize: 13 },
  newsTitle: { color: colors.text, fontSize: 15, fontWeight: '600', lineHeight: 20 },
  newsBottom: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  newsTicker: { color: colors.textDim, fontSize: 13, fontWeight: '700' },
  sentPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  sentText: { fontSize: 12, fontWeight: '700' },
  lists: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  listPill: { paddingVertical: 9, paddingHorizontal: 15, borderRadius: radius.pill, backgroundColor: colors.bgElevated },
  listText: { color: colors.text, fontSize: 14, fontWeight: '600' },
});
