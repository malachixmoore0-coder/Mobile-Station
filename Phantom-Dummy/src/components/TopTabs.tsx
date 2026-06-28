import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius } from '@/theme';

export type TabKey = 'home' | 'trade' | 'predict' | 'explore';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'trade', label: 'Trade' },
  { key: 'predict', label: 'Predict' },
  { key: 'explore', label: 'Explore' },
];

interface Props {
  active: TabKey;
  onChange: (key: TabKey) => void;
}

/** The segmented pill row of tabs in the header (current Phantom layout). */
export function TopTabs({ active, onChange }: Props) {
  return (
    <View style={styles.row}>
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <TouchableOpacity
            key={t.key}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onChange(t.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  pillActive: {
    backgroundColor: colors.cardAlt,
  },
  label: {
    color: colors.textFaint,
    fontSize: 15,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.text,
  },
});
