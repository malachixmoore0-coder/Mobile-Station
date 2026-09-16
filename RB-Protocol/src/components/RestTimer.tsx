import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, shadow } from '@/theme';
import { mmss } from '@/utils/date';

interface Props {
  /** Prescribed rest in seconds; changing it restarts the countdown. */
  seconds: number;
  exerciseName: string;
  onDismiss: () => void;
}

/** Sticky countdown bar shown after a set is logged. */
export function RestTimer({ seconds, exerciseName, onDismiss }: Props) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(true);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setLeft(seconds);
    setRunning(true);
  }, [seconds]);

  useEffect(() => {
    if (!running) return;
    tick.current = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [running]);

  const over = left <= 0;
  const pct = Math.max(0, Math.min(1, left / seconds));

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: over ? colors.volt : colors.hydration }]} />
      </View>
      <View style={styles.row}>
        <View style={styles.textCol}>
          <Text style={[styles.time, over && { color: colors.volt }]}>
            {over ? `+${mmss(Math.abs(left))}` : mmss(left)}
          </Text>
          <Text style={styles.label}>{over ? 'Rest complete — go' : `Rest · ${exerciseName}`}</Text>
        </View>
        <TouchableOpacity style={styles.btn} activeOpacity={0.8} onPress={() => setLeft((l) => l + 30)}>
          <Text style={styles.btnText}>+30s</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} activeOpacity={0.8} onPress={() => setRunning((r) => !r)}>
          <Ionicons name={running ? 'pause' : 'play'} size={16} color={colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnClose]} activeOpacity={0.8} onPress={onDismiss}>
          <Ionicons name="close" size={16} color={colors.bg} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.cardAlt,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadow.pop,
  },
  track: { height: 3, backgroundColor: colors.border },
  fill: { height: '100%' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  textCol: { flex: 1 },
  time: { fontSize: 22, fontWeight: '900', color: colors.ink, letterSpacing: -0.5 },
  label: { fontSize: 11, color: colors.inkFaint, fontWeight: '700' },
  btn: {
    minWidth: 42,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { fontSize: 12, fontWeight: '800', color: colors.ink },
  btnClose: { backgroundColor: colors.volt, borderColor: colors.volt },
});
