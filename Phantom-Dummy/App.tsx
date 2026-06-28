import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WalletProvider } from './src/context/WalletContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { LockScreen } from './src/screens/LockScreen';

export default function App() {
  const [locked, setLocked] = useState(true);

  return (
    <SafeAreaProvider>
      <WalletProvider>
        <StatusBar style="light" />
        <RootNavigator />
        {locked && <LockScreen onUnlock={() => setLocked(false)} />}
      </WalletProvider>
    </SafeAreaProvider>
  );
}
