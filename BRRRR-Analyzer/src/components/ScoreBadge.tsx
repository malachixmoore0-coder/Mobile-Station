import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scoreBand, radius, spacing } from '@/theme';

interface Props {
  score: number;
  size?: 'sm' | 'lg';
}

export function ScoreBadge({ score, size = 'sm' }: Props) {
  const band = scoreBand(score);
  const big = size === 'lg';
  return (
    <View style={[styles.wrap, { backgroundColor: band.soft }, big && styles.wrapLg]}>
      <Text style={[styles.score, { color: band.color }, big && styles.scoreLg]}>{score}</Text>
      <Text style={[styles.label, { color: band.color }, big && styles.labelLg]}>{band.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  wrapLg: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  score: {
    fontSize: 14,
    fontWeight: '800',
  },
  scoreLg: {
    fontSize: 30,
    fontWeight: '800',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
  labelLg: {
    fontSize: 14,
    fontWeight: '700',
  },
});
