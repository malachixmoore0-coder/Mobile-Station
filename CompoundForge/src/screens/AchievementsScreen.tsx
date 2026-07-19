import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/theme';
import { useAppState } from '@/context/AppStateContext';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { ACHIEVEMENTS } from '@/data/achievements';

export function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const { unlockedAchievements } = useAppState();
  const unlockedCount = ACHIEVEMENTS.filter((a) => !!unlockedAchievements[a.id]).length;

  return (
    <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.lg, paddingBottom: 140 }]}>
      <Text style={styles.title}>Achievements</Text>
      <Text style={styles.subtitle}>
        {unlockedCount} / {ACHIEVEMENTS.length} unlocked
      </Text>
      <View style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
        <ProgressBar progress={unlockedCount / ACHIEVEMENTS.length} colors={['#8B5CF6', '#33D6FF']} />
      </View>

      <View style={styles.grid}>
        {ACHIEVEMENTS.map((a) => {
          const unlockedAt = unlockedAchievements[a.id];
          const unlocked = !!unlockedAt;
          return (
            <Card key={a.id} style={styles.badge} glow={unlocked ? colors.goldGlow : undefined}>
              <View style={[styles.iconWrap, unlocked && styles.iconWrapUnlocked]}>
                <Text style={[styles.icon, !unlocked && styles.iconLocked]}>{unlocked ? a.icon : '🔒'}</Text>
              </View>
              <Text style={[styles.badgeTitle, !unlocked && styles.dim]}>{a.title}</Text>
              <Text style={[styles.badgeDesc, !unlocked && styles.dim]}>{a.description}</Text>
              {unlocked && (
                <Text style={styles.unlockedDate}>{new Date(unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
              )}
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg },
  title: { color: colors.ink, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.inkFaint, fontSize: 12, marginTop: 4, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  badge: { width: '47%', alignItems: 'center', paddingVertical: spacing.lg },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconWrapUnlocked: { backgroundColor: colors.goldSoft },
  icon: { fontSize: 24 },
  iconLocked: { opacity: 0.5 },
  badgeTitle: { color: colors.ink, fontWeight: '800', fontSize: 13, textAlign: 'center' },
  badgeDesc: { color: colors.inkFaint, fontSize: 10, textAlign: 'center', marginTop: 3, lineHeight: 14 },
  dim: { opacity: 0.55 },
  unlockedDate: { color: colors.gold, fontSize: 10, fontWeight: '700', marginTop: spacing.sm },
});
