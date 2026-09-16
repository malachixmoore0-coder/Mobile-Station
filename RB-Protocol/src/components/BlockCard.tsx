import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, kindStyle, radius, spacing } from '@/theme';
import { Block } from '@/types';
import { clock, relativeToNow } from '@/utils/date';
import { useLog } from '@/context/LogContext';
import { CheckRow } from '@/components/CheckRow';
import { SitePicker } from '@/components/SitePicker';
import { macrosFor } from '@/utils/nutrition';

interface Props {
  block: Block;
  /** Minutes from midnight, or null when viewing a day that isn't today. */
  nowMinutes: number | null;
  isNext?: boolean;
  onOpenWorkout?: () => void;
}

export function BlockCard({ block, nowMinutes, isNext, onOpenWorkout }: Props) {
  const { isDone, toggle, setMany } = useLog();
  const [showWhy, setShowWhy] = useState(false);
  const style = kindStyle(block.kind);

  const ids = block.items.map((i) => i.id);
  const doneCount = ids.filter(isDone).length;
  const complete = doneCount === ids.length && ids.length > 0;
  const past = nowMinutes !== null && nowMinutes > block.time && !complete;
  const macros = macrosFor(block.id);

  return (
    <View style={styles.row}>
      {/* Time rail */}
      <View style={styles.rail}>
        <Text style={[styles.time, isNext && styles.timeNext]}>{clock(block.time)}</Text>
        <View style={[styles.dot, { backgroundColor: complete ? style.color : colors.border }]} />
        <View style={styles.line} />
      </View>

      <View
        style={[
          styles.card,
          isNext && { borderColor: style.color, backgroundColor: colors.cardAlt },
          complete && styles.cardDone,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setMany(ids, !complete)}
          style={styles.header}
        >
          <View style={[styles.iconWrap, { backgroundColor: style.soft }]}>
            <Ionicons name={style.icon as any} size={16} color={style.color} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, complete && styles.titleDone]}>{block.title}</Text>
            <View style={styles.metaRow}>
              {isNext && nowMinutes !== null && (
                <Text style={[styles.meta, { color: style.color }]}>
                  {relativeToNow(block.time, nowMinutes)}
                </Text>
              )}
              {past && !isNext && <Text style={[styles.meta, styles.metaPast]}>missed</Text>}
              {!!macros && (
                <Text style={styles.meta}>
                  {macros.kcal} kcal · {macros.protein}p / {macros.carbs}c / {macros.fat}f
                </Text>
              )}
              {ids.length > 1 && (
                <Text style={styles.meta}>
                  {doneCount}/{ids.length}
                </Text>
              )}
            </View>
          </View>
          <Ionicons
            name={complete ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={complete ? style.color : colors.border}
          />
        </TouchableOpacity>

        <View style={styles.items}>
          {block.items.map((item) => (
            <CheckRow
              key={item.id}
              label={item.label}
              detail={item.detail}
              note={item.note}
              done={isDone(item.id)}
              color={style.color}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </View>

        {!!block.recoveryNote && (
          <View style={styles.noteBanner}>
            <Ionicons name="information-circle" size={13} color={colors.inkDim} />
            <Text style={styles.noteBannerText}>{block.recoveryNote}</Text>
          </View>
        )}

        {block.kind === 'injection' && <SitePicker syringeId={block.id} />}

        {block.id === 'gym' && !!onOpenWorkout && (
          <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={onOpenWorkout}>
            <Ionicons name="barbell" size={15} color={colors.bg} />
            <Text style={styles.ctaText}>Open today's session</Text>
          </TouchableOpacity>
        )}

        {!!block.pairing && (
          <TouchableOpacity
            style={styles.whyToggle}
            activeOpacity={0.7}
            onPress={() => setShowWhy((s) => !s)}
          >
            <Text style={[styles.whyLabel, { color: style.color }]}>
              {showWhy ? 'Hide why' : 'Why this, here'}
            </Text>
            <Ionicons name={showWhy ? 'chevron-up' : 'chevron-down'} size={12} color={style.color} />
          </TouchableOpacity>
        )}
        {showWhy && !!block.pairing && <Text style={styles.why}>{block.pairing}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  rail: { width: 62, alignItems: 'center', paddingTop: 2 },
  time: { fontSize: 11, fontWeight: '800', color: colors.inkFaint },
  timeNext: { color: colors.ink },
  dot: { width: 9, height: 9, borderRadius: 5, marginTop: 6 },
  line: { flex: 1, width: 1, backgroundColor: colors.divider, marginTop: 4 },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardDone: { opacity: 0.62 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: { width: 32, height: 32, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  title: { fontSize: 15, fontWeight: '800', color: colors.ink, letterSpacing: -0.2 },
  titleDone: { color: colors.inkDim },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2, flexWrap: 'wrap' },
  meta: { fontSize: 11, color: colors.inkFaint, fontWeight: '700' },
  metaPast: { color: colors.danger },
  items: { marginTop: spacing.sm },
  noteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bgAlt,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  noteBannerText: { flex: 1, fontSize: 11, color: colors.inkDim, fontWeight: '600' },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.volt,
    borderRadius: radius.pill,
    paddingVertical: 10,
    marginTop: spacing.md,
  },
  ctaText: { color: colors.bg, fontWeight: '900', fontSize: 13 },
  whyToggle: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.md },
  whyLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  why: { fontSize: 12, lineHeight: 18, color: colors.inkDim, marginTop: 6 },
});
