import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius } from '@/theme';
import { TIMEFRAMES, Timeframe } from '@/data/portfolio';

interface Props {
  value: Timeframe;
  onChange: (tf: Timeframe) => void;
}

export function TimeframeSelector({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {TIMEFRAMES.map((tf) => {
        const active = tf === value;
        return (
          <TouchableOpacity
            key={tf}
            style={[styles.pill, active && styles.pillActive]}
            onPress={() => onChange(tf)}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{tf}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
  },
  pillActive: {
    backgroundColor: colors.cardAlt,
  },
  label: {
    color: colors.textFaint,
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.text,
  },
});
