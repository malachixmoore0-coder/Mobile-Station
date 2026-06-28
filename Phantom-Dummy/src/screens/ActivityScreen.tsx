import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '@/theme';
import { ACTIVITY, Activity } from '@/data/portfolio';

const ICONS: Record<Activity['type'], keyof typeof Ionicons.glyphMap> = {
  receive: 'arrow-down',
  send: 'arrow-up',
  swap: 'swap-horizontal',
  stake: 'leaf',
  buy: 'card',
};

export function ActivityScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Ionicons name="filter-outline" size={22} color={colors.textDim} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {ACTIVITY.map((a) => (
          <View key={a.id} style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: (a.positive ? colors.up : colors.down) + '1F' }]}>
              <Ionicons name={ICONS[a.type]} size={18} color={a.positive ? colors.up : colors.down} />
            </View>
            <View style={styles.info}>
              <Text style={styles.rowTitle}>{a.title}</Text>
              <Text style={styles.rowSub}>{a.subtitle} · {a.time}</Text>
            </View>
            <View style={styles.right}>
              <Text style={[styles.amount, { color: a.positive ? colors.up : colors.text }]}>{a.amount}</Text>
              <Text style={styles.usd}>{a.usd}</Text>
            </View>
          </View>
        ))}
        <Text style={styles.disclaimer}>Demo activity · not real transactions</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  scroll: { paddingHorizontal: spacing.md, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 3 },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  rowSub: { color: colors.textDim, fontSize: 13 },
  right: { alignItems: 'flex-end', gap: 3 },
  amount: { fontSize: 14, fontWeight: '600' },
  usd: { color: colors.textFaint, fontSize: 13 },
  disclaimer: { color: colors.textFaint, fontSize: 11, textAlign: 'center', marginTop: spacing.lg },
});
