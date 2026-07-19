import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { useAppState } from '@/context/AppStateContext';
import { BottomSheet } from '@/components/BottomSheet';
import { PrimaryButton } from '@/components/PrimaryButton';
import { formatCurrency, formatSigned } from '@/utils/format';

export function EditBalanceModal({ visible, onClose, onSaved }: { visible: boolean; onClose: () => void; onSaved: () => void }) {
  const { balance, logManualBalance } = useAppState();
  const [text, setText] = useState('');

  const parsed = parseFloat(text);
  const canSubmit = text.trim().length > 0 && !Number.isNaN(parsed) && parsed >= 0;
  const delta = canSubmit ? parsed - balance : 0;

  const submit = () => {
    if (!canSubmit) return;
    logManualBalance(parsed, 'Manual balance update');
    setText('');
    onSaved();
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Update Balance Manually">
      <Text style={styles.hint}>Set your account to its real current value. Useful after a broker deposit, withdrawal, or reconciling actual results.</Text>

      <Text style={styles.label}>Current balance</Text>
      <Text style={styles.current}>{formatCurrency(balance)}</Text>

      <Text style={[styles.label, { marginTop: spacing.lg }]}>New balance</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        keyboardType="decimal-pad"
        placeholder={balance.toFixed(2)}
        placeholderTextColor={colors.inkFaint}
        style={styles.input}
        autoFocus
      />

      {canSubmit && (
        <Text style={[styles.delta, { color: delta >= 0 ? colors.mint : colors.rose }]}>{formatSigned(delta)} adjustment</Text>
      )}

      <View style={{ marginTop: spacing.xl }}>
        <PrimaryButton label="Update Balance" onPress={submit} disabled={!canSubmit} colors={['#8B5CF6', '#6D28D9']} textColor={colors.white} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  hint: {
    color: colors.inkFaint,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.inkDim,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  current: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
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
  delta: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
});
