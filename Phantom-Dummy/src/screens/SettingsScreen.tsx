import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '@/theme';
import { useSettings } from '@/context/SettingsContext';
import { useWallet } from '@/context/WalletContext';
import { ACCOUNTS, CURRENCIES, NETWORKS } from '@/data/portfolio';
import { formatUsd, shortAddress } from '@/utils/format';
import { BottomSheet } from '@/components/BottomSheet';

interface Props {
  onClose: () => void;
  onLock: () => void;
}

export function SettingsScreen({ onClose, onLock }: Props) {
  const s = useSettings();
  const { resetWallet } = useWallet();
  const [picker, setPicker] = useState<null | 'currency' | 'network'>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={onClose} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Settings</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Accounts */}
        <Text style={styles.section}>Accounts</Text>
        <View style={styles.card}>
          {ACCOUNTS.map((a, i) => {
            const active = a.id === s.account.id;
            return (
              <TouchableOpacity
                key={a.id}
                style={[styles.accountRow, i < ACCOUNTS.length - 1 && styles.border]}
                activeOpacity={0.7}
                onPress={() => s.setAccountId(a.id)}
              >
                <Text style={styles.accAvatar}>{a.avatar}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.accName}>{a.name}</Text>
                  <Text style={styles.accAddr}>{shortAddress(a.address)}</Text>
                </View>
                <Text style={styles.accTotal}>{s.hideBalances ? '••••' : formatUsd(a.total, { compact: true })}</Text>
                {active && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.addRow} activeOpacity={0.7}>
            <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
            <Text style={styles.addText}>Add / Connect wallet</Text>
          </TouchableOpacity>
        </View>

        {/* Security */}
        <Text style={styles.section}>Security & Privacy</Text>
        <View style={styles.card}>
          <Row icon="scan" label="Face ID" border>
            <Switch
              value={s.faceIdEnabled}
              onValueChange={s.setFaceIdEnabled}
              trackColor={{ true: colors.accent, false: colors.border }}
              thumbColor={colors.white}
            />
          </Row>
          <Row icon="eye-off" label="Hide balances" border>
            <Switch
              value={s.hideBalances}
              onValueChange={s.toggleHideBalances}
              trackColor={{ true: colors.accent, false: colors.border }}
              thumbColor={colors.white}
            />
          </Row>
          <Row icon="key" label="Show secret recovery phrase">
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </Row>
        </View>

        {/* Preferences */}
        <Text style={styles.section}>Preferences</Text>
        <View style={styles.card}>
          <TouchableOpacity onPress={() => setPicker('currency')} activeOpacity={0.7}>
            <Row icon="cash" label="Currency" border>
              <Text style={styles.value}>{s.currency}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
            </Row>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPicker('network')} activeOpacity={0.7}>
            <Row icon="git-network" label="Default network" border>
              <Text style={styles.value}>{s.network}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
            </Row>
          </TouchableOpacity>
          <Row icon="flask" label="Testnet mode" border>
            <Switch
              value={s.testnetMode}
              onValueChange={s.setTestnetMode}
              trackColor={{ true: colors.accent, false: colors.border }}
              thumbColor={colors.white}
            />
          </Row>
          <Row icon="information-circle" label="Show demo labels">
            <Switch
              value={s.showDemoLabels}
              onValueChange={s.setShowDemoLabels}
              trackColor={{ true: colors.accent, false: colors.border }}
              thumbColor={colors.white}
            />
          </Row>
        </View>

        {/* About */}
        <Text style={styles.section}>About</Text>
        <View style={styles.card}>
          <Row icon="help-circle" label="Help & Support" border>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </Row>
          <Row icon="document-text" label="Terms of Service">
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </Row>
        </View>

        <Text style={styles.section}>Demo</Text>
        <View style={styles.card}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => setConfirmReset(true)}>
            <Row icon="refresh" label="Reset demo balances">
              <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
            </Row>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.lockBtn} activeOpacity={0.8} onPress={onLock}>
          <Ionicons name="lock-closed" size={18} color={colors.accent} />
          <Text style={styles.lockText}>Lock wallet</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Phantom · Demo build v1.0.0 · simulated wallet</Text>
      </ScrollView>

      {/* Reset confirmation */}
      <BottomSheet visible={confirmReset} title="Reset demo balances?" onClose={() => setConfirmReset(false)}>
        <Text style={styles.resetText}>
          This restores the starting holdings and cash, undoing any buys, sells and bank transfers.
        </Text>
        <TouchableOpacity
          style={styles.resetBtn}
          activeOpacity={0.85}
          onPress={() => { resetWallet(); setConfirmReset(false); }}
        >
          <Text style={styles.resetBtnText}>Reset balances</Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* Pickers */}
      <BottomSheet visible={picker === 'currency'} title="Currency" onClose={() => setPicker(null)}>
        {CURRENCIES.map((c) => (
          <TouchableOpacity key={c} style={styles.pickRow} activeOpacity={0.7} onPress={() => { s.setCurrency(c); setPicker(null); }}>
            <Text style={styles.pickText}>{c}</Text>
            {c === s.currency && <Ionicons name="checkmark" size={20} color={colors.accent} />}
          </TouchableOpacity>
        ))}
      </BottomSheet>
      <BottomSheet visible={picker === 'network'} title="Default network" onClose={() => setPicker(null)}>
        {NETWORKS.map((n) => (
          <TouchableOpacity key={n} style={styles.pickRow} activeOpacity={0.7} onPress={() => { s.setNetwork(n); setPicker(null); }}>
            <Text style={styles.pickText}>{n}</Text>
            {n === s.network && <Ionicons name="checkmark" size={20} color={colors.accent} />}
          </TouchableOpacity>
        ))}
      </BottomSheet>
    </SafeAreaView>
  );
}

function Row({
  icon,
  label,
  border,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  border?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.row, border && styles.border]}>
      <Ionicons name={icon} size={20} color={colors.textDim} />
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  navTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  scroll: { paddingBottom: 32 },
  section: {
    color: colors.textFaint,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.bgElevated,
    marginHorizontal: spacing.lg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 15 },
  border: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { color: colors.text, fontSize: 15, flex: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  value: { color: colors.textDim, fontSize: 15 },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 14 },
  accAvatar: {
    fontSize: 18,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.cardAlt,
    textAlign: 'center',
    lineHeight: 38,
  },
  accName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  accAddr: { color: colors.textDim, fontSize: 13 },
  accTotal: { color: colors.textDim, fontSize: 14, fontWeight: '600' },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 16 },
  addText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
  lockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: 15,
    borderRadius: radius.pill,
    backgroundColor: colors.accent + '1F',
  },
  lockText: { color: colors.accent, fontSize: 15, fontWeight: '700' },
  version: { color: colors.textFaint, fontSize: 12, textAlign: 'center', marginTop: spacing.lg },
  pickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  pickText: { color: colors.text, fontSize: 16 },
  resetText: { color: colors.textDim, fontSize: 14, lineHeight: 20, marginBottom: spacing.lg },
  resetBtn: { backgroundColor: colors.down + '22', borderRadius: radius.pill, paddingVertical: 15, alignItems: 'center' },
  resetBtnText: { color: colors.down, fontSize: 16, fontWeight: '700' },
});
