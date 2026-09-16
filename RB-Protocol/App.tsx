import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogProvider } from '@/context/LogContext';
import { RootNavigator } from '@/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <LogProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </LogProvider>
    </SafeAreaProvider>
  );
}
