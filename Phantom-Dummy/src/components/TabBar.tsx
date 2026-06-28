import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';

export type TabKey = 'home' | 'swap' | 'collectibles' | 'activity';

const TABS: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'swap', label: 'Swap', icon: 'swap-horizontal' },
  { key: 'collectibles', label: 'NFTs', icon: 'images' },
  { key: 'activity', label: 'Activity', icon: 'time' },
];

interface Props {
  active: TabKey;
  onChange: (key: TabKey) => void;
}

export function TabBar({ active, onChange }: Props) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <View style={styles.bar}>
        {TABS.map((t) => {
          const isActive = t.key === active;
          const color = isActive ? colors.accent : colors.textFaint;
          return (
            <TouchableOpacity key={t.key} style={styles.tab} onPress={() => onChange(t.key)} activeOpacity={0.7}>
              <Ionicons name={t.icon} size={24} color={color} />
              <Text style={[styles.label, { color }]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bgElevated },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.bgElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    paddingBottom: 6,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  label: { fontSize: 11, fontWeight: '600' },
});
