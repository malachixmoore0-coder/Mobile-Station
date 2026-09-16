import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';
import { Exercise } from '@/types';
import { useLog } from '@/context/LogContext';
import { mmss } from '@/utils/date';
import { Tag } from '@/components/Tag';

interface Props {
  exercise: Exercise;
  index: number;
  /** Same exercise logged on the most recent day it appeared, for a target. */
  lastTime?: { weight: string; reps: string }[];
  onSetLogged: (exercise: Exercise) => void;
}

/** One exercise with a weight x reps grid for every prescribed set. */
export function ExerciseCard({ exercise, index, lastTime, onSetLogged }: Props) {
  const { getSets, updateSet, isDone, toggle } = useLog();
  const sets = getSets(exercise.id);
  const complete = isDone(exercise.id);

  const filled = (i: number) => !!sets[i]?.weight || !!sets[i]?.reps;
  const filledCount = Array.from({ length: exercise.sets }, (_, i) => i).filter(filled).length;

  return (
    <View style={[styles.card, complete && styles.cardDone]}>
      <View style={styles.header}>
        <Text style={styles.index}>{`${index + 1}`.padStart(2, '0')}</Text>
        <View style={styles.headText}>
          <Text style={styles.name}>{exercise.name}</Text>
          {!!exercise.supersetWith && (
            <Text style={styles.superset}>superset w/ {exercise.supersetWith}</Text>
          )}
          <View style={styles.tagRow}>
            <Tag label={`${exercise.sets} x ${exercise.reps}`} />
            {!!exercise.cue && <Tag label={exercise.cue} color={colors.inkDim} soft={colors.cardAlt} />}
          </View>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={() => toggle(exercise.id)}>
          <Ionicons
            name={complete ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={complete ? colors.volt : colors.border}
          />
        </TouchableOpacity>
      </View>

      {!!lastTime?.length && (
        <Text style={styles.last}>
          Last: {lastTime.filter((s) => s.weight || s.reps).map((s) => `${s.weight || '-'}x${s.reps || '-'}`).join('  ')}
        </Text>
      )}

      <View style={styles.grid}>
        {Array.from({ length: exercise.sets }, (_, i) => (
          <View key={i} style={[styles.setRow, filled(i) && styles.setRowFilled]}>
            <Text style={styles.setLabel}>{i + 1}</Text>
            <TextInput
              style={styles.input}
              value={sets[i]?.weight ?? ''}
              onChangeText={(t) => updateSet(exercise.id, i, { weight: t })}
              placeholder="lb"
              placeholderTextColor={colors.inkFaint}
              keyboardType="numeric"
              returnKeyType="done"
            />
            <Text style={styles.times}>x</Text>
            <TextInput
              style={styles.input}
              value={sets[i]?.reps ?? ''}
              onChangeText={(t) => updateSet(exercise.id, i, { reps: t })}
              placeholder={exercise.reps}
              placeholderTextColor={colors.inkFaint}
              keyboardType="numeric"
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.restBtn}
              activeOpacity={0.8}
              onPress={() => onSetLogged(exercise)}
            >
              <Ionicons name="timer-outline" size={15} color={colors.hydration} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        {filledCount}/{exercise.sets} sets logged · {mmss(exercise.rest)} rest
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardDone: { borderColor: colors.voltDim },
  header: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  index: { fontSize: 12, fontWeight: '900', color: colors.inkFaint, marginTop: 2 },
  headText: { flex: 1 },
  name: { fontSize: 15, fontWeight: '800', color: colors.ink, letterSpacing: -0.2 },
  superset: { fontSize: 12, color: colors.inkDim, marginTop: 1, fontStyle: 'italic' },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  last: { fontSize: 11, color: colors.inkFaint, marginTop: spacing.sm, fontWeight: '600' },
  grid: { marginTop: spacing.md, gap: 6 },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  setRowFilled: { backgroundColor: colors.voltSoft },
  setLabel: { width: 14, fontSize: 12, fontWeight: '900', color: colors.inkFaint },
  input: {
    flex: 1,
    // Web inputs carry an intrinsic width that would otherwise push the row wide.
    minWidth: 0,
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
    paddingVertical: 6,
    textAlign: 'center',
  },
  times: { color: colors.inkFaint, fontSize: 12, fontWeight: '700' },
  restBtn: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.hydrationSoft,
  },
  footer: { fontSize: 11, color: colors.inkFaint, fontWeight: '700', marginTop: spacing.md },
});
