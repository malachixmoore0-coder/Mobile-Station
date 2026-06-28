import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WalletProvider } from './src/context/WalletContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { LockScreen } from './src/screens/LockScreen';

export default function App() {
  const [locked, setLocked] = useState(true);

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <WalletProvider>
          <StatusBar style="light" />
          <RootNavigator onLock={() => setLocked(true)} />
          {locked && <LockScreen onUnlock={() => setLocked(false)} />}
        </WalletProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
