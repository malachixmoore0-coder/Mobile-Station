import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';

export type TabKey = 'today' | 'train' | 'fuel' | 'stack' | 'progress';

const TABS: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'today', label: 'Today', icon: 'sunny-outline', iconActive: 'sunny' },
  { key: 'train', label: 'Train', icon: 'barbell-outline', iconActive: 'barbell' },
  { key: 'fuel', label: 'Fuel', icon: 'restaurant-outline', iconActive: 'restaurant' },
  { key: 'stack', label: 'Stack', icon: 'medical-outline', iconActive: 'medical' },
  { key: 'progress', label: 'Progress', icon: 'stats-chart-outline', iconActive: 'stats-chart' },
];

interface Props {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export function BottomTabBar({ active, onChange }: Props) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              activeOpacity={0.7}
              onPress={() => onChange(tab.key)}
            >
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={21}
                color={isActive ? colors.volt : colors.inkFaint}
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bgAlt, borderTopWidth: 1, borderTopColor: colors.border },
  bar: { flexDirection: 'row', paddingTop: spacing.sm, paddingBottom: 4 },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  label: { fontSize: 10.5, fontWeight: '700', color: colors.inkFaint },
  labelActive: { color: colors.volt },
});
