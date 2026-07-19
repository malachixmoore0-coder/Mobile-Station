import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/theme';
import { Card } from '@/components/Card';
import { Sparkline } from '@/components/Sparkline';
import { MARKET_SYMBOLS } from '@/data/markets';
import { generateSeries, nextTick } from '@/utils/randomWalk';
import { formatCurrency, formatPercent } from '@/utils/format';

function buildInitial(): Record<string, number[]> {
  const map: Record<string, number[]> = {};
  for (const s of MARKET_SYMBOLS) {
    map[s.id] = generateSeries(s.id, s.basePrice, s.volatility, 40);
  }
  return map;
}

export function MarketsScreen() {
  const insets = useSafeAreaInsets();
  const [series, setSeries] = useState<Record<string, number[]>>(buildInitial);
  const seriesRef = useRef(series);
  seriesRef.current = series;

  useEffect(() => {
    const interval = setInterval(() => {
      setSeries((prev) => {
        const next: Record<string, number[]> = {};
        for (const s of MARKET_SYMBOLS) {
          const arr = prev[s.id];
          const last = arr[arr.length - 1];
          const updated = [...arr.slice(1), nextTick(last, s.volatility)];
          next[s.id] = updated;
        }
        return next;
      });
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.lg, paddingBottom: 140 }]}>
      <Text style={styles.title}>Markets</Text>
      <Text style={styles.subtitle}>Simulated tracker for context while you trade — not live pricing.</Text>

      {MARKET_SYMBOLS.map((symbol) => {
        const values = series[symbol.id];
        const price = values[values.length - 1];
        const change = (price - values[0]) / values[0];
        const positive = change >= 0;
        return (
          <Card key={symbol.id} style={styles.card}>
            <View style={styles.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.symbolLabel}>{symbol.label}</Text>
                <Text style={styles.symbolName}>{symbol.fullName}</Text>
                <Text style={styles.price}>{formatCurrency(price)}</Text>
                <View style={[styles.changeChip, { backgroundColor: positive ? colors.mintSoft : colors.roseSoft }]}>
                  <Text style={[styles.changeText, { color: positive ? colors.mint : colors.rose }]}>
                    {positive ? '▲' : '▼'} {formatPercent(Math.abs(change))}
                  </Text>
                </View>
              </View>
              <Sparkline values={values} width={110} height={54} color={positive ? colors.mint : colors.rose} />
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg },
  title: { color: colors.ink, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.inkFaint, fontSize: 12, marginTop: 4, marginBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  symbolLabel: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  symbolName: { color: colors.inkFaint, fontSize: 11, marginTop: 1 },
  price: { color: colors.ink, fontSize: 20, fontWeight: '700', marginTop: spacing.sm },
  changeChip: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: spacing.xs,
  },
  changeText: { fontSize: 11, fontWeight: '700' },
});
