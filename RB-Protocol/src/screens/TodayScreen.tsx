import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ProgressRing } from '@/components/ProgressRing';
import { DayStrip } from '@/components/DayStrip';
import { BlockCard } from '@/components/BlockCard';
import { WaterTracker } from '@/components/WaterTracker';
import { useLog } from '@/context/LogContext';
import { checkableIds, dayTypeFor, isTrainingDay, scheduleFor } from '@/data/schedule';
import { DAY_TYPE_LABEL, WORKOUTS } from '@/data/workouts';
import { clock, dateKey, dayIndex, minutesOfDay, prettyDate, relativeToNow } from '@/utils/date';

export function TodayScreen({ onOpenWorkout }: { onOpenWorkout: () => void }) {
  const { activeDate, setActiveDate, completion, isDone } = useLog();
  const [now, setNow] = useState(new Date());

  // The "next up" card and relative times only mean anything on the real today.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const viewingToday = dateKey(activeDate) === dateKey(now);
  const nowMinutes = viewingToday ? minutesOfDay(now) : null;

  const day = dayIndex(activeDate);
  const blocks = useMemo(() => scheduleFor(day), [day]);
  const ids = useMemo(() => checkableIds(blocks), [blocks]);
  const progress = completion(ids);
  const dayType = dayTypeFor(day);
  const training = isTrainingDay(day);

  const nextBlock = useMemo(() => {
    const incomplete = blocks.filter((b) => !b.items.every((i) => isDone(i.id)));
    if (nowMinutes === null) return incomplete[0];
    return incomplete.find((b) => b.time + 45 >= nowMinutes) ?? incomplete[0];
  }, [blocks, nowMinutes, isDone]);

  const doneCount = ids.filter(isDone).length;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title={prettyDate(activeDate, now)}
        subtitle={`${DAY_TYPE_LABEL[dayType]} · ${training ? 'training day' : 'active recovery'}`}
        right={
          !viewingToday ? (
            <TouchableOpacity style={styles.todayBtn} activeOpacity={0.8} onPress={() => setActiveDate(new Date())}>
              <Ionicons name="today-outline" size={14} color={colors.bg} />
              <Text style={styles.todayBtnText}>Today</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <DayStrip active={activeDate} onChange={setActiveDate} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          <ProgressRing progress={progress} caption="dialed" />
          <View style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Protocol adherence</Text>
            <Text style={styles.summaryCount}>
              {doneCount} <Text style={styles.summaryCountDim}>of {ids.length} checks</Text>
            </Text>
            {!!nextBlock && (
              <View style={styles.nextRow}>
                <Ionicons name="arrow-forward-circle" size={14} color={colors.volt} />
                <Text style={styles.nextText} numberOfLines={2}>
                  Next: {nextBlock.title} · {clock(nextBlock.time)}
                  {nowMinutes !== null ? ` (${relativeToNow(nextBlock.time, nowMinutes)})` : ''}
                </Text>
              </View>
            )}
            {!nextBlock && (
              <View style={styles.nextRow}>
                <Ionicons name="trophy" size={14} color={colors.volt} />
                <Text style={styles.nextText}>Whole day closed out. Go to sleep.</Text>
              </View>
            )}
          </View>
        </View>

        <WaterTracker />

        {training && (
          <TouchableOpacity style={styles.sessionCard} activeOpacity={0.85} onPress={onOpenWorkout}>
            <View style={styles.sessionLeft}>
              <Text style={styles.sessionLabel}>Today's session</Text>
              <Text style={styles.sessionTitle}>{WORKOUTS[dayType].title}</Text>
              <Text style={styles.sessionMeta}>
                {WORKOUTS[dayType].exercises.length} lifts · 9:15 AM
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.bg} />
          </TouchableOpacity>
        )}

        <Text style={styles.sectionLabel}>Timeline</Text>
        {blocks.map((block) => (
          <BlockCard
            key={block.id}
            block={block}
            nowMinutes={nowMinutes}
            isNext={nextBlock?.id === block.id}
            onOpenWorkout={onOpenWorkout}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  todayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.volt,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  todayBtnText: { color: colors.bg, fontWeight: '900', fontSize: 12 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  summaryText: { flex: 1, gap: 2 },
  summaryLabel: { fontSize: 11, fontWeight: '800', color: colors.inkFaint, textTransform: 'uppercase', letterSpacing: 0.7 },
  summaryCount: { fontSize: 22, fontWeight: '900', color: colors.ink, letterSpacing: -0.6 },
  summaryCountDim: { fontSize: 13, color: colors.inkFaint, fontWeight: '700' },
  nextRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 6 },
  nextText: { flex: 1, fontSize: 12, color: colors.inkDim, fontWeight: '700', lineHeight: 17 },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.volt,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  sessionLeft: { flex: 1 },
  sessionLabel: { fontSize: 10, fontWeight: '900', color: 'rgba(11,13,12,0.6)', textTransform: 'uppercase', letterSpacing: 0.8 },
  sessionTitle: { fontSize: 18, fontWeight: '900', color: colors.bg, letterSpacing: -0.5, marginTop: 2 },
  sessionMeta: { fontSize: 12, fontWeight: '700', color: 'rgba(11,13,12,0.7)', marginTop: 2 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginTop: spacing.sm,
  },
});
