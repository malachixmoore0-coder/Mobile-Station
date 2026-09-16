import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '@/theme';

interface Props {
  label: string;
  color?: string;
  soft?: string;
}

export function Tag({ label, color = colors.volt, soft = colors.voltSoft }: Props) {
  return (
    <View style={[styles.tag, { backgroundColor: soft }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  text: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.7 },
});
