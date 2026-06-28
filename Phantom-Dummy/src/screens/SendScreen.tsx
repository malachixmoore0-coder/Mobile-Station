import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '@/theme';
import { useWallet } from '@/context/WalletContext';
import { TokenGlyph } from '@/components/TokenGlyph';
import { formatUsd, formatAmount } from '@/utils/format';

interface Props {
  initialSymbol?: string;
  onClose: () => void;
}

type Step = 'token' | 'form' | 'review' | 'done';

const SAVED = [
  { name: 'kade.sol', address: 'Kd3aBcD2eF3gH4jK5lM6nP7qR8sT1uV2wX3yZ4kade' },
  { name: 'mom 💜', address: 'M0mWa11etAddr3ss9qKx5VnM4eJbTacD3gZ8pQ1Lk7m' },
  { name: 'Coinbase', address: 'CbXyR2tBwCfYsUaH9qKx5VnM4eJbTac7xKQ9vRtPmZ4' },
];

export function SendScreen({ initialSymbol = 'SOL', onClose }: Props) {
  const { tokens } = useWallet();
  const [step, setStep] = useState<Step>('token');
  const [symbol, setSymbol] = useState(initialSymbol);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const token = tokens.find((t) => t.symbol === symbol)!;
  const amountNum = parseFloat(amount) || 0;
  const usd = amountNum * token.price;
  const valid = amountNum > 0 && amountNum <= token.amount && recipient.trim().length >= 6;

  const sorted = useMemo(() => [...tokens].sort((a, b) => b.value - a.value), [tokens]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={step === 'token' ? onClose : () => setStep(step === 'review' ? 'form' : 'token')} hitSlop={12}>
          <Ionicons name={step === 'token' ? 'close' : 'chevron-back'} size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>
          {step === 'token' ? 'Select token' : step === 'review' ? 'Review' : step === 'done' ? '' : 'Send'}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      {step === 'token' && (
        <ScrollView contentContainerStyle={styles.scroll}>
          {sorted.map((t) => (
            <TouchableOpacity
              key={t.symbol}
              style={styles.tokenRow}
              activeOpacity={0.7}
              onPress={() => { setSymbol(t.symbol); setStep('form'); }}
            >
              <TokenGlyph symbol={t.symbol} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={styles.tokenName}>{t.name}</Text>
                <Text style={styles.tokenSub}>{formatAmount(t.amount, t.symbol)}</Text>
              </View>
              <Text style={styles.tokenVal}>{formatUsd(t.value)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {step === 'form' && (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>To</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.addrInput}
              placeholder="Recipient address or .sol name"
              placeholderTextColor={colors.textFaint}
              value={recipient}
              onChangeText={setRecipient}
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.savedLabel}>Saved</Text>
          {SAVED.map((r) => (
            <TouchableOpacity key={r.name} style={styles.savedRow} activeOpacity={0.7} onPress={() => setRecipient(r.address)}>
              <View style={styles.savedAvatar}><Text style={{ fontSize: 16 }}>{r.name.includes('mom') ? '💜' : '👤'}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.savedName}>{r.name}</Text>
                <Text style={styles.savedAddr}>{r.address.slice(0, 8)}…{r.address.slice(-6)}</Text>
              </View>
            </TouchableOpacity>
          ))}

          <Text style={[styles.label, { marginTop: spacing.xl }]}>Amount</Text>
          <View style={styles.amountBox}>
            <TokenGlyph symbol={token.symbol} size={30} />
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor={colors.textFaint}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
            <TouchableOpacity onPress={() => setAmount(String(token.amount))}>
              <Text style={styles.maxBtn}>MAX</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.usdLine}>{formatUsd(usd)} · Balance {formatAmount(token.amount, token.symbol)}</Text>
        </ScrollView>
      )}

      {step === 'review' && (
        <View style={styles.scroll}>
          <View style={styles.reviewAmount}>
            <TokenGlyph symbol={token.symbol} size={56} />
            <Text style={styles.reviewBig}>{formatAmount(amountNum, token.symbol)}</Text>
            <Text style={styles.reviewUsd}>{formatUsd(usd)}</Text>
          </View>
          <View style={styles.reviewCard}>
            <ReviewRow label="To" value={`${recipient.slice(0, 6)}…${recipient.slice(-6)}`} border />
            <ReviewRow label="Network" value="Solana" border />
            <ReviewRow label="Network fee" value="$0.00025" border />
            <ReviewRow label="Total" value={formatUsd(usd + 0.00025)} />
          </View>
        </View>
      )}

      {step === 'done' && (
        <View style={styles.doneWrap}>
          <View style={styles.doneCircle}>
            <Ionicons name="checkmark" size={48} color={colors.up} />
          </View>
          <Text style={styles.doneTitle}>Sent</Text>
          <Text style={styles.doneText}>{formatAmount(amountNum, token.symbol)} is on its way</Text>
        </View>
      )}

      <View style={styles.footer}>
        {step === 'form' && (
          <TouchableOpacity
            style={[styles.cta, !valid && styles.ctaDisabled]}
            disabled={!valid}
            activeOpacity={0.85}
            onPress={() => setStep('review')}
          >
            <Text style={styles.ctaText}>Review</Text>
          </TouchableOpacity>
        )}
        {step === 'review' && (
          <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={() => setStep('done')}>
            <Text style={styles.ctaText}>Confirm & Send</Text>
          </TouchableOpacity>
        )}
        {step === 'done' && (
          <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={onClose}>
            <Text style={styles.ctaText}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

function ReviewRow({ label, value, border }: { label: string; value: string; border?: boolean }) {
  return (
    <View style={[styles.reviewRow, border && styles.reviewBorder]}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  navTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  scroll: { padding: spacing.lg, flexGrow: 1 },
  tokenRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 12 },
  tokenName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  tokenSub: { color: colors.textDim, fontSize: 13 },
  tokenVal: { color: colors.text, fontSize: 15, fontWeight: '600' },
  label: { color: colors.textDim, fontSize: 14, marginBottom: 8 },
  inputBox: { backgroundColor: colors.bgElevated, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: 14 },
  addrInput: { color: colors.text, fontSize: 15, padding: 0 },
  savedLabel: { color: colors.textFaint, fontSize: 13, marginTop: spacing.lg, marginBottom: 4 },
  savedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 11 },
  savedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  savedAddr: { color: colors.textDim, fontSize: 13 },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  amountInput: { flex: 1, color: colors.text, fontSize: 26, fontWeight: '700', padding: 0 },
  maxBtn: { color: colors.accent, fontSize: 14, fontWeight: '700' },
  usdLine: { color: colors.textFaint, fontSize: 13, marginTop: 8 },
  reviewAmount: { alignItems: 'center', gap: 8, marginTop: spacing.lg, marginBottom: spacing.xl },
  reviewBig: { color: colors.text, fontSize: 30, fontWeight: '800', marginTop: 8 },
  reviewUsd: { color: colors.textDim, fontSize: 15 },
  reviewCard: { backgroundColor: colors.bgElevated, borderRadius: radius.md, paddingHorizontal: spacing.lg },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15 },
  reviewBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  reviewLabel: { color: colors.textDim, fontSize: 14 },
  reviewValue: { color: colors.text, fontSize: 14, fontWeight: '600' },
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  doneCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.up + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  doneTitle: { color: colors.text, fontSize: 24, fontWeight: '800' },
  doneText: { color: colors.textDim, fontSize: 15 },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, paddingTop: spacing.sm },
  cta: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingVertical: 17, alignItems: 'center' },
  ctaDisabled: { backgroundColor: colors.cardAlt },
  ctaText: { color: '#1A1130', fontSize: 16, fontWeight: '700' },
});
