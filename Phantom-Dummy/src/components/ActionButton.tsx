import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

/** The round lavender quick-action buttons under the balance (Phantom style). */
export function ActionButton({ icon, label, onPress }: Props) {
  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.circle} onPress={onPress} activeOpacity={0.75}>
        <Ionicons name={icon} size={22} color={colors.accent} />
      </TouchableOpacity>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 8,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent + '1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
});
