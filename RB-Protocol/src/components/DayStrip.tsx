import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { addDays, dateKey, dayIndex } from '@/utils/date';
import { DAY_NAMES, dayTypeFor } from '@/data/schedule';
import { DAY_TYPE_SHORT } from '@/data/workouts';

interface Props {
  active: Date;
  onChange: (d: Date) => void;
  /** Days shown behind and ahead of today. */
  back?: number;
  ahead?: number;
}

/** Horizontal date rail: day letter, date, and the split code for that day. */
export function DayStrip({ active, onChange, back = 6, ahead = 2 }: Props) {
  const today = new Date();
  const days = Array.from({ length: back + ahead + 1 }, (_, i) => addDays(today, i - back));
  const activeKey = dateKey(active);
  const scroller = useRef<ScrollView>(null);

  return (
    <ScrollView
      ref={scroller}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroller}
      contentContainerStyle={styles.strip}
      // contentOffset is iOS-only, so park the rail on today once it's measured.
      onContentSizeChange={() =>
        scroller.current?.scrollTo({ x: Math.max(0, (back - 2) * (CELL + 8)), animated: false })
      }
    >
      {days.map((d) => {
        const key = dateKey(d);
        const isActive = key === activeKey;
        const isToday = key === dateKey(today);
        const code = DAY_TYPE_SHORT[dayTypeFor(dayIndex(d))];
        const rest = code === 'REC';
        return (
          <TouchableOpacity
            key={key}
            activeOpacity={0.8}
            style={[styles.day, isActive && styles.dayActive]}
            onPress={() => onChange(d)}
          >
            <Text style={[styles.dow, isActive && styles.dowActive]}>{DAY_NAMES[d.getDay()]}</Text>
            <Text style={[styles.num, isActive && styles.numActive, isToday && !isActive && styles.numToday]}>
              {d.getDate()}
            </Text>
            <Text style={[styles.code, rest ? styles.codeRest : styles.codeTrain, isActive && styles.codeActive]}>
              {code}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

/** Cell width; the rail scrolls in these units. */
const CELL = 52;

const styles = StyleSheet.create({
  scroller: { flexGrow: 0, flexShrink: 0 },
  strip: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    alignItems: 'flex-start',
  },
  day: {
    width: CELL,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 1,
  },
  dayActive: { backgroundColor: colors.volt, borderColor: colors.volt },
  dow: { fontSize: 10, fontWeight: '800', color: colors.inkFaint, textTransform: 'uppercase' },
  dowActive: { color: colors.bg },
  num: { fontSize: 17, fontWeight: '900', color: colors.ink },
  numActive: { color: colors.bg },
  numToday: { color: colors.volt },
  code: { fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
  codeTrain: { color: colors.voltDim },
  codeRest: { color: colors.inkFaint },
  codeActive: { color: colors.bg },
});
