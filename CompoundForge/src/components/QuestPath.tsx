import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, radius, spacing } from '@/theme';
import { Goal } from '@/types';
import { formatCurrency } from '@/utils/format';

const NODE_SIZE = 64;
const ROW_HEIGHT = 128;

function pickIcon(target: number): string {
  if (target >= 100000) return '🌋';
  if (target >= 25000) return '🏔️';
  if (target >= 5000) return '🚀';
  if (target >= 1000) return '💎';
  if (target >= 250) return '⭐';
  return '🎯';
}

function QuestNode({ goal, balance, x, y, isNext, onDelete }: { goal: Goal; balance: number; x: number; y: number; isNext: boolean; onDelete: () => void }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isNext) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isNext, pulse]);

  const achieved = !!goal.achievedAt;
  const progress = Math.max(0, Math.min(1, balance / goal.targetAmount));

  return (
    <View style={[styles.nodeWrap, { left: x - NODE_SIZE / 2, top: y - NODE_SIZE / 2 }]}>
      <Animated.View
        style={[
          styles.node,
          achieved && styles.nodeAchieved,
          isNext && styles.nodeNext,
          { transform: [{ scale: isNext ? pulse : 1 }] },
        ]}
      >
        <Text style={styles.nodeIcon}>{achieved ? '🏁' : pickIcon(goal.targetAmount)}</Text>
        {achieved && <View style={styles.checkBadge}><Text style={styles.checkText}>✓</Text></View>}
      </Animated.View>
      <Pressable onLongPress={onDelete} style={styles.nodeLabelWrap}>
        <Text style={styles.nodeLabel} numberOfLines={1}>{goal.label}</Text>
        <Text style={[styles.nodeAmount, achieved && { color: colors.gold }]}>{formatCurrency(goal.targetAmount)}</Text>
        {!achieved && <Text style={styles.nodeProgress}>{Math.round(progress * 100)}% there</Text>}
      </Pressable>
    </View>
  );
}

export function QuestPath({ goals, balance, width, onDeleteGoal }: { goals: Goal[]; balance: number; width: number; onDeleteGoal: (id: string) => void }) {
  const sorted = [...goals].sort((a, b) => a.targetAmount - b.targetAmount);
  const height = Math.max(1, sorted.length) * ROW_HEIGHT;
  const leftX = width * 0.26;
  const rightX = width * 0.74;

  const points = sorted.map((g, i) => ({
    x: i % 2 === 0 ? leftX : rightX,
    y: i * ROW_HEIGHT + ROW_HEIGHT / 2,
  }));

  let pathD = '';
  points.forEach((p, i) => {
    if (i === 0) {
      pathD += `M${p.x},${p.y}`;
    } else {
      const prev = points[i - 1];
      const midY = (prev.y + p.y) / 2;
      pathD += ` C${prev.x},${midY} ${p.x},${midY} ${p.x},${p.y}`;
    }
  });

  const nextIndex = sorted.findIndex((g) => !g.achievedAt);

  if (sorted.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyIcon}>🗺️</Text>
        <Text style={styles.emptyTitle}>No quests yet</Text>
        <Text style={styles.emptySubtitle}>Add a goal below to start your quest path.</Text>
      </View>
    );
  }

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Path d={pathD} stroke={colors.border} strokeWidth={3} fill="none" strokeDasharray="2,10" strokeLinecap="round" />
      </Svg>
      {sorted.map((g, i) => (
        <QuestNode
          key={g.id}
          goal={g}
          balance={balance}
          x={points[i].x}
          y={points[i].y}
          isNext={i === nextIndex}
          onDelete={() => onDeleteGoal(g.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  nodeWrap: { position: 'absolute', width: NODE_SIZE, alignItems: 'center' },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    backgroundColor: colors.cardAlt,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeAchieved: {
    borderColor: colors.gold,
    backgroundColor: colors.goldSoft,
  },
  nodeNext: {
    borderColor: colors.mint,
    backgroundColor: colors.mintSoft,
  },
  nodeIcon: { fontSize: 26 },
  checkBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  checkText: { fontSize: 11, fontWeight: '800', color: colors.bg },
  nodeLabelWrap: { alignItems: 'center', marginTop: spacing.xs, width: 110, marginLeft: (NODE_SIZE - 110) / 2 },
  nodeLabel: { color: colors.ink, fontSize: 11, fontWeight: '700', textAlign: 'center' },
  nodeAmount: { color: colors.inkDim, fontSize: 11, fontWeight: '800', textAlign: 'center' },
  nodeProgress: { color: colors.inkFaint, fontSize: 9, textAlign: 'center', marginTop: 1 },
  emptyWrap: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyIcon: { fontSize: 34, marginBottom: spacing.sm },
  emptyTitle: { color: colors.ink, fontWeight: '800', fontSize: 15 },
  emptySubtitle: { color: colors.inkFaint, fontSize: 12, marginTop: 4, textAlign: 'center' },
});
