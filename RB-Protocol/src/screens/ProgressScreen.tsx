import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ProgressRing } from '@/components/ProgressRing';
import { useLog } from '@/context/LogContext';
import { checkableIds, isTrainingDay, scheduleFor, DAY_NAMES } from '@/data/schedule';
import { addDays, dateKey, dayIndex, prettyDate } from '@/utils/date';

/** Adherence at or above this counts the day as held. */
const HELD = 0.8;

export function ProgressScreen() {
  const {
    activeDate,
    setActiveDate,
    completionOn,
    logFor,
    bodyWeight,
    setBodyWeight,
    weightHistory,
    notes,
    setNotes,
    resetDay,
    clearAll,
  } = useLog();
  const [weightDraft, setWeightDraft] = useState(bodyWeight ?? '');

  const today = new Date();

  /** Adherence for the last 14 days, oldest first. */
  const history = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = addDays(today, i - 13);
      const ids = checkableIds(scheduleFor(dayIndex(d)));
      return {
        date: d,
        key: dateKey(d),
        pct: completionOn(dateKey(d), ids),
        training: isTrainingDay(dayIndex(d)),
      };
    });
    // `today` is recreated each render but only its calendar day matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completionOn]);

  const streak = useMemo(() => {
    let n = 0;
    for (let back = 0; back < 120; back++) {
      const d = addDays(today, -back);
      const pct = completionOn(dateKey(d), checkableIds(scheduleFor(dayIndex(d))));
      // Today only breaks the streak once it's actually over.
      if (pct >= HELD) n++;
      else if (back > 0) break;
    }
    return n;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completionOn]);

  const last7 = history.slice(-7);
  const weekAvg = last7.reduce((a, d) => a + d.pct, 0) / last7.length;
  const sessionsThisWeek = last7.filter((d) => d.training && logFor(d.key).done.includes('gym-session')).length;
  const pinsThisWeek = last7.filter((d) => logFor(d.key).done.includes('pep-ghk')).length;

  const confirm = (title: string, message: string, onYes: () => void) => {
    if (Platform.OS === 'web') {
      // Alert.alert is a no-op on react-native-web.
      // eslint-disable-next-line no-alert
      if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) onYes();
      return;
    }
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Do it', style: 'destructive', onPress: onYes },
    ]);
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title="Progress" subtitle="Consistency is the whole protocol" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroRow}>
          <ProgressRing progress={weekAvg} label={`${Math.round(weekAvg * 100)}%`} caption="7-day" />
          <View style={styles.heroStats}>
            <Stat value={`${streak}`} label={streak === 1 ? 'day streak' : 'day streak'} />
            <Stat value={`${sessionsThisWeek}/4`} label="sessions this week" />
            <Stat value={`${pinsThisWeek}/7`} label="morning pins" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Last 14 days</Text>
          <View style={styles.bars}>
            {history.map((d) => {
              const isToday = d.key === dateKey(today);
              return (
                <TouchableOpacity
                  key={d.key}
                  style={styles.barCol}
                  activeOpacity={0.7}
                  onPress={() => setActiveDate(d.date)}
                >
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${Math.max(3, d.pct * 100)}%`,
                          backgroundColor: d.pct >= HELD ? colors.volt : d.training ? colors.voltDim : colors.move,
                          opacity: d.pct === 0 ? 0.25 : 1,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barDay, isToday && styles.barDayToday]}>
                    {DAY_NAMES[d.date.getDay()][0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.cardFoot}>Tap a bar to open that day.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Body weight — {prettyDate(activeDate)}</Text>
          <View style={styles.weightRow}>
            <TextInput
              style={styles.weightInput}
              value={weightDraft}
              onChangeText={setWeightDraft}
              onBlur={() => setBodyWeight(weightDraft)}
              placeholder="lb"
              placeholderTextColor={colors.inkFaint}
              keyboardType="numeric"
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.saveBtn}
              activeOpacity={0.85}
              onPress={() => setBodyWeight(weightDraft)}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
          {weightHistory.slice(0, 5).map((w) => (
            <View key={w.key} style={styles.weightHistoryRow}>
              <Text style={styles.weightDate}>{w.key}</Text>
              <Text style={styles.weightValue}>{w.weight} lb</Text>
            </View>
          ))}
          {weightHistory.length === 0 && (
            <Text style={styles.empty}>No weigh-ins yet. Same scale, same time, after the morning pin.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notes — {prettyDate(activeDate)}</Text>
          <TextInput
            style={styles.notes}
            value={notes}
            onChangeText={setNotes}
            placeholder="Sleep, joints, injection site reaction, energy on the shift..."
            placeholderTextColor={colors.inkFaint}
            multiline
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Data</Text>
          <TouchableOpacity
            style={styles.dangerRow}
            activeOpacity={0.7}
            onPress={() =>
              confirm('Reset this day?', 'Clears every check, set and site logged for the day you are viewing.', resetDay)
            }
          >
            <Ionicons name="refresh-outline" size={16} color={colors.inkDim} />
            <Text style={styles.dangerText}>Reset {prettyDate(activeDate).toLowerCase()}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dangerRow}
            activeOpacity={0.7}
            onPress={() => confirm('Erase all history?', 'Every day, every set, every dose. Cannot be undone.', clearAll)}
          >
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
            <Text style={[styles.dangerText, { color: colors.danger }]}>Erase all history</Text>
          </TouchableOpacity>
          <Text style={styles.storageNote}>
            Everything stays on this device — no account, no server, nothing leaves the phone.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  heroStats: { flex: 1, gap: spacing.md },
  stat: {},
  statValue: { fontSize: 19, fontWeight: '900', color: colors.ink, letterSpacing: -0.5 },
  statLabel: { fontSize: 10.5, color: colors.inkFaint, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardTitle: { fontSize: 13, fontWeight: '900', color: colors.ink, marginBottom: spacing.md },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 96 },
  barCol: { flex: 1, alignItems: 'center', gap: 5 },
  barTrack: {
    width: '100%',
    height: 76,
    backgroundColor: colors.bgAlt,
    borderRadius: 5,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: 5 },
  barDay: { fontSize: 9, fontWeight: '800', color: colors.inkFaint },
  barDayToday: { color: colors.volt },
  cardFoot: { fontSize: 10.5, color: colors.inkFaint, marginTop: spacing.sm, fontWeight: '600' },
  weightRow: { flexDirection: 'row', gap: spacing.sm },
  weightInput: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.bgAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  saveBtn: {
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    backgroundColor: colors.volt,
    borderRadius: radius.sm,
  },
  saveBtnText: { color: colors.bg, fontWeight: '900', fontSize: 13 },
  weightHistoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    marginTop: spacing.sm,
  },
  weightDate: { fontSize: 12, color: colors.inkFaint, fontWeight: '700' },
  weightValue: { fontSize: 12.5, color: colors.ink, fontWeight: '800' },
  empty: { fontSize: 11.5, color: colors.inkFaint, marginTop: spacing.sm, lineHeight: 17 },
  notes: {
    backgroundColor: colors.bgAlt,
    borderRadius: radius.sm,
    padding: spacing.md,
    minHeight: 92,
    color: colors.ink,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  dangerText: { fontSize: 13, fontWeight: '700', color: colors.inkDim },
  storageNote: { fontSize: 10.5, color: colors.inkFaint, marginTop: spacing.md, lineHeight: 16 },
});
