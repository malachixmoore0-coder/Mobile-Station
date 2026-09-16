import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { DayStrip } from '@/components/DayStrip';
import { ExerciseCard } from '@/components/ExerciseCard';
import { RestTimer } from '@/components/RestTimer';
import { Tag } from '@/components/Tag';
import { useLog } from '@/context/LogContext';
import { dayTypeFor, isTrainingDay, DAY_NAMES } from '@/data/schedule';
import { DAY_TYPE_LABEL, WORKOUTS } from '@/data/workouts';
import { Exercise } from '@/types';
import { addDays, dateKey, dayIndex, prettyDate } from '@/utils/date';

export function TrainScreen() {
  const { activeDate, setActiveDate, isDone, toggle, logFor, setMany } = useLog();
  const [rest, setRest] = useState<{ seconds: number; name: string; nonce: number } | null>(null);
  const [showWeek, setShowWeek] = useState(false);

  const dayType = dayTypeFor(dayIndex(activeDate));
  /** On a recovery day, the next day that actually lifts. */
  const nextSession = useMemo(() => {
    for (let ahead = 1; ahead <= 7; ahead++) {
      const d = addDays(activeDate, ahead);
      if (isTrainingDay(dayIndex(d))) return { date: d, workout: WORKOUTS[dayTypeFor(dayIndex(d))] };
    }
    return null;
  }, [activeDate]);
  const workout = WORKOUTS[dayType];
  const exerciseIds = workout.exercises.map((e) => e.id);
  const doneCount = exerciseIds.filter(isDone).length;
  const allDone = exerciseIds.length > 0 && doneCount === exerciseIds.length;

  /** Most recent previous day that ran this same session, for last-time numbers. */
  const lastTimeSets = useMemo(() => {
    for (let back = 1; back <= 28; back++) {
      const d = addDays(activeDate, -back);
      if (dayTypeFor(dayIndex(d)) !== dayType) continue;
      const log = logFor(dateKey(d));
      if (Object.keys(log.sets).length > 0) return log.sets;
    }
    return {};
  }, [activeDate, dayType, logFor]);

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Train"
        subtitle={`${prettyDate(activeDate)} · ${DAY_TYPE_LABEL[dayType]}`}
        right={
          <TouchableOpacity style={styles.weekBtn} activeOpacity={0.8} onPress={() => setShowWeek((s) => !s)}>
            <Ionicons name="calendar-outline" size={14} color={colors.ink} />
            <Text style={styles.weekBtnText}>{showWeek ? 'Session' : 'Split'}</Text>
          </TouchableOpacity>
        }
      />

      <DayStrip active={activeDate} onChange={setActiveDate} />

      {showWeek ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.splitIntro}>
            NFL running back split — 4 days on, 3 days active recovery.
          </Text>
          {[1, 2, 3, 4, 5, 6, 0].map((d) => {
            const t = dayTypeFor(d as 0 | 1 | 2 | 3 | 4 | 5 | 6);
            const w = WORKOUTS[t];
            const isRest = t === 'recovery';
            return (
              <View key={d} style={[styles.weekCard, isRest && styles.weekCardRest]}>
                <View style={styles.weekHead}>
                  <Text style={styles.weekDay}>{DAY_NAMES[d].toUpperCase()}</Text>
                  <Text style={[styles.weekTitle, isRest && styles.weekTitleRest]}>{w.title}</Text>
                </View>
                {isRest ? (
                  <Text style={styles.weekRestText}>
                    Commute / walking & light mobility only. No IGF-1 LR3.
                  </Text>
                ) : (
                  w.exercises.map((e) => (
                    <View key={e.id} style={styles.weekRow}>
                      <Text style={styles.weekEx} numberOfLines={2}>
                        {e.name}
                        {e.supersetWith ? ` + ${e.supersetWith}` : ''}
                      </Text>
                      <Text style={styles.weekSets}>
                        {e.sets} x {e.reps}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            );
          })}
        </ScrollView>
      ) : dayType === 'recovery' ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.restCard}>
            <Ionicons name="walk" size={28} color={colors.move} />
            <Text style={styles.restTitle}>Active recovery</Text>
            <Text style={styles.restBody}>
              Commute, walking and light mobility only. No lifting, and no IGF-1 LR3 today —
              the stack works on the days you leave it alone.
            </Text>
          </View>

          {!!nextSession && (
            <TouchableOpacity
              style={styles.nextCard}
              activeOpacity={0.85}
              onPress={() => setActiveDate(nextSession.date)}
            >
              <View style={styles.nextText}>
                <Text style={styles.nextLabel}>
                  Next session · {DAY_NAMES[nextSession.date.getDay()]}
                </Text>
                <Text style={styles.nextTitle}>{nextSession.workout.title}</Text>
                <Text style={styles.nextMeta}>
                  {nextSession.workout.exercises.map((e) => e.name.split(' ')[0]).join(' · ')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.bg} />
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.heroWeekday}>{workout.weekday.toUpperCase()}</Text>
            <Text style={styles.heroTitle}>{workout.title}</Text>
            <Text style={styles.heroFocus}>{workout.focus}</Text>
            <View style={styles.heroTags}>
              <Tag label={`${doneCount}/${exerciseIds.length} done`} />
              <Tag label="9:15 AM" color={colors.inkDim} soft={colors.cardAlt} />
            </View>
          </View>

          {!!workout.warmup && (
            <TouchableOpacity
              style={styles.warmup}
              activeOpacity={0.8}
              onPress={() => toggle('gym-warmup')}
            >
              <Ionicons
                name={isDone('gym-warmup') ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={isDone('gym-warmup') ? colors.volt : colors.border}
              />
              <Text style={styles.warmupText}>{workout.warmup}</Text>
            </TouchableOpacity>
          )}

          {workout.exercises.map((e, i) => (
            <ExerciseCard
              key={e.id}
              exercise={e}
              index={i}
              lastTime={lastTimeSets[e.id]}
              onSetLogged={(ex: Exercise) =>
                setRest({ seconds: ex.rest, name: ex.name, nonce: Date.now() })
              }
            />
          ))}

          <TouchableOpacity
            style={[styles.finish, allDone && styles.finishDone]}
            activeOpacity={0.85}
            onPress={() => setMany([...exerciseIds, 'gym-warmup', 'gym-session'], !allDone)}
          >
            <Ionicons name={allDone ? 'refresh' : 'checkmark-done'} size={17} color={colors.bg} />
            <Text style={styles.finishText}>{allDone ? 'Reopen session' : 'Finish session'}</Text>
          </TouchableOpacity>

          <Text style={styles.footnote}>
            Session ends into the 10:45 AM window: IGF-1 LR3, then 50 g fast carbs + 40 g whey
            immediately.
          </Text>
        </ScrollView>
      )}

      {!!rest && (
        <RestTimer
          key={rest.nonce}
          seconds={rest.seconds}
          exerciseName={rest.name}
          onDismiss={() => setRest(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  weekBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  weekBtnText: { color: colors.ink, fontWeight: '800', fontSize: 12 },
  hero: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  heroWeekday: {
    fontSize: 10.5,
    fontWeight: '900',
    color: colors.volt,
    letterSpacing: 1,
    marginBottom: 3,
  },
  heroTitle: { fontSize: 20, fontWeight: '900', color: colors.ink, letterSpacing: -0.6 },
  heroFocus: { fontSize: 12, color: colors.inkDim, marginTop: 3, fontWeight: '600' },
  heroTags: { flexDirection: 'row', gap: 6, marginTop: spacing.md },
  warmup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  warmupText: { flex: 1, fontSize: 13, color: colors.inkDim, fontWeight: '700' },
  finish: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.volt,
    borderRadius: radius.pill,
    paddingVertical: 14,
    marginTop: spacing.sm,
  },
  finishDone: { backgroundColor: colors.voltDim },
  finishText: { color: colors.bg, fontWeight: '900', fontSize: 15 },
  footnote: {
    fontSize: 11,
    color: colors.inkFaint,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 16,
  },
  restCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  restTitle: { fontSize: 18, fontWeight: '900', color: colors.ink },
  restBody: { fontSize: 13, color: colors.inkDim, textAlign: 'center', lineHeight: 19 },
  nextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.volt,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  nextText: { flex: 1 },
  nextLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(11,13,12,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  nextTitle: { fontSize: 17, fontWeight: '900', color: colors.bg, letterSpacing: -0.4, marginTop: 2 },
  nextMeta: { fontSize: 11, fontWeight: '700', color: 'rgba(11,13,12,0.7)', marginTop: 3 },
  splitIntro: { fontSize: 12, color: colors.inkDim, fontWeight: '700', marginBottom: spacing.md },
  weekCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  weekCardRest: { backgroundColor: colors.bgAlt },
  weekHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  weekDay: { fontSize: 11, fontWeight: '900', color: colors.volt, letterSpacing: 0.8 },
  weekTitle: { flex: 1, fontSize: 14, fontWeight: '800', color: colors.ink },
  weekTitleRest: { color: colors.inkDim },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 3 },
  weekEx: { flex: 1, fontSize: 12.5, color: colors.inkDim, fontWeight: '600' },
  weekSets: { fontSize: 12, color: colors.inkFaint, fontWeight: '800' },
  weekRestText: { fontSize: 12.5, color: colors.inkFaint, fontWeight: '600', lineHeight: 18 },
});
