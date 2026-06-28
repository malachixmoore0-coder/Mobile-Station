import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '@/theme';
import { TRENDING, DAPPS } from '@/data/portfolio';
import { useWallet } from '@/context/WalletContext';
import { formatPrice, formatPct } from '@/utils/format';
import { TokenGlyph } from '@/components/TokenGlyph';
import { Sparkline } from '@/components/Sparkline';
import { buildSeries } from '@/data/portfolio';

interface Props {
  onSelectToken: (symbol: string) => void;
}

export function ExploreScreen({ onSelectToken }: Props) {
  const { tokens, tick } = useWallet();
  const [query, setQuery] = useState('');

  // Use live wallet prices where the trending token is also held; otherwise
  // jitter the base price off the shared tick so the whole board feels live.
  const live = useMemo(
    () =>
      TRENDING.map((t) => {
        const held = tokens.find((h) => h.symbol === t.symbol);
        const jitter = 1 + Math.sin((tick + t.symbol.charCodeAt(0)) / 3) * 0.004;
        return { ...t, price: held ? held.price : t.price * jitter };
      }),
    [tokens, tick],
  );

  const filtered = query
    ? live.filter(
        (t) =>
          t.symbol.toLowerCase().includes(query.toLowerCase()) ||
          t.name.toLowerCase().includes(query.toLowerCase()),
      )
    : live;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textFaint} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tokens, dApps"
          placeholderTextColor={colors.textFaint}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={colors.textFaint} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {!query && (
          <>
            <Text style={styles.sectionTitle}>Featured dApps</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dappRow}>
              {DAPPS.map((d) => (
                <TouchableOpacity key={d.id} style={styles.dapp} activeOpacity={0.8}>
                  <View style={[styles.dappIcon, { backgroundColor: d.tint + '26' }]}>
                    <Text style={styles.dappGlyph}>{d.glyph}</Text>
                  </View>
                  <Text style={styles.dappName} numberOfLines={1}>{d.name}</Text>
                  <Text style={styles.dappCat} numberOfLines={1}>{d.category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <Text style={styles.sectionTitle}>{query ? 'Results' : 'Trending'}</Text>
        {filtered.map((t, i) => {
          const up = t.change24h >= 0;
          const spark = buildSeries(t.price, t.symbol.charCodeAt(0) * 5 + 1, 24, up ? 0.03 : 0.05, up ? 0.2 : -0.15);
          return (
            <TouchableOpacity key={t.symbol} style={styles.row} activeOpacity={0.7} onPress={() => onSelectToken(t.symbol)}>
              <Text style={styles.rank}>{i + 1}</Text>
              <TokenGlyph symbol={t.symbol} size={38} />
              <View style={styles.info}>
                <Text style={styles.name}>{t.name}</Text>
                <Text style={styles.sym}>{t.symbol}</Text>
              </View>
              <Sparkline data={spark} up={up} />
              <View style={styles.right}>
                <Text style={styles.price}>{formatPrice(t.price)}</Text>
                <Text style={[styles.change, { color: up ? colors.up : colors.down }]}>{formatPct(t.change24h)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        {filtered.length === 0 && <Text style={styles.empty}>No tokens match "{query}"</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.bgElevated,
    marginHorizontal: spacing.lg,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 11,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15, padding: 0 },
  scroll: { paddingBottom: 24, paddingTop: spacing.md },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  dappRow: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingRight: spacing.xl },
  dapp: { width: 86, alignItems: 'center', gap: 4 },
  dappIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dappGlyph: { fontSize: 30 },
  dappName: { color: colors.text, fontSize: 13, fontWeight: '600' },
  dappCat: { color: colors.textFaint, fontSize: 11 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
  },
  rank: { color: colors.textFaint, fontSize: 13, width: 16, fontWeight: '600' },
  info: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 15, fontWeight: '600' },
  sym: { color: colors.textDim, fontSize: 13 },
  right: { alignItems: 'flex-end', gap: 3, minWidth: 80 },
  price: { color: colors.text, fontSize: 14, fontWeight: '600' },
  change: { fontSize: 13, fontWeight: '600' },
  empty: { color: colors.textDim, fontSize: 14, textAlign: 'center', marginTop: spacing.xl },
});
