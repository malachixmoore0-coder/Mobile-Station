import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { useAppState } from '@/context/AppStateContext';
import { BottomSheet } from '@/components/BottomSheet';
import { PrimaryButton } from '@/components/PrimaryButton';

export function AddGoalModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { addGoal } = useAppState();
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');

  const parsed = parseFloat(amount);
  const canSubmit = label.trim().length > 0 && !Number.isNaN(parsed) && parsed > 0;

  const submit = () => {
    if (!canSubmit) return;
    addGoal(label.trim(), parsed);
    setLabel('');
    setAmount('');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="New Goal">
      <Text style={styles.label}>Goal name</Text>
      <TextInput
        value={label}
        onChangeText={setLabel}
        placeholder="e.g. New laptop fund"
        placeholderTextColor={colors.inkFaint}
        style={styles.input}
        autoFocus
      />
      <Text style={[styles.label, { marginTop: spacing.md }]}>Target amount ($)</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="1000"
        placeholderTextColor={colors.inkFaint}
        style={styles.input}
      />
      <View style={{ marginTop: spacing.xl }}>
        <PrimaryButton label="Add Goal" onPress={submit} disabled={!canSubmit} colors={['#8B5CF6', '#6D28D9']} textColor={colors.white} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.inkDim, fontSize: 13, fontWeight: '600', marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.ink,
    fontSize: 16,
  },
});
