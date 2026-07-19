import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius, spacing } from '@/theme';
import { useAppState } from '@/context/AppStateContext';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QuestPath } from '@/components/QuestPath';
import { AddGoalModal } from '@/components/AddGoalModal';
import { formatCurrency, formatPercent } from '@/utils/format';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, updateProfile, ledger, goals, balance, tier, deleteGoal, resetAll } = useAppState();

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(settings.username);
  const [rateDraft, setRateDraft] = useState((settings.dailyTargetRate * 100).toString());
  const [startingDraft, setStartingDraft] = useState(settings.startingBalance.toString());
  const [questWidth, setQuestWidth] = useState(0);
  const [goalModalVisible, setGoalModalVisible] = useState(false);

  const hasHistory = ledger.length > 0;

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) {
      updateProfile({ username: settings.username, avatarUri: result.assets[0].uri });
    }
  };

  const saveName = () => {
    updateProfile({ username: nameDraft.trim() || 'Trader', avatarUri: settings.avatarUri });
    setEditingName(false);
  };

  const saveRate = () => {
    const n = parseFloat(rateDraft);
    if (!Number.isNaN(n) && n >= 0) updateSettings({ dailyTargetRate: n / 100 });
  };

  const saveStarting = () => {
    const n = parseFloat(startingDraft);
    if (!Number.isNaN(n) && n > 0) updateSettings({ startingBalance: n });
  };

  const confirmReset = () => {
    Alert.alert('Reset everything?', 'This clears your ledger, goals, and achievements. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetAll },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.lg, paddingBottom: 140 }]}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.avatarBlock}>
        <Pressable onPress={pickAvatar} style={[styles.avatarRing, { borderColor: tier.color }]}>
          {settings.avatarUri ? (
            <Image source={{ uri: settings.avatarUri }} style={styles.avatarImg} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: tier.secondary }]}>
              <Text style={styles.avatarInitial}>{settings.username.slice(0, 1).toUpperCase()}</Text>
            </View>
          )}
          <View style={[styles.avatarEditBadge, { backgroundColor: tier.color }]}>
            <Text style={styles.avatarEditIcon}>✎</Text>
          </View>
        </Pressable>

        {editingName ? (
          <View style={styles.nameEditRow}>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              style={styles.nameInput}
              autoFocus
              onSubmitEditing={saveName}
              placeholderTextColor={colors.inkFaint}
            />
            <Pressable onPress={saveName} style={styles.saveChip}>
              <Text style={styles.saveChipText}>Save</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => { setNameDraft(settings.username); setEditingName(true); }}>
            <Text style={styles.username}>@{settings.username}</Text>
          </Pressable>
        )}
        <Text style={styles.tierTag}>{tier.name} Tier · {formatCurrency(balance)}</Text>
      </View>

      <Card style={{ marginTop: spacing.xl }}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quest Path</Text>
          <Pressable onPress={() => setGoalModalVisible(true)} style={styles.addGoalChip}>
            <Text style={styles.addGoalChipText}>+ Goal</Text>
          </Pressable>
        </View>
        <View onLayout={(e) => setQuestWidth(e.nativeEvent.layout.width)}>
          {questWidth > 0 && <QuestPath goals={goals} balance={balance} width={questWidth} onDeleteGoal={deleteGoal} />}
        </View>
        {goals.length > 0 && <Text style={styles.questHint}>Hold a milestone to remove it</Text>}
      </Card>

      <Card style={{ marginTop: spacing.lg }}>
        <Text style={styles.sectionTitle}>Compounding Settings</Text>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Daily target rate</Text>
          <View style={styles.fieldInputRow}>
            <TextInput
              value={rateDraft}
              onChangeText={setRateDraft}
              onEndEditing={saveRate}
              keyboardType="decimal-pad"
              style={styles.fieldInput}
            />
            <Text style={styles.fieldSuffix}>%</Text>
          </View>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Count weekends as trading days</Text>
          <Switch
            value={settings.weekendsActive}
            onValueChange={(v) => updateSettings({ weekendsActive: v })}
            trackColor={{ false: colors.cardAlt, true: colors.mint }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Default reinvest</Text>
          <Text style={styles.fieldStatic}>{formatPercent(settings.defaultReinvestPct, 0)}</Text>
        </View>

        <View style={[styles.fieldRow, { opacity: hasHistory ? 0.5 : 1 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Starting balance</Text>
            {hasHistory && <Text style={styles.fieldHint}>Locked once you have ledger entries — use Edit Balance on Home instead</Text>}
          </View>
          <View style={styles.fieldInputRow}>
            <Text style={styles.fieldSuffix}>$</Text>
            <TextInput
              value={startingDraft}
              onChangeText={setStartingDraft}
              onEndEditing={saveStarting}
              keyboardType="decimal-pad"
              editable={!hasHistory}
              style={styles.fieldInput}
            />
          </View>
        </View>
      </Card>

      <Card style={{ marginTop: spacing.lg, borderColor: colors.rose }}>
        <Text style={[styles.sectionTitle, { color: colors.rose }]}>Danger Zone</Text>
        <Text style={styles.dangerHint}>Wipe your ledger, goals, and achievements to start fresh.</Text>
        <View style={{ marginTop: spacing.md }}>
          <PrimaryButton label="Reset All Progress" onPress={confirmReset} colors={['#FF6B8A', '#E01E45']} textColor={colors.white} />
        </View>
      </Card>

      <AddGoalModal visible={goalModalVisible} onClose={() => setGoalModalVisible(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg },
  title: { color: colors.ink, fontSize: 24, fontWeight: '800' },
  avatarBlock: { alignItems: 'center', marginTop: spacing.lg },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: { width: 94, height: 94, borderRadius: 47 },
  avatarPlaceholder: { width: 94, height: 94, borderRadius: 47, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: colors.bg, fontSize: 34, fontWeight: '800' },
  avatarEditBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  avatarEditIcon: { fontSize: 12, color: colors.bg },
  username: { color: colors.ink, fontSize: 17, fontWeight: '800', marginTop: spacing.md },
  nameEditRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  nameInput: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    color: colors.ink,
    fontSize: 15,
    minWidth: 140,
  },
  saveChip: { backgroundColor: colors.mintSoft, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  saveChipText: { color: colors.mint, fontWeight: '700', fontSize: 12 },
  tierTag: { color: colors.inkFaint, fontSize: 12, marginTop: 4, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { color: colors.ink, fontWeight: '800', fontSize: 16 },
  addGoalChip: { backgroundColor: colors.violetSoft, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  addGoalChipText: { color: colors.violet, fontWeight: '700', fontSize: 12 },
  questHint: { color: colors.inkFaint, fontSize: 10, textAlign: 'center', marginTop: spacing.sm },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  fieldLabel: { color: colors.inkDim, fontSize: 13, fontWeight: '600', flex: 1, paddingRight: spacing.md },
  fieldHint: { color: colors.inkFaint, fontSize: 10, marginTop: 2 },
  fieldInputRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fieldInput: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
    minWidth: 50,
  },
  fieldSuffix: { color: colors.inkFaint, fontSize: 13, fontWeight: '700' },
  fieldStatic: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  dangerHint: { color: colors.inkFaint, fontSize: 12, marginTop: spacing.xs },
});
