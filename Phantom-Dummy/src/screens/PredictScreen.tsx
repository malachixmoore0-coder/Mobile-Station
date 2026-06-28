import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '@/theme';
import { PREDICT_CRYPTO, PREDICT_FEATURED, PREDICT_MATCHES, PredictOutcome } from '@/data/portfolio';
import { useToken } from '@/context/WalletContext';
import { formatUsd } from '@/utils/format';

function OddsBar({ outcomes }: { outcomes: PredictOutcome[] }) {
  const palette = [colors.up, colors.accent, colors.textFaint];
  return (
    <View style={styles.bar}>
      {outcomes.map((o, i) => (
        <View key={o.label} style={{ flex: o.pct, backgroundColor: palette[i % palette.length] }} />
      ))}
    </View>
  );
}

export function PredictScreen() {
  const btc = useToken('BTC');
  const btcPrice = btc?.price ?? 64800;
  const onTrack = btcPrice >= PREDICT_CRYPTO.target;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* Crypto target market */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Featured</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
      </View>
      <View style={styles.cryptoCard}>
        <Text style={styles.cryptoTitle}>Will {PREDICT_CRYPTO.asset} hit {formatUsd(PREDICT_CRYPTO.target)}?</Text>
        <Text style={styles.cryptoNow}>Now {formatUsd(btcPrice)}</Text>
        <View style={styles.upDownRow}>
          <View style={[styles.udPill, { backgroundColor: colors.up + '22' }]}>
            <Ionicons name="arrow-up" size={14} color={colors.up} />
            <Text style={[styles.udText, { color: colors.up }]}>Up · {PREDICT_CRYPTO.up}%</Text>
          </View>
          <View style={[styles.udPill, { backgroundColor: colors.down + '22' }]}>
            <Ionicons name="arrow-down" size={14} color={colors.down} />
            <Text style={[styles.udText, { color: colors.down }]}>Down · {PREDICT_CRYPTO.down}%</Text>
          </View>
        </View>
        <Text style={[styles.cryptoStatus, { color: onTrack ? colors.up : colors.textDim }]}>
          {onTrack ? 'On track to resolve YES' : 'Below target'}
        </Text>
      </View>

      {/* Featured sports */}
      <View style={styles.featCard}>
        <Text style={styles.featCat}>{PREDICT_FEATURED.emoji}  {PREDICT_FEATURED.category}</Text>
        <View style={styles.featTeams}>
          <Text style={styles.featTeam}>{PREDICT_FEATURED.a.flag} {PREDICT_FEATURED.a.label}</Text>
          <Text style={styles.vs}>vs</Text>
          <Text style={styles.featTeam}>{PREDICT_FEATURED.b.label} {PREDICT_FEATURED.b.flag}</Text>
        </View>
        <Text style={styles.featWhen}>{PREDICT_FEATURED.when}</Text>
        <OddsBar
          outcomes={[
            { label: 'a', pct: PREDICT_FEATURED.a.pct },
            { label: 'b', pct: PREDICT_FEATURED.b.pct },
            { label: 'draw', pct: PREDICT_FEATURED.draw },
          ]}
        />
        <View style={styles.featPctRow}>
          <Text style={[styles.featPct, { color: colors.up }]}>{PREDICT_FEATURED.a.pct}%</Text>
          <Text style={[styles.featPct, { color: colors.accent }]}>{PREDICT_FEATURED.b.pct}%</Text>
          <Text style={[styles.featPct, { color: colors.textFaint }]}>Draw {PREDICT_FEATURED.draw}%</Text>
        </View>
      </View>

      {/* Upcoming */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Upcoming</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
      </View>

      {PREDICT_MATCHES.map((m) => (
        <TouchableOpacity key={m.id} style={styles.matchCard} activeOpacity={0.8}>
          <View style={styles.matchTop}>
            <Text style={styles.matchTitle}>{m.title}</Text>
            <Text style={styles.matchWhen}>{m.when}</Text>
          </View>
          <OddsBar outcomes={m.outcomes} />
          <View style={styles.matchOutcomes}>
            {m.outcomes.map((o, i) => (
              <View key={o.label} style={styles.outcome}>
                <Text style={styles.outcomeLabel} numberOfLines={1}>
                  {o.flag ? o.flag + ' ' : ''}{o.label}
                </Text>
                <Text style={[styles.outcomePct, { color: [colors.up, colors.accent, colors.textDim][i % 3] }]}>{o.pct}%</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      ))}

      <Text style={styles.disclaimer}>
        Prediction markets may be unavailable in some jurisdictions. Demo only — not real wagers.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, paddingTop: spacing.sm },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.md, marginBottom: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  cryptoCard: { backgroundColor: colors.bgElevated, borderRadius: radius.md, padding: spacing.lg, gap: 6, marginBottom: spacing.md },
  cryptoTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  cryptoNow: { color: colors.textDim, fontSize: 14 },
  upDownRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 8 },
  udPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill },
  udText: { fontSize: 14, fontWeight: '700' },
  cryptoStatus: { fontSize: 13, marginTop: 8, fontWeight: '600' },
  featCard: { backgroundColor: colors.bgElevated, borderRadius: radius.md, padding: spacing.lg, gap: 8, marginBottom: spacing.md },
  featCat: { color: colors.textDim, fontSize: 13, fontWeight: '600' },
  featTeams: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 4 },
  featTeam: { color: colors.text, fontSize: 18, fontWeight: '700' },
  vs: { color: colors.textFaint, fontSize: 14 },
  featWhen: { color: colors.textFaint, fontSize: 13, textAlign: 'center', marginBottom: 6 },
  bar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2, marginTop: 4 },
  featPctRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  featPct: { fontSize: 13, fontWeight: '700' },
  matchCard: { backgroundColor: colors.bgElevated, borderRadius: radius.md, padding: spacing.lg, gap: 10, marginBottom: spacing.md },
  matchTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  matchTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  matchWhen: { color: colors.textFaint, fontSize: 13 },
  matchOutcomes: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  outcome: { flex: 1, gap: 2 },
  outcomeLabel: { color: colors.textDim, fontSize: 12 },
  outcomePct: { fontSize: 14, fontWeight: '700' },
  disclaimer: { color: colors.textFaint, fontSize: 11, lineHeight: 16, marginTop: spacing.md, textAlign: 'center' },
});
