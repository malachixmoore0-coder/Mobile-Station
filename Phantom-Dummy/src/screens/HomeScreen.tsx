import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '@/theme';
import { useWallet } from '@/context/WalletContext';
import {
  WALLET,
  buildSeries,
  Timeframe,
  TIMEFRAME_SHAPE,
} from '@/data/portfolio';
import { formatUsd, formatSignedUsd, formatPct, shortAddress } from '@/utils/format';
import { LineChart } from '@/components/LineChart';
import { TimeframeSelector } from '@/components/TimeframeSelector';
import { TokenRow } from '@/components/TokenRow';
import { ActionButton } from '@/components/ActionButton';
import { BottomSheet } from '@/components/BottomSheet';

interface Props {
  onSelectToken: (symbol: string) => void;
  onSwap: () => void;
}

export function HomeScreen({ onSelectToken, onSwap }: Props) {
  const { tokens, totalValue, change24hUsd, change24hPct, lastUp } = useWallet();
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [scrubValue, setScrubValue] = useState<number | null>(null);
  const [sheet, setSheet] = useState<null | 'receive' | 'send' | 'buy'>(null);

  // The chart line lands exactly on the live total so the curve tracks reality.
  const series = useMemo(() => {
    const shape = TIMEFRAME_SHAPE[timeframe];
    return buildSeries(totalValue, shape.seed, 60, shape.vol, shape.trend);
  }, [timeframe, totalValue]);

  const up = change24hUsd >= 0;
  const displayValue = scrubValue ?? totalValue;
  const scrubbing = scrubValue != null;

  const sorted = useMemo(() => [...tokens].sort((a, b) => b.value - a.value), [tokens]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Account header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.account} activeOpacity={0.7}>
            <Text style={styles.avatar}>{WALLET.avatar}</Text>
            <View>
              <Text style={styles.accountName}>{WALLET.name}</Text>
              <Text style={styles.accountAddr}>{shortAddress(WALLET.address)}</Text>
            </View>
            <Ionicons name="chevron-down" size={16} color={colors.textDim} />
          </TouchableOpacity>
          <View style={styles.headerIcons}>
            <View style={[styles.liveDot, { backgroundColor: lastUp ? colors.up : colors.down }]} />
            <Ionicons name="scan-outline" size={22} color={colors.textDim} />
          </View>
        </View>

        {/* Balance */}
        <View style={styles.balanceBlock}>
          <Text style={styles.balance}>{formatUsd(displayValue)}</Text>
          <View style={styles.changeRow}>
            <Ionicons
              name={up ? 'caret-up' : 'caret-down'}
              size={14}
              color={up ? colors.up : colors.down}
            />
            <Text style={[styles.change, { color: up ? colors.up : colors.down }]}>
              {formatSignedUsd(change24hUsd)} ({formatPct(change24hPct)})
            </Text>
            <Text style={styles.changePeriod}>{scrubbing ? '' : 'Today'}</Text>
          </View>
        </View>

        {/* Interactive chart */}
        <View style={styles.chartWrap}>
          <LineChart data={series} up={up} onScrub={setScrubValue} />
        </View>
        <View style={styles.tfWrap}>
          <TimeframeSelector value={timeframe} onChange={setTimeframe} />
        </View>

        {/* Quick actions */}
        <View style={styles.actions}>
          <ActionButton icon="arrow-down-outline" label="Receive" onPress={() => setSheet('receive')} />
          <ActionButton icon="arrow-up-outline" label="Send" onPress={() => setSheet('send')} />
          <ActionButton icon="swap-horizontal-outline" label="Swap" onPress={onSwap} />
          <ActionButton icon="card-outline" label="Buy" onPress={() => setSheet('buy')} />
        </View>

        {/* Token list */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Tokens</Text>
          <Text style={styles.listCount}>{tokens.length}</Text>
        </View>
        <View style={styles.list}>
          {sorted.map((t) => (
            <TokenRow key={t.symbol} token={t} onPress={() => onSelectToken(t.symbol)} />
          ))}
        </View>

        <Text style={styles.disclaimer}>Demo wallet · simulated balances</Text>
      </ScrollView>

      {/* Receive sheet */}
      <BottomSheet visible={sheet === 'receive'} title="Receive" onClose={() => setSheet(null)}>
        <View style={styles.qrBox}>
          <Ionicons name="qr-code" size={140} color={colors.text} />
        </View>
        <Text style={styles.receiveLabel}>Your Solana address</Text>
        <View style={styles.addrPill}>
          <Text style={styles.addrText} numberOfLines={1}>{WALLET.address}</Text>
          <TouchableOpacity hitSlop={10}>
            <Ionicons name="copy-outline" size={18} color={colors.accent} />
          </TouchableOpacity>
        </View>
        <Text style={styles.sheetHint}>Send only Solana (SOL) and SPL tokens to this address.</Text>
      </BottomSheet>

      {/* Send sheet */}
      <BottomSheet visible={sheet === 'send'} title="Send" onClose={() => setSheet(null)}>
        <Text style={styles.sheetHint}>Choose a token, then enter a recipient and amount.</Text>
        <View style={{ marginTop: spacing.md, gap: 10 }}>
          {sorted.slice(0, 4).map((t) => (
            <TouchableOpacity key={t.symbol} style={styles.sendRow} activeOpacity={0.7} onPress={() => setSheet(null)}>
              <Text style={styles.sendSym}>{t.symbol}</Text>
              <Text style={styles.sendVal}>{formatUsd(t.value)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>

      {/* Buy sheet */}
      <BottomSheet visible={sheet === 'buy'} title="Buy crypto" onClose={() => setSheet(null)}>
        <Text style={styles.sheetHint}>Add funds with a card, bank transfer or Apple Pay.</Text>
        <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8} onPress={() => setSheet(null)}>
          <Text style={styles.primaryBtnText}>Continue with Apple Pay</Text>
        </TouchableOpacity>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  account: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    fontSize: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.cardAlt,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 38,
  },
  accountName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  accountAddr: { color: colors.textDim, fontSize: 12 },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  balanceBlock: { alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.lg },
  balance: { color: colors.text, fontSize: 46, fontWeight: '800', letterSpacing: -1.5 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  change: { fontSize: 15, fontWeight: '600' },
  changePeriod: { color: colors.textFaint, fontSize: 15, marginLeft: 2 },
  chartWrap: { paddingHorizontal: spacing.sm },
  tfWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  listTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  listCount: { color: colors.textFaint, fontSize: 15, fontWeight: '600' },
  list: {
    backgroundColor: colors.bgElevated,
    marginHorizontal: spacing.md,
    borderRadius: radius.md,
    paddingVertical: 4,
  },
  disclaimer: {
    color: colors.textFaint,
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  // Sheets
  qrBox: {
    alignSelf: 'center',
    backgroundColor: colors.white,
    padding: 18,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  receiveLabel: { color: colors.textDim, fontSize: 13, marginBottom: 8, textAlign: 'center' },
  addrPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
  },
  addrText: { color: colors.text, fontSize: 13, flex: 1 },
  sheetHint: { color: colors.textDim, fontSize: 13, lineHeight: 19, marginTop: 8, textAlign: 'center' },
  sendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  sendSym: { color: colors.text, fontSize: 15, fontWeight: '700' },
  sendVal: { color: colors.textDim, fontSize: 15 },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  primaryBtnText: { color: '#1A1130', fontSize: 16, fontWeight: '700' },
});
