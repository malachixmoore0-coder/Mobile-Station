import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '@/theme';
import { useWallet } from '@/context/WalletContext';
import { formatUsd } from '@/utils/format';

interface Props {
  onClose: () => void;
}

type Step = 'form' | 'review' | 'done';

const BANK = { name: 'Chase Bank', last4: '1234', kind: 'Checking' };

export function BankTransferScreen({ onClose }: Props) {
  const { totalValue, cash, withdrawToBank } = useWallet();
  const [step, setStep] = useState<Step>('form');
  const [amount, setAmount] = useState('');
  const [sentAmount, setSentAmount] = useState(0);
  const [newBalance, setNewBalance] = useState(0);

  const usd = parseFloat(amount) || 0;
  const overLimit = usd > totalValue + 1e-6;
  const valid = usd > 0 && !overLimit;

  function confirm() {
    const res = withdrawToBank(usd, BANK.last4);
    if (res.ok) {
      setSentAmount(usd);
      setNewBalance(totalValue - usd);
      setStep('done');
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={step === 'form' ? onClose : () => setStep('form')} hitSlop={12}>
          <Ionicons name={step === 'form' ? 'close' : 'chevron-back'} size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{step === 'done' ? '' : step === 'review' ? 'Review transfer' : 'Send to bank'}</Text>
        <View style={{ width: 26 }} />
      </View>

      {step === 'form' && (
        <View style={styles.body}>
          <Text style={styles.amountBig}>{usd > 0 ? formatUsd(usd) : '$0'}</Text>
          <Text style={[styles.available, overLimit && { color: colors.down }]}>
            {overLimit ? 'Amount exceeds balance' : `${formatUsd(totalValue)} available`}
          </Text>

          <View style={styles.inputBox}>
            <Text style={styles.inputPrefix}>$</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={colors.textFaint}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
            <TouchableOpacity onPress={() => setAmount(String(Math.floor(totalValue * 100) / 100))}>
              <Text style={styles.max}>MAX</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.toLabel}>To</Text>
          <View style={styles.bankRow}>
            <View style={styles.bankIcon}><Ionicons name="business" size={20} color={colors.accent} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bankName}>{BANK.name}</Text>
              <Text style={styles.bankSub}>{BANK.kind} •••• {BANK.last4}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
          </View>
          <Text style={styles.note}>Cash {formatUsd(cash)} is used first; the rest is sold from your tokens.</Text>

          <TouchableOpacity style={[styles.cta, !valid && styles.ctaOff]} disabled={!valid} activeOpacity={0.85} onPress={() => setStep('review')}>
            <Text style={styles.ctaText}>Review</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'review' && (
        <View style={styles.body}>
          <View style={styles.reviewAmt}>
            <Text style={styles.amountBig}>{formatUsd(usd)}</Text>
            <Text style={styles.available}>to {BANK.name}</Text>
          </View>
          <View style={styles.card}>
            <Row label="To" value={`${BANK.name} •••• ${BANK.last4}`} border />
            <Row label="Arrives" value="1–3 business days" border />
            <Row label="Fee" value="$0.00" border />
            <Row label="Total" value={formatUsd(usd)} />
          </View>
          <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={confirm}>
            <Text style={styles.ctaText}>Send to bank</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'done' && (
        <View style={styles.doneWrap}>
          <View style={styles.doneCircle}>
            <Ionicons name="checkmark" size={48} color={colors.up} />
          </View>
          <Text style={styles.doneTitle}>Transfer initiated</Text>
          <Text style={styles.doneText}>{formatUsd(sentAmount)} is on its way to {BANK.name} •••• {BANK.last4}</Text>
          <Text style={styles.doneText}>Estimated arrival 1–3 business days</Text>
          <View style={styles.newBalCard}>
            <Text style={styles.newBalLabel}>New wallet balance</Text>
            <Text style={styles.newBalValue}>{formatUsd(newBalance)}</Text>
          </View>
          <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={onClose}>
            <Text style={styles.ctaText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function Row({ label, value, border }: { label: string; value: string; border?: boolean }) {
  return (
    <View style={[styles.row, border && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  navTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  body: { flex: 1, paddingHorizontal: spacing.lg },
  amountBig: { color: colors.text, fontSize: 44, fontWeight: '800', textAlign: 'center', marginTop: spacing.lg, letterSpacing: -1.5 },
  available: { color: colors.textDim, fontSize: 14, textAlign: 'center', marginTop: 4, marginBottom: spacing.lg },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgElevated, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: 14, gap: 6 },
  inputPrefix: { color: colors.textDim, fontSize: 20, fontWeight: '700' },
  input: { flex: 1, color: colors.text, fontSize: 20, fontWeight: '700', padding: 0 },
  max: { color: colors.accent, fontSize: 14, fontWeight: '700' },
  toLabel: { color: colors.textDim, fontSize: 14, marginTop: spacing.xl, marginBottom: spacing.sm },
  bankRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bgElevated, borderRadius: radius.md, padding: spacing.lg },
  bankIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent + '1F', alignItems: 'center', justifyContent: 'center' },
  bankName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  bankSub: { color: colors.textDim, fontSize: 13 },
  note: { color: colors.textFaint, fontSize: 12, marginTop: spacing.md, lineHeight: 17 },
  cta: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingVertical: 17, alignItems: 'center', marginTop: 'auto', marginBottom: spacing.lg },
  ctaOff: { backgroundColor: colors.cardAlt },
  ctaText: { color: '#1A1130', fontSize: 16, fontWeight: '700' },
  reviewAmt: { marginBottom: spacing.lg },
  card: { backgroundColor: colors.bgElevated, borderRadius: radius.md, paddingHorizontal: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { color: colors.textDim, fontSize: 14 },
  rowValue: { color: colors.text, fontSize: 14, fontWeight: '600' },
  doneWrap: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xl * 2 },
  doneCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.up + '22', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  doneTitle: { color: colors.text, fontSize: 24, fontWeight: '800' },
  doneText: { color: colors.textDim, fontSize: 14, textAlign: 'center', marginTop: 6 },
  newBalCard: { backgroundColor: colors.bgElevated, borderRadius: radius.md, paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, alignItems: 'center', marginTop: spacing.xl, alignSelf: 'stretch' },
  newBalLabel: { color: colors.textDim, fontSize: 13 },
  newBalValue: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 4 },
});
