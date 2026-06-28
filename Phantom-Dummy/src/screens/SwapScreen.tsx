import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '@/theme';
import { useWallet } from '@/context/WalletContext';
import { BottomSheet } from '@/components/BottomSheet';
import { TokenGlyph } from '@/components/TokenGlyph';
import { formatUsd, formatAmount, formatPrice } from '@/utils/format';

export function SwapScreen() {
  const { tokens } = useWallet();
  const [fromSym, setFromSym] = useState('SOL');
  const [toSym, setToSym] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [picker, setPicker] = useState<null | 'from' | 'to'>(null);
  const [done, setDone] = useState(false);

  const from = tokens.find((t) => t.symbol === fromSym)!;
  const to = tokens.find((t) => t.symbol === toSym)!;

  const amountNum = parseFloat(amount) || 0;
  const estimate = useMemo(() => {
    if (!from || !to || amountNum <= 0) return 0;
    return (amountNum * from.price) / to.price;
  }, [amountNum, from, to]);
  const usdValue = amountNum * (from?.price ?? 0);

  function flip() {
    setFromSym(toSym);
    setToSym(fromSym);
    setAmount('');
  }

  function pick(sym: string) {
    if (picker === 'from') {
      if (sym === toSym) setToSym(fromSym);
      setFromSym(sym);
    } else {
      if (sym === fromSym) setFromSym(toSym);
      setToSym(sym);
    }
    setPicker(null);
  }

  function runSwap() {
    if (amountNum <= 0) return;
    setDone(true);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Swap</Text>
        <Ionicons name="settings-outline" size={22} color={colors.textDim} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* From */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.cardLabel}>You pay</Text>
            <Text style={styles.balanceLabel}>Balance: {formatAmount(from.amount, from.symbol)}</Text>
          </View>
          <View style={styles.cardRow}>
            <TouchableOpacity style={styles.tokenPick} onPress={() => setPicker('from')} activeOpacity={0.7}>
              <TokenGlyph symbol={from.symbol} size={32} />
              <Text style={styles.tokenSym}>{from.symbol}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.textDim} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={colors.textFaint}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
          <View style={styles.cardBottom}>
            <View style={styles.maxRow}>
              <TouchableOpacity onPress={() => setAmount(String(from.amount))}>
                <Text style={styles.maxBtn}>MAX</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.usdLabel}>{formatUsd(usdValue)}</Text>
          </View>
        </View>

        {/* Flip */}
        <TouchableOpacity style={styles.flip} onPress={flip} activeOpacity={0.8}>
          <Ionicons name="swap-vertical" size={20} color={colors.accent} />
        </TouchableOpacity>

        {/* To */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>You receive</Text>
          <View style={styles.cardRow}>
            <TouchableOpacity style={styles.tokenPick} onPress={() => setPicker('to')} activeOpacity={0.7}>
              <TokenGlyph symbol={to.symbol} size={32} />
              <Text style={styles.tokenSym}>{to.symbol}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.textDim} />
            </TouchableOpacity>
            <Text style={styles.estimate}>{estimate > 0 ? formatAmount(estimate) : '0'}</Text>
          </View>
          <Text style={styles.usdLabel}>{formatUsd(estimate * to.price)}</Text>
        </View>

        {/* Rate */}
        <View style={styles.rateRow}>
          <Text style={styles.rateText}>
            1 {from.symbol} ≈ {formatAmount(from.price / to.price)} {to.symbol}
          </Text>
          <Text style={styles.rateText}>{formatPrice(from.price)}</Text>
        </View>

        <View style={styles.routeRow}>
          <Ionicons name="flash" size={14} color={colors.accent} />
          <Text style={styles.routeText}>Best route via Jupiter · ~0.4% price impact</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.swapBtn, amountNum <= 0 && styles.swapBtnDisabled]}
          activeOpacity={0.85}
          disabled={amountNum <= 0}
          onPress={runSwap}
        >
          <Text style={styles.swapBtnText}>{amountNum <= 0 ? 'Enter an amount' : 'Review swap'}</Text>
        </TouchableOpacity>
      </View>

      {/* Token picker */}
      <BottomSheet visible={picker != null} title="Select token" onClose={() => setPicker(null)}>
        {tokens.map((t) => (
          <TouchableOpacity key={t.symbol} style={styles.pickRow} activeOpacity={0.7} onPress={() => pick(t.symbol)}>
            <TokenGlyph symbol={t.symbol} size={36} />
            <View style={{ flex: 1 }}>
              <Text style={styles.pickName}>{t.name}</Text>
              <Text style={styles.pickAmount}>{formatAmount(t.amount, t.symbol)}</Text>
            </View>
            <Text style={styles.pickValue}>{formatUsd(t.value)}</Text>
          </TouchableOpacity>
        ))}
      </BottomSheet>

      {/* Success */}
      <BottomSheet visible={done} title="" onClose={() => { setDone(false); setAmount(''); }}>
        <View style={styles.successWrap}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={42} color={colors.up} />
          </View>
          <Text style={styles.successTitle}>Swap submitted</Text>
          <Text style={styles.successText}>
            {formatAmount(amountNum, from.symbol)} → {formatAmount(estimate, to.symbol)}
          </Text>
          <TouchableOpacity style={styles.successBtn} activeOpacity={0.85} onPress={() => { setDone(false); setAmount(''); }}>
            <Text style={styles.successBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { color: colors.textDim, fontSize: 14 },
  balanceLabel: { color: colors.textFaint, fontSize: 13 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tokenPick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  tokenSym: { color: colors.text, fontSize: 16, fontWeight: '700' },
  input: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
    padding: 0,
  },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  maxRow: { flexDirection: 'row' },
  maxBtn: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  usdLabel: { color: colors.textFaint, fontSize: 14, textAlign: 'right' },
  estimate: { color: colors.text, fontSize: 32, fontWeight: '700', flex: 1, textAlign: 'right' },
  flip: {
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardAlt,
    borderWidth: 4,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -14,
    zIndex: 2,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  rateText: { color: colors.textDim, fontSize: 13 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md, paddingHorizontal: spacing.xs },
  routeText: { color: colors.textDim, fontSize: 13 },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, paddingTop: spacing.sm },
  swapBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 17,
    alignItems: 'center',
  },
  swapBtnDisabled: { backgroundColor: colors.cardAlt },
  swapBtnText: { color: '#1A1130', fontSize: 16, fontWeight: '700' },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 12,
  },
  pickName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  pickAmount: { color: colors.textDim, fontSize: 13 },
  pickValue: { color: colors.text, fontSize: 15, fontWeight: '600' },
  successWrap: { alignItems: 'center', paddingVertical: spacing.md },
  successCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.up + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  successText: { color: colors.textDim, fontSize: 14, marginTop: 6 },
  successBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 15,
    paddingHorizontal: 60,
    marginTop: spacing.xl,
  },
  successBtnText: { color: '#1A1130', fontSize: 16, fontWeight: '700' },
});
