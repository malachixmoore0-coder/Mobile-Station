import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { TopTabs, TabKey } from '@/components/TopTabs';
import { SearchDock } from '@/components/SearchDock';
import { BottomSheet } from '@/components/BottomSheet';
import { useSettings } from '@/context/SettingsContext';
import { ACCOUNTS } from '@/data/portfolio';
import { formatUsd, shortAddress } from '@/utils/format';
import { HomeScreen } from '@/screens/HomeScreen';
import { TradeScreen } from '@/screens/TradeScreen';
import { PredictScreen } from '@/screens/PredictScreen';
import { ExploreScreen } from '@/screens/ExploreScreen';
import { TokenDetailScreen } from '@/screens/TokenDetailScreen';
import { SendScreen } from '@/screens/SendScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { BankTransferScreen } from '@/screens/BankTransferScreen';

interface Props {
  onLock: () => void;
}

export function RootNavigator({ onLock }: Props) {
  const { account, setAccountId, hideBalances } = useSettings();
  const [tab, setTab] = useState<TabKey>('home');
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [sendSymbol, setSendSymbol] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const [sheet, setSheet] = useState<null | 'accounts' | 'actions'>(null);

  const openToken = (s: string) => setSelectedToken(s);
  const goTrade = () => { setSelectedToken(null); setTab('trade'); };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSheet('accounts')} activeOpacity={0.8}>
            <Text style={styles.avatar}>{account.avatar}</Text>
          </TouchableOpacity>
          <TopTabs active={tab} onChange={setTab} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {tab === 'home' && (
          <HomeScreen
            onSelectToken={openToken}
            onOpenAccounts={() => setSheet('accounts')}
            onOpenCash={() => setShowBank(true)}
          />
        )}
        {tab === 'trade' && <TradeScreen onSelectToken={openToken} />}
        {tab === 'predict' && <PredictScreen />}
        {tab === 'explore' && <ExploreScreen onSelectToken={openToken} />}
      </View>

      <SearchDock onPlus={() => setSheet('actions')} />

      {/* Token detail overlay */}
      {selectedToken && (
        <View style={StyleSheet.absoluteFill}>
          <TokenDetailScreen
            symbol={selectedToken}
            onBack={() => setSelectedToken(null)}
            onSwap={goTrade}
            onSend={(s) => { setSelectedToken(null); setSendSymbol(s); }}
          />
        </View>
      )}

      {/* Send overlay */}
      {sendSymbol && (
        <View style={StyleSheet.absoluteFill}>
          <SendScreen initialSymbol={sendSymbol} onClose={() => setSendSymbol(null)} />
        </View>
      )}

      {/* Bank transfer overlay */}
      {showBank && (
        <View style={StyleSheet.absoluteFill}>
          <BankTransferScreen onClose={() => setShowBank(false)} />
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

      {/* Accounts sheet */}
      <BottomSheet visible={sheet === 'accounts'} title="Your Accounts" onClose={() => setSheet(null)}>
        {ACCOUNTS.map((a) => {
          const active = a.id === account.id;
          return (
            <TouchableOpacity
              key={a.id}
              style={styles.accRow}
              activeOpacity={0.75}
              onPress={() => { setAccountId(a.id); setSheet(null); }}
            >
              <Text style={styles.accAvatar}>{a.avatar}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.accName}>{a.name}</Text>
                <Text style={styles.accAddr}>{shortAddress(a.address)}</Text>
              </View>
              <Text style={styles.accTotal}>{hideBalances ? '••••' : formatUsd(a.total, { compact: true })}</Text>
              {active ? (
                <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
              ) : (
                <Ionicons name="ellipsis-horizontal" size={18} color={colors.textFaint} />
              )}
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={styles.accAdd} activeOpacity={0.75} onPress={() => setSheet(null)}>
          <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
          <Text style={styles.accAddText}>Add / Connect wallet</Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* Quick actions (the + button) */}
      <BottomSheet visible={sheet === 'actions'} title="Quick actions" onClose={() => setSheet(null)}>
        {[
          { icon: 'arrow-up' as const, label: 'Send', run: () => { setSheet(null); setSendSymbol('SOL'); } },
          { icon: 'arrow-down' as const, label: 'Receive', run: () => setSheet(null) },
          { icon: 'swap-horizontal' as const, label: 'Swap', run: () => { setSheet(null); goTrade(); } },
          { icon: 'card' as const, label: 'Buy', run: () => setSheet(null) },
          { icon: 'business' as const, label: 'Send to bank', run: () => { setSheet(null); setShowBank(true); } },
          { icon: 'settings-outline' as const, label: 'Settings', run: () => { setSheet(null); setShowSettings(true); } },
          { icon: 'lock-closed' as const, label: 'Lock wallet', run: () => { setSheet(null); onLock(); } },
        ].map((a) => (
          <TouchableOpacity key={a.label} style={styles.actRow} activeOpacity={0.75} onPress={a.run}>
            <View style={styles.actIcon}><Ionicons name={a.icon} size={20} color={colors.accent} /></View>
            <Text style={styles.actLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  headerSafe: { backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  avatar: {
    fontSize: 18,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.cardAlt,
    textAlign: 'center',
    lineHeight: 34,
    overflow: 'hidden',
  },
  content: { flex: 1 },
  accRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 12 },
  accAvatar: {
    fontSize: 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardAlt,
    textAlign: 'center',
    lineHeight: 40,
  },
  accName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  accAddr: { color: colors.textDim, fontSize: 13 },
  accTotal: { color: colors.textDim, fontSize: 14, fontWeight: '600' },
  accAdd: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 16 },
  accAddText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
  actRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 12 },
  actIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent + '1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actLabel: { color: colors.text, fontSize: 15, fontWeight: '600' },
});
