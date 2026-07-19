import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { useAppState } from '@/context/AppStateContext';
import { BottomSheet } from '@/components/BottomSheet';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SliderControl } from '@/components/SliderControl';
import { formatCurrency, formatPercent, formatSigned } from '@/utils/format';

type Mode = 'amount' | 'percent';

export function LogTradeModal({ visible, onClose, onLogged }: { visible: boolean; onClose: () => void; onLogged: (earnings: number) => void }) {
  const { settings, balance, logTrade } = useAppState();
  const [mode, setMode] = useState<Mode>('amount');
  const [text, setText] = useState('');
  const [reinvestPct, setReinvestPct] = useState(settings.defaultReinvestPct);

  const earnings = useMemo(() => {
    const n = parseFloat(text);
    if (Number.isNaN(n)) return 0;
    return mode === 'amount' ? n : balance * (n / 100);
  }, [text, mode, balance]);

  const canSubmit = text.trim().length > 0 && !Number.isNaN(parseFloat(text));

  const submit = () => {
    if (!canSubmit) return;
    logTrade(earnings, reinvestPct);
    onLogged(earnings);
    setText('');
    onClose();
  };

  const useTarget = () => {
    setMode('percent');
    setText((settings.dailyTargetRate * 100).toString());
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Log Today's Trade">
      <View style={styles.modeRow}>
        <Pressable style={[styles.modeButton, mode === 'amount' && styles.modeButtonActive]} onPress={() => setMode('amount')}>
          <Text style={[styles.modeLabel, mode === 'amount' && styles.modeLabelActive]}>$ Amount</Text>
        </Pressable>
        <Pressable style={[styles.modeButton, mode === 'percent' && styles.modeButtonActive]} onPress={() => setMode('percent')}>
          <Text style={[styles.modeLabel, mode === 'percent' && styles.modeLabelActive]}>% of balance</Text>
        </Pressable>
      </View>

      <TextInput
        value={text}
        onChangeText={setText}
        keyboardType="numbers-and-punctuation"
        placeholder={mode === 'amount' ? 'e.g. 12.50 or -8.20' : 'e.g. 10 or -5'}
        placeholderTextColor={colors.inkFaint}
        style={styles.input}
        autoFocus
      />

      <Pressable onPress={useTarget}>
        <Text style={styles.targetHint}>Use target rate ({formatPercent(settings.dailyTargetRate)})</Text>
      </Pressable>

      <Text style={styles.previewLabel}>Result</Text>
      <Text style={[styles.preview, { color: earnings >= 0 ? colors.mint : colors.rose }]}>{formatSigned(earnings)}</Text>

      <View style={styles.reinvestHeader}>
        <Text style={styles.label}>Reinvest into principal</Text>
        <Text style={styles.reinvestValue}>{formatPercent(reinvestPct, 0)}</Text>
      </View>
      <SliderControl value={reinvestPct} onChange={setReinvestPct} />
      <Text style={styles.hint}>
        {earnings > 0
          ? `${formatCurrency(earnings * reinvestPct)} compounds in, ${formatCurrency(earnings * (1 - reinvestPct))} cashed out`
          : 'Losses come straight off your principal'}
      </Text>

      <Text style={styles.newBalanceLabel}>New balance: {formatCurrency(balance + earnings)}</Text>

      <View style={{ marginTop: spacing.lg }}>
        <PrimaryButton label="Log Trade" onPress={submit} disabled={!canSubmit} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  modeRow: {
    flexDirection: 'row',
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: spacing.md,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: colors.mintSoft,
  },
  modeLabel: {
    color: colors.inkFaint,
    fontWeight: '700',
    fontSize: 13,
  },
  modeLabelActive: {
    color: colors.mint,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.ink,
    fontSize: 20,
    fontWeight: '700',
  },
  targetHint: {
    color: colors.violet,
    fontSize: 12,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  previewLabel: {
    color: colors.inkFaint,
    fontSize: 12,
    marginTop: spacing.lg,
  },
  preview: {
    fontSize: 30,
    fontWeight: '800',
    marginTop: 2,
  },
  reinvestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.inkDim,
    fontSize: 13,
    fontWeight: '600',
  },
  reinvestValue: {
    color: colors.mint,
    fontSize: 13,
    fontWeight: '700',
  },
  hint: {
    color: colors.inkFaint,
    fontSize: 11,
    marginTop: spacing.sm,
  },
  newBalanceLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.lg,
  },
});
