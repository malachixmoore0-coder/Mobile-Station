import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '@/theme';
import { useToken, useWallet } from '@/context/WalletContext';
import { buildSeries, Timeframe, TIMEFRAME_SHAPE } from '@/data/portfolio';
import { formatUsd, formatPrice, formatPct, formatAmount } from '@/utils/format';
import { LineChart } from '@/components/LineChart';
import { TimeframeSelector } from '@/components/TimeframeSelector';
import { TokenGlyph } from '@/components/TokenGlyph';
import { BottomSheet } from '@/components/BottomSheet';

interface Props {
  symbol: string;
  onBack: () => void;
  onSwap: () => void;
  onSend: (symbol: string) => void;
}

type Mode = 'buy' | 'sell';

export function TokenDetailScreen({ symbol, onBack, onSwap, onSend }: Props) {
  const token = useToken(symbol);
  const { cash, buy, sell } = useWallet();
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [scrub, setScrub] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [amount, setAmount] = useState('');
  const [done, setDone] = useState<null | { mode: Mode; usd: number; qty: number }>(null);

  const series = useMemo(() => {
    if (!token) return [];
    const shape = TIMEFRAME_SHAPE[timeframe];
    return buildSeries(token.price, shape.seed + symbol.charCodeAt(0), 60, shape.vol * 1.4, shape.trend);
  }, [token, timeframe, symbol]);

  if (!token) return null;
  const up = token.change24h >= 0;
  const displayPrice = scrub ?? token.price;

  const usd = parseFloat(amount) || 0;
  const qty = token.price > 0 ? usd / token.price : 0;
  const maxUsd = mode === 'buy' ? cash : token.value;
  const overLimit = usd > maxUsd + 1e-6;

  function openTrade(m: Mode) {
    setMode(m);
    setAmount('');
  }

  function confirm() {
    if (!mode || usd <= 0 || overLimit) return;
    const res = mode === 'buy' ? buy(symbol, usd) : sell(symbol, qty);
    if (res.ok) {
      setDone({ mode, usd, qty });
      setMode(null);
    }
  }

  const stats = [
    { label: 'Your balance', value: formatAmount(token.amount, token.symbol) },
    { label: 'Value', value: formatUsd(token.value) },
    { label: 'Price', value: formatPrice(token.price) },
    { label: '24h change', value: formatPct(token.change24h), color: up ? colors.up : colors.down },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.navTitleWrap}>
          <TokenGlyph symbol={token.symbol} size={26} />
          <Text style={styles.navTitle}>{token.name}</Text>
        </View>
        <Ionicons name="star-outline" size={22} color={colors.textDim} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.priceBlock}>
          <Text style={styles.price}>{formatPrice(displayPrice)}</Text>
          <View style={styles.changeRow}>
            <Ionicons name={up ? 'caret-up' : 'caret-down'} size={14} color={up ? colors.up : colors.down} />
            <Text style={[styles.change, { color: up ? colors.up : colors.down }]}>{formatPct(token.change24h)}</Text>
            <Text style={styles.changePeriod}>24h</Text>
          </View>
        </View>

        <View style={styles.chartWrap}>
          <LineChart data={series} up={up} onScrub={setScrub} />
        </View>
        <View style={styles.tfWrap}>
          <TimeframeSelector value={timeframe} onChange={setTimeframe} />
        </View>

        <View style={styles.statsCard}>
          {stats.map((s, i) => (
            <View key={s.label} style={[styles.statRow, i < stats.length - 1 && styles.statBorder]}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={[styles.statValue, s.color ? { color: s.color } : null]}>{s.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.aboutTitle}>About {token.name}</Text>
        <Text style={styles.aboutText}>
          Buy {token.symbol} with your Cash balance, then sell it back to Cash — if the live price
          rises while you hold, you pocket the difference. Demo only, no real funds.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.footerBtn, styles.footerSecondary]} activeOpacity={0.8} onPress={() => onSend(symbol)}>
          <Text style={styles.footerSecondaryText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerBtn, styles.footerSecondary]} activeOpacity={0.8} onPress={() => openTrade('sell')}>
          <Text style={styles.footerSecondaryText}>Sell</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerBtn, styles.footerPrimary]} activeOpacity={0.8} onPress={() => openTrade('buy')}>
          <Text style={styles.footerPrimaryText}>Buy more</Text>
        </TouchableOpacity>
      </View>

      {/* Buy / Sell sheet */}
      <BottomSheet visible={mode != null} title={mode === 'buy' ? `Buy ${token.symbol}` : `Sell ${token.symbol}`} onClose={() => setMode(null)}>
        <Text style={styles.tradeAmount}>{usd > 0 ? formatUsd(usd) : '$0'}</Text>
        <Text style={styles.tradeSub}>
          ≈ {formatAmount(qty, token.symbol)} · {formatPrice(token.price)}
        </Text>

        <TextInput
          style={styles.tradeInput}
          placeholder="Amount in USD"
          placeholderTextColor={colors.textFaint}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <View style={styles.chips}>
          {[0.25, 0.5, 1].map((f) => (
            <TouchableOpacity key={f} style={styles.chip} activeOpacity={0.7} onPress={() => setAmount((maxUsd * f).toFixed(2))}>
              <Text style={styles.chipText}>{f === 1 ? 'MAX' : `${f * 100}%`}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.avail, overLimit && { color: colors.down }]}>
          {mode === 'buy'
            ? `Cash available: ${formatUsd(cash)}`
            : `You hold: ${formatAmount(token.amount, token.symbol)} (${formatUsd(token.value)})`}
        </Text>

        <TouchableOpacity
          style={[styles.confirm, (usd <= 0 || overLimit) && styles.confirmOff]}
          activeOpacity={0.85}
          disabled={usd <= 0 || overLimit}
          onPress={confirm}
        >
          <Text style={styles.confirmText}>
            {overLimit ? (mode === 'buy' ? 'Not enough cash' : 'Not enough balance') : mode === 'buy' ? 'Buy now' : 'Sell now'}
          </Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* Success */}
      <BottomSheet visible={done != null} title="" onClose={() => setDone(null)}>
        {done && (
          <View style={styles.doneWrap}>
            <View style={styles.doneCircle}>
              <Ionicons name="checkmark" size={42} color={colors.up} />
            </View>
            <Text style={styles.doneTitle}>{done.mode === 'buy' ? 'Bought' : 'Sold'} {token.symbol}</Text>
            <Text style={styles.doneText}>
              {done.mode === 'buy'
                ? `+${formatAmount(done.qty, token.symbol)} for ${formatUsd(done.usd)}`
                : `${formatAmount(done.qty, token.symbol)} → ${formatUsd(done.usd)} cash`}
            </Text>
            <Text style={styles.doneCash}>Cash balance: {formatUsd(cash)}</Text>
            <TouchableOpacity style={styles.doneBtn} activeOpacity={0.85} onPress={() => setDone(null)}>
              <Text style={styles.confirmText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  navTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  scroll: { paddingBottom: 24 },
  priceBlock: { alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.lg },
  price: { color: colors.text, fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  change: { fontSize: 15, fontWeight: '600' },
  changePeriod: { color: colors.textFaint, fontSize: 15, marginLeft: 2 },
  chartWrap: { paddingHorizontal: spacing.sm },
  tfWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  statsCard: { backgroundColor: colors.bgElevated, marginHorizontal: spacing.lg, borderRadius: radius.md, paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15 },
  statBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  statLabel: { color: colors.textDim, fontSize: 14 },
  statValue: { color: colors.text, fontSize: 14, fontWeight: '600' },
  aboutTitle: { color: colors.text, fontSize: 17, fontWeight: '700', marginTop: spacing.xl, marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  aboutText: { color: colors.textDim, fontSize: 14, lineHeight: 21, marginHorizontal: spacing.lg },
  footer: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  footerBtn: { flex: 1, paddingVertical: 16, borderRadius: radius.pill, alignItems: 'center' },
  footerSecondary: { backgroundColor: colors.cardAlt },
  footerSecondaryText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  footerPrimary: { backgroundColor: colors.accent },
  footerPrimaryText: { color: '#1A1130', fontSize: 16, fontWeight: '700' },
  // trade sheet
  tradeAmount: { color: colors.text, fontSize: 36, fontWeight: '800', textAlign: 'center' },
  tradeSub: { color: colors.textDim, fontSize: 14, textAlign: 'center', marginTop: 4, marginBottom: spacing.lg },
  tradeInput: { backgroundColor: colors.card, borderRadius: radius.md, color: colors.text, fontSize: 17, paddingHorizontal: spacing.lg, paddingVertical: 14 },
  chips: { flexDirection: 'row', gap: 8, marginTop: spacing.md },
  chip: { flex: 1, alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.pill, paddingVertical: 10 },
  chipText: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  avail: { color: colors.textDim, fontSize: 13, textAlign: 'center', marginTop: spacing.md },
  confirm: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingVertical: 16, alignItems: 'center', marginTop: spacing.lg },
  confirmOff: { backgroundColor: colors.cardAlt },
  confirmText: { color: '#1A1130', fontSize: 16, fontWeight: '700' },
  doneWrap: { alignItems: 'center', paddingVertical: spacing.sm },
  doneCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.up + '22', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  doneTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  doneText: { color: colors.textDim, fontSize: 14, marginTop: 6 },
  doneCash: { color: colors.up, fontSize: 14, fontWeight: '600', marginTop: 8 },
  doneBtn: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingVertical: 15, paddingHorizontal: 70, marginTop: spacing.xl },
});
