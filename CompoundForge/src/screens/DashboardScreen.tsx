import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/theme';
import { useAppState } from '@/context/AppStateContext';
import { GrowthCrystal } from '@/components/GrowthCrystal';
import { GrowthChart, ChartPoint } from '@/components/GrowthChart';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LogTradeModal } from '@/components/LogTradeModal';
import { EditBalanceModal } from '@/components/EditBalanceModal';
import { getLatest, projectForward } from '@/engine/compound';
import { formatCurrency, formatPercent, formatSigned } from '@/utils/format';
import { daysBetween, toISODate } from '@/utils/dates';

export function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { settings, ledger, goals, balance, tier, nextTier, tierProgress, streak, winRate, recentlyUnlocked, clearRecentlyUnlocked } =
    useAppState();

  const [logVisible, setLogVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [burstToken, setBurstToken] = useState(0);
  const [levelUpToken, setLevelUpToken] = useState(0);
  const [chartWidth, setChartWidth] = useState(0);

  const scrollRef = useRef(0);
  const prevTierId = useRef(tier.id);
  const toastAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (prevTierId.current !== tier.id) {
      prevTierId.current = tier.id;
      setLevelUpToken((v) => v + 1);
    }
  }, [tier.id]);

  useEffect(() => {
    if (recentlyUnlocked.length === 0) return;
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2600),
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => clearRecentlyUnlocked());
  }, [recentlyUnlocked, toastAnim, clearRecentlyUnlocked]);

  const latest = useMemo(() => getLatest(ledger, settings), [ledger, settings]);

  const historyPoints: ChartPoint[] = useMemo(() => {
    const base: ChartPoint = { x: 0, balance: settings.startingBalance };
    const pts = ledger.map((e) => ({ x: e.day, balance: e.endBalance }));
    return [base, ...pts];
  }, [ledger, settings.startingBalance]);

  const projectionPoints: ChartPoint[] = useMemo(() => {
    const proj = projectForward(balance, settings.dailyTargetRate, settings.weekendsActive, latest.date, 14);
    const lastDay = historyPoints[historyPoints.length - 1]?.x ?? 0;
    return proj.slice(1).map((p, i) => ({ x: lastDay + i + 1, balance: p.balance }));
  }, [balance, settings, latest.date, historyPoints]);

  const goalTarget = useMemo(() => {
    const active = goals.filter((g) => !g.achievedAt && g.targetAmount > balance).sort((a, b) => a.targetAmount - b.targetAmount);
    if (active.length > 0) return active[0].targetAmount;
    return nextTier?.min ?? undefined;
  }, [goals, balance, nextTier]);

  const lastEntry = ledger[ledger.length - 1];
  const daysActive = daysBetween(settings.startDate, toISODate(new Date()));

  const toastItem = recentlyUnlocked[0];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.lg, paddingBottom: 140 }]}
        scrollEventThrottle={16}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          scrollRef.current = Math.max(0, Math.min(1, y / 220));
        }}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hey, {settings.username}</Text>
            <Text style={styles.tierName}>{tier.name} tier</Text>
          </View>
          <View style={styles.streakChip}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakValue}>{streak.current}</Text>
          </View>
        </View>

        <View style={styles.heroWrap}>
          <GrowthCrystal tier={tier} burstToken={burstToken} levelUpToken={levelUpToken} scrollRef={scrollRef} size={260} />
        </View>

        <View style={styles.balanceBlock}>
          <Text style={styles.balance}>{formatCurrency(balance)}</Text>
          {lastEntry && (
            <Text style={[styles.delta, { color: lastEntry.earnings >= 0 ? colors.mint : colors.rose }]}>
              {formatSigned(lastEntry.earnings)} last entry
            </Text>
          )}
        </View>

        {nextTier && (
          <Card style={{ marginTop: spacing.lg }}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Next: {nextTier.name}</Text>
              <Text style={styles.progressValue}>{formatCurrency(Math.max(0, nextTier.min - balance))} to go</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${tierProgress * 100}%`, backgroundColor: tier.color }]} />
            </View>
          </Card>
        )}

        <View style={styles.actionRow}>
          <View style={{ flex: 1 }}>
            <PrimaryButton label="Log Trade" onPress={() => setLogVisible(true)} />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="Edit Balance"
              onPress={() => setEditVisible(true)}
              colors={['#262B3B', '#1D2130']}
              textColor={colors.ink}
            />
          </View>
        </View>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{streak.best}</Text>
            <Text style={styles.statLabel}>Best streak</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{formatPercent(winRate, 0)}</Text>
            <Text style={styles.statLabel}>Win rate</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{ledger.filter((e) => e.kind === 'trade').length}</Text>
            <Text style={styles.statLabel}>Trades logged</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{daysActive}</Text>
            <Text style={styles.statLabel}>Days active</Text>
          </Card>
        </View>

        <Card style={{ marginTop: spacing.lg }}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Growth trajectory</Text>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: colors.mint }]} />
              <Text style={styles.legendLabel}>Actual</Text>
              <View style={[styles.legendDot, { backgroundColor: colors.violet, marginLeft: spacing.md }]} />
              <Text style={styles.legendLabel}>Projected</Text>
            </View>
          </View>
          <View onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}>
            {chartWidth > 0 && (
              <GrowthChart history={historyPoints} projection={projectionPoints} width={chartWidth} height={140} goal={goalTarget} />
            )}
          </View>
        </Card>
      </ScrollView>

      <LogTradeModal visible={logVisible} onClose={() => setLogVisible(false)} onLogged={() => setBurstToken((v) => v + 1)} />
      <EditBalanceModal visible={editVisible} onClose={() => setEditVisible(false)} onSaved={() => setBurstToken((v) => v + 1)} />

      {toastItem && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            {
              top: insets.top + 8,
              opacity: toastAnim,
              transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
            },
          ]}
        >
          <Text style={styles.toastIcon}>{toastItem.icon}</Text>
          <View>
            <Text style={styles.toastTitle}>Achievement unlocked</Text>
            <Text style={styles.toastSubtitle}>{toastItem.title}</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { color: colors.inkDim, fontSize: 13, fontWeight: '600' },
  tierName: { color: colors.ink, fontSize: 22, fontWeight: '800', marginTop: 2 },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  streakEmoji: { fontSize: 14 },
  streakValue: { color: colors.ink, fontWeight: '800', fontSize: 14 },
  heroWrap: { alignItems: 'center', marginTop: spacing.md },
  balanceBlock: { alignItems: 'center', marginTop: spacing.sm },
  balance: { color: colors.ink, fontSize: 42, fontWeight: '800', letterSpacing: -1 },
  delta: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  progressLabel: { color: colors.ink, fontWeight: '700', fontSize: 13 },
  progressValue: { color: colors.inkFaint, fontSize: 12 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: colors.cardAlt, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  actionRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xl },
  statCard: { width: '47%', alignItems: 'center', paddingVertical: spacing.lg },
  statValue: { color: colors.ink, fontSize: 22, fontWeight: '800' },
  statLabel: { color: colors.inkFaint, fontSize: 11, marginTop: 4, fontWeight: '600' },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  chartTitle: { color: colors.ink, fontWeight: '700', fontSize: 14 },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 7, height: 7, borderRadius: 4, marginRight: 4 },
  legendLabel: { color: colors.inkFaint, fontSize: 10, fontWeight: '600' },
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  toastIcon: { fontSize: 26 },
  toastTitle: { color: colors.gold, fontSize: 11, fontWeight: '700' },
  toastSubtitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
});
