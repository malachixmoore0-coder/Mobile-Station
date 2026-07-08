import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider } from '@/context/SettingsContext';
import { PortfolioProvider } from '@/context/PortfolioContext';
import { RootNavigator } from '@/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <PortfolioProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </PortfolioProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
