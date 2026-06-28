import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/theme';
import { TabBar, TabKey } from '@/components/TabBar';
import { HomeScreen } from '@/screens/HomeScreen';
import { SwapScreen } from '@/screens/SwapScreen';
import { ActivityScreen } from '@/screens/ActivityScreen';
import { CollectiblesScreen } from '@/screens/CollectiblesScreen';
import { TokenDetailScreen } from '@/screens/TokenDetailScreen';

/**
 * Lightweight, dependency-free navigator. A bottom tab switches the main
 * surface; selecting a token pushes a full-screen detail view on top.
 */
export function RootNavigator() {
  const [tab, setTab] = useState<TabKey>('home');
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  const goSwap = () => {
    setSelectedToken(null);
    setTab('swap');
  };

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        {tab === 'home' && (
          <HomeScreen onSelectToken={setSelectedToken} onSwap={goSwap} />
        )}
        {tab === 'swap' && <SwapScreen />}
        {tab === 'collectibles' && <CollectiblesScreen />}
        {tab === 'activity' && <ActivityScreen />}
      </View>

      <TabBar active={tab} onChange={(k) => { setSelectedToken(null); setTab(k); }} />

      {/* Detail overlay */}
      {selectedToken && (
        <View style={StyleSheet.absoluteFill}>
          <TokenDetailScreen
            symbol={selectedToken}
            onBack={() => setSelectedToken(null)}
            onSwap={goSwap}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1 },
});
