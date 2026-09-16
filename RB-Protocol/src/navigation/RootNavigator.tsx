import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/theme';
import { BottomTabBar, TabKey } from '@/components/BottomTabBar';
import { TodayScreen } from '@/screens/TodayScreen';
import { TrainScreen } from '@/screens/TrainScreen';
import { FuelScreen } from '@/screens/FuelScreen';
import { StackScreen } from '@/screens/StackScreen';
import { ProgressScreen } from '@/screens/ProgressScreen';
import { useLog } from '@/context/LogContext';

export function RootNavigator() {
  const { loaded } = useLog();
  const [tab, setTab] = useState<TabKey>('today');

  if (!loaded) return <View style={styles.root} />;

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        {tab === 'today' && <TodayScreen onOpenWorkout={() => setTab('train')} />}
        {tab === 'train' && <TrainScreen />}
        {tab === 'fuel' && <FuelScreen />}
        {tab === 'stack' && <StackScreen />}
        {tab === 'progress' && <ProgressScreen />}
      </View>
      <BottomTabBar active={tab} onChange={setTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1 },
});
