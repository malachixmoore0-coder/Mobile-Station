import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { usePortfolio } from '@/context/PortfolioContext';

export type TabKey = 'discover' | 'saved' | 'contractors' | 'settings';

const TABS: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'discover', label: 'Discover', icon: 'search-outline', iconActive: 'search' },
  { key: 'saved', label: 'Pipeline', icon: 'heart-outline', iconActive: 'heart' },
  { key: 'contractors', label: 'Team', icon: 'hammer-outline', iconActive: 'hammer' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline', iconActive: 'settings' },
];

interface Props {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export function BottomTabBar({ active, onChange }: Props) {
  const { savedIds } = usePortfolio();

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
              <View>
                <Ionicons
                  name={isActive ? tab.iconActive : tab.icon}
                  size={22}
                  color={isActive ? colors.primary : colors.inkFaint}
                />
                {tab.key === 'saved' && savedIds.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{savedIds.length}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
  bar: { flexDirection: 'row', paddingTop: spacing.sm, paddingBottom: 4 },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  label: { fontSize: 11, fontWeight: '600', color: colors.inkFaint },
  labelActive: { color: colors.primary },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.poor,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: '800' },
});
