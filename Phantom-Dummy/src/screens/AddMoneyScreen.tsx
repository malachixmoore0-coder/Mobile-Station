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

type Step = 'form' | 'done';

const METHODS: { id: string; label: string; sub: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'applepay', label: 'Apple Pay', sub: 'Instant', icon: 'logo-apple' },
  { id: 'card', label: 'Debit card', sub: '•••• 4242', icon: 'card' },
  { id: 'bank', label: 'Bank transfer', sub: 'Chase •••• 1234', icon: 'business' },
];

const PRESETS = [100, 500, 1000, 5000];

export function AddMoneyScreen({ onClose }: Props) {
  const { cash, addCash } = useWallet();
  const [step, setStep] = useState<Step>('form');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('applepay');
  const [added, setAdded] = useState(0);
  const [newCash, setNewCash] = useState(0);

  const usd = parseFloat(amount) || 0;
  const valid = usd > 0;

  function confirm() {
    const res = addCash(usd);
    if (res.ok) {
      setAdded(usd);
      setNewCash(cash + usd);
      setStep('done');
    }
  }

  const chosen = METHODS.find((m) => m.id === method)!;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={onClose} hitSlop={12}>
          <Ionicons name={step === 'done' ? 'close' : 'chevron-back'} size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{step === 'done' ? '' : 'Add money'}</Text>
        <View style={{ width: 26 }} />
      </View>

      {step === 'form' && (
        <View style={styles.body}>
          <Text style={styles.amountBig}>{usd > 0 ? formatUsd(usd) : '$0'}</Text>
          <Text style={styles.available}>Cash balance {formatUsd(cash)}</Text>

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
          </View>

          <View style={styles.presets}>
            {PRESETS.map((p) => (
              <TouchableOpacity key={p} style={styles.preset} activeOpacity={0.7} onPress={() => setAmount(String(p))}>
                <Text style={styles.presetText}>${p.toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.payWith}>Pay with</Text>
          {METHODS.map((m) => {
            const active = m.id === method;
            return (
              <TouchableOpacity key={m.id} style={styles.methodRow} activeOpacity={0.7} onPress={() => setMethod(m.id)}>
                <View style={styles.methodIcon}><Ionicons name={m.icon} size={20} color={colors.accent} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodLabel}>{m.label}</Text>
                  <Text style={styles.methodSub}>{m.sub}</Text>
                </View>
                <Ionicons
                  name={active ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={active ? colors.accent : colors.textFaint}
                />
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={[styles.cta, !valid && styles.ctaOff]} disabled={!valid} activeOpacity={0.85} onPress={confirm}>
            <Text style={styles.ctaText}>{valid ? `Add ${formatUsd(usd)}` : 'Enter an amount'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'done' && (
        <View style={styles.doneWrap}>
          <View style={styles.doneCircle}>
            <Ionicons name="checkmark" size={48} color={colors.up} />
          </View>
          <Text style={styles.doneTitle}>Money added</Text>
          <Text style={styles.doneText}>{formatUsd(added)} via {chosen.label}</Text>
          <View style={styles.newBalCard}>
            <Text style={styles.newBalLabel}>New cash balance</Text>
            <Text style={styles.newBalValue}>{formatUsd(newCash)}</Text>
          </View>
          <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={onClose}>
            <Text style={styles.ctaText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
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
  presets: { flexDirection: 'row', gap: 8, marginTop: spacing.md },
  preset: { flex: 1, alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.pill, paddingVertical: 10 },
  presetText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  payWith: { color: colors.textDim, fontSize: 14, marginTop: spacing.xl, marginBottom: spacing.sm },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bgElevated, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.sm },
  methodIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent + '1F', alignItems: 'center', justifyContent: 'center' },
  methodLabel: { color: colors.text, fontSize: 15, fontWeight: '600' },
  methodSub: { color: colors.textDim, fontSize: 13 },
  cta: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingVertical: 17, alignItems: 'center', marginTop: 'auto', marginBottom: spacing.lg },
  ctaOff: { backgroundColor: colors.cardAlt },
  ctaText: { color: '#1A1130', fontSize: 16, fontWeight: '700' },
  doneWrap: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xl * 2 },
  doneCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.up + '22', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  doneTitle: { color: colors.text, fontSize: 24, fontWeight: '800' },
  doneText: { color: colors.textDim, fontSize: 14, textAlign: 'center', marginTop: 6 },
  newBalCard: { backgroundColor: colors.bgElevated, borderRadius: radius.md, paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, alignItems: 'center', marginTop: spacing.xl, alignSelf: 'stretch' },
  newBalLabel: { color: colors.textDim, fontSize: 13 },
  newBalValue: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 4 },
});
