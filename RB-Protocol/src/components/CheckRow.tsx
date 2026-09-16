import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';

interface Props {
  label: string;
  detail?: string;
  note?: string;
  done: boolean;
  color?: string;
  onToggle: () => void;
}

export function CheckRow({ label, detail, note, done, color = colors.volt, onToggle }: Props) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onToggle}>
      <View style={[styles.box, done && { backgroundColor: color, borderColor: color }]}>
        {done && <Ionicons name="checkmark" size={13} color={colors.bg} />}
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.label, done && styles.labelDone]}>{label}</Text>
        {!!note && <Text style={styles.note}>{note}</Text>}
      </View>
      {!!detail && <Text style={[styles.detail, done && styles.detailDone]}>{detail}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, gap: spacing.md },
  box: {
    width: 20,
    height: 20,
    borderRadius: radius.sm - 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1 },
  label: { fontSize: 14, color: colors.ink, fontWeight: '600' },
  labelDone: { color: colors.inkFaint, textDecorationLine: 'line-through' },
  note: { fontSize: 11, color: colors.inkFaint, marginTop: 2 },
  detail: { fontSize: 13, color: colors.inkDim, fontWeight: '800' },
  detailDone: { color: colors.inkFaint },
});
