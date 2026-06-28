import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';

interface Props {
  onPlus: () => void;
}

/** The persistent bottom "Search Phantom" bar + lavender plus button. */
export function SearchDock({ onPlus }: Props) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <View style={styles.row}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.textFaint} />
          <Text style={styles.placeholder}>Search Phantom</Text>
        </View>
        <TouchableOpacity style={styles.plus} activeOpacity={0.85} onPress={onPlus}>
          <Ionicons name="add" size={26} color="#1A1130" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
  },
  placeholder: { color: colors.textFaint, fontSize: 15 },
  plus: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
