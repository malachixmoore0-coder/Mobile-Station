import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadow, spacing } from '@/theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glow?: string;
  padded?: boolean;
};

export function Card({ children, style, glow, padded = true }: Props) {
  return (
    <View style={[styles.wrap, glow ? shadow.glow(glow) : shadow.card, style]}>
      <LinearGradient colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.015)']} style={StyleSheet.absoluteFill} />
      <View style={padded ? styles.padded : undefined}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.lg,
  },
});
