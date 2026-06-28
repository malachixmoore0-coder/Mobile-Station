import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '@/theme';
import { useWallet } from '@/context/WalletContext';
import { useSettings } from '@/context/SettingsContext';
import { formatUsd, formatSignedUsd, formatPct, formatAmount } from '@/utils/format';
import { TokenGlyph } from '@/components/TokenGlyph';

interface Props {
  onSelectToken: (symbol: string) => void;
  onOpenAccounts: () => void;
  onOpenCash: () => void;
}

// Majors get the blue verified check in the real app.
const VERIFIED = new Set(['SOL', 'ETH', 'BTC', 'USDC', 'JUP', 'JTO']);

export function HomeScreen({ onSelectToken, onOpenAccounts, onOpenCash }: Props) {
  const { tokens, totalValue, change24hUsd, change24hPct, cash } = useWallet();
  const { account, hideBalances } = useSettings();
  const up = change24hUsd >= 0;
  const sorted = useMemo(() => [...tokens].sort((a, b) => b.value - a.value), [tokens]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <TouchableOpacity style={styles.accountRow} activeOpacity={0.7} onPress={onOpenAccounts}>
        <Text style={styles.accountName}>{account.name}</Text>
        <Ionicons name="chevron-down" size={14} color={colors.textDim} />
      </TouchableOpacity>

      <Text style={styles.balance}>{hideBalances ? '••••••' : formatUsd(totalValue)}</Text>
      <View style={styles.changeRow}>
        <Text style={[styles.changeUsd, { color: up ? colors.up : colors.down }]}>
          {hideBalances ? '••••' : formatSignedUsd(change24hUsd)}
        </Text>
        <View style={[styles.pill, { backgroundColor: (up ? colors.up : colors.down) + '22' }]}>
          <Text style={[styles.pillText, { color: up ? colors.up : colors.down }]}>{formatPct(change24hPct)}</Text>
        </View>
      </View>

      {/* Cash */}
      <TouchableOpacity style={styles.cashRow} activeOpacity={0.75} onPress={onOpenCash}>
        <View style={[styles.cashIcon]}>
          <Ionicons name="cash-outline" size={20} color={colors.up} />
        </View>
        <Text style={styles.cashLabel}>Cash</Text>
        <Text style={styles.cashValue}>{hideBalances ? '••••' : formatUsd(cash)}</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
      </TouchableOpacity>

      {/* Tokens */}
      <TouchableOpacity style={styles.sectionRow} activeOpacity={0.7}>
        <Text style={styles.sectionTitle}>Tokens</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
      </TouchableOpacity>

      <View style={styles.list}>
        {sorted.map((t) => {
          const tUp = t.change24h >= 0;
          return (
            <TouchableOpacity key={t.symbol} style={styles.row} activeOpacity={0.65} onPress={() => onSelectToken(t.symbol)}>
              <TokenGlyph symbol={t.symbol} size={40} verified={VERIFIED.has(t.symbol)} />
              <View style={styles.info}>
                <Text style={styles.name}>{t.name}</Text>
                <Text style={styles.amount}>{formatAmount(t.amount, t.symbol)}</Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.value}>{hideBalances ? '••••' : formatUsd(t.value)}</Text>
                <Text style={[styles.change, { color: tUp ? colors.up : colors.down }]}>{formatPct(t.change24h)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  accountName: { color: colors.textDim, fontSize: 15, fontWeight: '500' },
  balance: { color: colors.text, fontSize: 42, fontWeight: '800', letterSpacing: -1.2, marginTop: 4 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, marginBottom: spacing.lg },
  changeUsd: { fontSize: 15, fontWeight: '600' },
  pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  pillText: { fontSize: 13, fontWeight: '700' },
  cashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    marginBottom: spacing.lg,
  },
  cashIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.up + '1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashLabel: { color: colors.text, fontSize: 16, fontWeight: '600', flex: 1 },
  cashValue: { color: colors.text, fontSize: 16, fontWeight: '600' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.xs },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  list: { gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 11 },
  info: { flex: 1, gap: 3 },
  name: { color: colors.text, fontSize: 16, fontWeight: '600' },
  amount: { color: colors.textDim, fontSize: 13 },
  right: { alignItems: 'flex-end', gap: 3 },
  value: { color: colors.text, fontSize: 16, fontWeight: '600' },
  change: { fontSize: 13, fontWeight: '600' },
});
