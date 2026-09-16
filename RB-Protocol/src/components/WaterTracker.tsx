import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';
import { useLog } from '@/context/LogContext';
import { WATER_TARGET } from '@/utils/nutrition';

/** Water counted in 8 oz units against the daily target. */
export function WaterTracker({ compact = false }: { compact?: boolean }) {
  const { water, addWater } = useLog();
  const pct = Math.min(1, water / WATER_TARGET);

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={styles.headRow}>
        <View style={styles.headLeft}>
          <Ionicons name="water" size={15} color={colors.hydration} />
          <Text style={styles.title}>Water</Text>
        </View>
        <Text style={styles.count}>
          {water * 8} <Text style={styles.countUnit}>/ {WATER_TARGET * 8} oz</Text>
        </Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.btn} activeOpacity={0.8} onPress={() => addWater(-1)}>
          <Ionicons name="remove" size={16} color={colors.inkDim} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} activeOpacity={0.8} onPress={() => addWater(1)}>
          <Ionicons name="add" size={16} color={colors.bg} />
          <Text style={styles.btnPrimaryText}>8 oz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} activeOpacity={0.8} onPress={() => addWater(3)}>
          <Text style={styles.btnText}>+24 oz</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  wrapCompact: { padding: spacing.md, gap: spacing.sm },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 14, fontWeight: '800', color: colors.ink },
  count: { fontSize: 15, fontWeight: '900', color: colors.hydration },
  countUnit: { fontSize: 11, color: colors.inkFaint, fontWeight: '700' },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.cardAlt, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.hydration, borderRadius: 3 },
  buttons: { flexDirection: 'row', gap: spacing.sm },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnPrimary: { backgroundColor: colors.hydration, borderColor: colors.hydration, flex: 1 },
  btnPrimaryText: { color: colors.bg, fontWeight: '900', fontSize: 13 },
  btnText: { color: colors.inkDim, fontWeight: '800', fontSize: 13 },
});
