import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/theme';
import { useAppState } from '@/context/AppStateContext';
import { BottomTabBar, TabKey } from '@/components/BottomTabBar';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { LedgerScreen } from '@/screens/LedgerScreen';
import { MarketsScreen } from '@/screens/MarketsScreen';
import { AchievementsScreen } from '@/screens/AchievementsScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';

export function RootNavigator() {
  const { loaded, settings } = useAppState();
  const [tab, setTab] = useState<TabKey>('home');

  if (!loaded) {
    return <View style={styles.root} />;
  }

  if (!settings.onboarded) {
    return <OnboardingScreen />;
  }

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        {tab === 'home' && <DashboardScreen />}
        {tab === 'ledger' && <LedgerScreen />}
        {tab === 'markets' && <MarketsScreen />}
        {tab === 'achievements' && <AchievementsScreen />}
        {tab === 'profile' && <ProfileScreen />}
      </View>
      <BottomTabBar active={tab} onChange={setTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1 },
});
