import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius, spacing } from '@/theme';

export type TabKey = 'home' | 'ledger' | 'markets' | 'achievements' | 'profile';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'home', label: 'Home', icon: '◆' },
  { key: 'ledger', label: 'Ledger', icon: '≡' },
  { key: 'markets', label: 'Markets', icon: '≈' },
  { key: 'achievements', label: 'Badges', icon: '★' },
  { key: 'profile', label: 'Profile', icon: '●' },
];

function TabButton({ tab, active, onPress }: { tab: (typeof TABS)[number]; active: boolean; onPress: () => void }) {
  const scale = useRef(new Animated.Value(active ? 1 : 0.9)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: active ? 1 : 0.9,
      useNativeDriver: true,
      friction: 6,
      tension: 80,
    }).start();
  }, [active, scale]);

  return (
    <Pressable style={styles.tabButton} onPress={onPress} hitSlop={8}>
      <Animated.View style={[styles.iconWrap, active && styles.iconWrapActive, { transform: [{ scale }] }]}>
        <Text style={[styles.icon, active && styles.iconActive]}>{tab.icon}</Text>
      </Animated.View>
      <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
    </Pressable>
  );
}

export function BottomTabBar({ active, onChange }: { active: TabKey; onChange: (key: TabKey) => void }) {
  return (
    <View style={styles.wrap}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.row}>
        {TABS.map((tab) => (
          <TabButton key={tab.key} tab={tab} active={active === tab.key} onPress={() => onChange(tab.key)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(15,17,26,0.55)',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.mintSoft,
  },
  icon: {
    fontSize: 15,
    color: colors.inkFaint,
  },
  iconActive: {
    color: colors.mint,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.inkFaint,
  },
  labelActive: {
    color: colors.mint,
  },
});
