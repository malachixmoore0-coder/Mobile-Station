import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '@/theme';

interface Props {
  /** 0-1. */
  progress: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  caption?: string;
}

export function ProgressRing({
  progress,
  size = 104,
  stroke = 9,
  color = colors.volt,
  label,
  caption,
}: Props) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - clamped)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, styles.center]}>
        <Text style={[styles.label, { color }]}>{label ?? `${Math.round(clamped * 100)}%`}</Text>
        {!!caption && <Text style={styles.caption}>{caption}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  caption: { fontSize: 10, color: colors.inkFaint, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
});
