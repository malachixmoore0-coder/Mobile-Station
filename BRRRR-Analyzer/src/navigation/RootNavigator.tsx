import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/theme';
import { useSettings } from '@/context/SettingsContext';
import { BottomTabBar, TabKey } from '@/components/BottomTabBar';
import { DiscoverScreen } from '@/screens/DiscoverScreen';
import { SavedScreen } from '@/screens/SavedScreen';
import { ContractorsScreen } from '@/screens/ContractorsScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { PropertyDetailScreen } from '@/screens/PropertyDetailScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';

export function RootNavigator() {
  const { preferences, loaded } = useSettings();
  const [tab, setTab] = useState<TabKey>('discover');
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  if (!loaded) {
    return <View style={styles.root} />;
  }

  if (!preferences.onboarded) {
    return <OnboardingScreen onDone={() => {}} />;
  }

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        {tab === 'discover' && <DiscoverScreen onSelectProperty={setSelectedProperty} />}
        {tab === 'saved' && <SavedScreen onSelectProperty={setSelectedProperty} />}
        {tab === 'contractors' && <ContractorsScreen />}
        {tab === 'settings' && <SettingsScreen />}
      </View>

      <BottomTabBar active={tab} onChange={setTab} />

      {selectedProperty && (
        <View style={StyleSheet.absoluteFill}>
          <PropertyDetailScreen propertyId={selectedProperty} onBack={() => setSelectedProperty(null)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1 },
});
