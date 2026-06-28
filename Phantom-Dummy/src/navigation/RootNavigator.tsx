import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/theme';
import { TabBar, TabKey } from '@/components/TabBar';
import { HomeScreen } from '@/screens/HomeScreen';
import { SwapScreen } from '@/screens/SwapScreen';
import { ExploreScreen } from '@/screens/ExploreScreen';
import { ActivityScreen } from '@/screens/ActivityScreen';
import { CollectiblesScreen } from '@/screens/CollectiblesScreen';
import { TokenDetailScreen } from '@/screens/TokenDetailScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { SendScreen } from '@/screens/SendScreen';

interface Props {
  onLock: () => void;
}

/**
 * Lightweight, dependency-free navigator. A bottom tab switches the main
 * surface; token detail, settings and send are pushed as full-screen overlays.
 */
export function RootNavigator({ onLock }: Props) {
  const [tab, setTab] = useState<TabKey>('home');
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [sendSymbol, setSendSymbol] = useState<string | null>(null);

  const clearOverlays = () => {
    setSelectedToken(null);
    setShowSettings(false);
    setSendSymbol(null);
  };

  const goSwap = () => {
    clearOverlays();
    setTab('swap');
  };

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        {tab === 'home' && (
          <HomeScreen
            onSelectToken={setSelectedToken}
            onSwap={goSwap}
            onOpenSettings={() => setShowSettings(true)}
            onSend={() => setSendSymbol('SOL')}
          />
        )}
        {tab === 'swap' && <SwapScreen />}
        {tab === 'explore' && <ExploreScreen onSelectToken={setSelectedToken} />}
        {tab === 'collectibles' && <CollectiblesScreen />}
        {tab === 'activity' && <ActivityScreen />}
      </View>

      <TabBar active={tab} onChange={(k) => { clearOverlays(); setTab(k); }} />

      {/* Detail overlay */}
      {selectedToken && (
        <View style={StyleSheet.absoluteFill}>
          <TokenDetailScreen
            symbol={selectedToken}
            onBack={() => setSelectedToken(null)}
            onSwap={goSwap}
            onSend={(sym) => { setSelectedToken(null); setSendSymbol(sym); }}
          />
        </View>
      )}

      {/* Send overlay */}
      {sendSymbol && (
        <View style={StyleSheet.absoluteFill}>
          <SendScreen initialSymbol={sendSymbol} onClose={() => setSendSymbol(null)} />
        </View>
      )}

      {/* Settings overlay */}
      {showSettings && (
        <View style={StyleSheet.absoluteFill}>
          <SettingsScreen
            onClose={() => setShowSettings(false)}
            onLock={() => { setShowSettings(false); onLock(); }}
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
