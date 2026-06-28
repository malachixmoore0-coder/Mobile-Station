import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '@/theme';
import { useWallet } from '@/context/WalletContext';
import { TRENDING, TRADE_FILTERS } from '@/data/portfolio';
import { formatUsd, formatAmount, formatPrice, formatPct, formatMcap } from '@/utils/format';
import { TokenGlyph } from '@/components/TokenGlyph';
import { BottomSheet } from '@/components/BottomSheet';

interface Props {
  onSelectToken: (symbol: string) => void;
}

export function TradeScreen({ onSelectToken }: Props) {
  const { tokens } = useWallet();
  const [fromSym, setFromSym] = useState('SOL');
  const [amount, setAmount] = useState('');
  const [picker, setPicker] = useState(false);
  const [filter, setFilter] = useState<(typeof TRADE_FILTERS)[number]>('Featured');
  const [board, setBoard] = useState<'Tokens' | 'Perps'>('Tokens');

  const from = tokens.find((t) => t.symbol === fromSym)!;
  const amountNum = parseFloat(amount) || 0;
  const usd = amountNum * from.price;
  const sorted = useMemo(() => [...tokens].sort((a, b) => b.value - a.value), [tokens]);

  const rows = useMemo(() => {
    const list = [...TRENDING];
    if (filter === 'Top Gainers') list.sort((a, b) => b.change24h - a.change24h);
    else if (filter === 'Top Volume') list.sort((a, b) => b.marketCap - a.marketCap);
    return list;
  }, [filter]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      {/* You pay */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>You Pay</Text>
        <View style={styles.cardRow}>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={colors.textFaint}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
          <TouchableOpacity style={styles.tokenPick} activeOpacity={0.75} onPress={() => setPicker(true)}>
            <TokenGlyph symbol={from.symbol} size={26} />
            <Text style={styles.tokenSym}>{from.symbol}</Text>
            <Ionicons name="chevron-down" size={15} color={colors.textDim} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subUsd}>{formatUsd(usd)}</Text>
      </View>

      <View style={styles.flip}>
        <Ionicons name="swap-vertical" size={18} color={colors.accent} />
      </View>

      {/* You receive */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>You Receive</Text>
        <View style={styles.cardRow}>
          <Text style={styles.input}>{amountNum > 0 ? formatUsd(usd) : '0'}</Text>
          <View style={styles.tokenPick}>
            <View style={[styles.cashGlyph]}><Ionicons name="cash" size={15} color={colors.up} /></View>
            <Text style={styles.tokenSym}>Cash</Text>
          </View>
        </View>
        <Text style={styles.subUsd}>USDC</Text>
      </View>

      <TouchableOpacity style={[styles.cta, amountNum <= 0 && styles.ctaOff]} activeOpacity={0.85} disabled={amountNum <= 0}>
        <Text style={styles.ctaText}>{amountNum <= 0 ? 'Enter an amount' : 'Review order'}</Text>
      </TouchableOpacity>

      {/* Leaderboard */}
      <View style={styles.boardTabs}>
        <TouchableOpacity onPress={() => setBoard('Tokens')}>
          <Text style={[styles.boardTab, board === 'Tokens' && styles.boardTabActive]}>Tokens</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setBoard('Perps')}>
          <Text style={[styles.boardTab, board === 'Perps' && styles.boardTabActive]}>Perps</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        {TRADE_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterPill, f === filter && styles.filterPillActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterText, f === filter && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.columns}>
        <Text style={styles.colRank}>#</Text>
        <Text style={styles.colName}>Token</Text>
        <Text style={styles.colRight}>Price · 24h</Text>
      </View>

      {rows.map((t, i) => {
        const tUp = t.change24h >= 0;
        return (
          <TouchableOpacity key={t.symbol} style={styles.lbRow} activeOpacity={0.65} onPress={() => onSelectToken(t.symbol)}>
            <Text style={styles.rank}>{i + 1}</Text>
            <TokenGlyph symbol={t.symbol} size={34} verified={t.verified} />
            <View style={styles.lbInfo}>
              <Text style={styles.lbName} numberOfLines={1}>{t.name}</Text>
              <Text style={styles.lbMc}>{formatMcap(t.marketCap)} MC</Text>
            </View>
            <View style={styles.lbRight}>
              <Text style={styles.lbPrice}>{formatPrice(t.price)}</Text>
              <Text style={[styles.lbChange, { color: tUp ? colors.up : colors.down }]}>{formatPct(t.change24h)}</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Token picker */}
      <BottomSheet visible={picker} title="Select token" onClose={() => setPicker(false)}>
        {sorted.map((t) => (
          <TouchableOpacity key={t.symbol} style={styles.pickRow} activeOpacity={0.7} onPress={() => { setFromSym(t.symbol); setPicker(false); }}>
            <TokenGlyph symbol={t.symbol} size={36} />
            <View style={{ flex: 1 }}>
              <Text style={styles.lbName}>{t.name}</Text>
              <Text style={styles.lbMc}>{formatAmount(t.amount, t.symbol)}</Text>
            </View>
            <Text style={styles.lbPrice}>{formatUsd(t.value)}</Text>
          </TouchableOpacity>
        ))}
      </BottomSheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, paddingTop: spacing.sm },
  card: { backgroundColor: colors.bgElevated, borderRadius: radius.md, padding: spacing.lg, gap: 8 },
  cardLabel: { color: colors.textDim, fontSize: 14 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  input: { color: colors.text, fontSize: 30, fontWeight: '700', flex: 1, padding: 0 },
  subUsd: { color: colors.textFaint, fontSize: 14 },
  tokenPick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 9,
  },
  cashGlyph: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.up + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenSym: { color: colors.text, fontSize: 15, fontWeight: '700' },
  flip: {
    alignSelf: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardAlt,
    borderWidth: 4,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -12,
    zIndex: 2,
  },
  cta: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingVertical: 16, alignItems: 'center', marginTop: spacing.lg },
  ctaOff: { backgroundColor: colors.cardAlt },
  ctaText: { color: '#1A1130', fontSize: 16, fontWeight: '700' },
  boardTabs: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.md },
  boardTab: { color: colors.textFaint, fontSize: 18, fontWeight: '700' },
  boardTabActive: { color: colors.text },
  filters: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  filterPill: { paddingVertical: 7, paddingHorizontal: 13, borderRadius: radius.pill, backgroundColor: colors.bgElevated },
  filterPillActive: { backgroundColor: colors.accent + '26' },
  filterText: { color: colors.textDim, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: colors.accent },
  columns: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  colRank: { color: colors.textFaint, fontSize: 12, width: 24 },
  colName: { color: colors.textFaint, fontSize: 12, flex: 1, marginLeft: 44 },
  colRight: { color: colors.textFaint, fontSize: 12 },
  lbRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 10 },
  rank: { color: colors.textFaint, fontSize: 13, width: 24, fontWeight: '600' },
  lbInfo: { flex: 1, gap: 2 },
  lbName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  lbMc: { color: colors.textDim, fontSize: 13 },
  lbRight: { alignItems: 'flex-end', gap: 2 },
  lbPrice: { color: colors.text, fontSize: 14, fontWeight: '600' },
  lbChange: { fontSize: 13, fontWeight: '600' },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 11 },
});
