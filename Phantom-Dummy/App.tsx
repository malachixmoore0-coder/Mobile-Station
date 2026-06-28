import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WalletProvider } from './src/context/WalletContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <WalletProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </WalletProvider>
    </SafeAreaProvider>
  );
}
