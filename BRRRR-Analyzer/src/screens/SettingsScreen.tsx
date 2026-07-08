import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Switch, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing } from '@/theme';
import { Chip } from '@/components/Chip';
import { useSettings } from '@/context/SettingsContext';

export function SettingsScreen() {
  const {
    preferences,
    updatePreferences,
    allNeighborhoods,
    rentcastKey,
    googlePlacesKey,
    setRentcastKey,
    setGooglePlacesKey,
    forceDemoMode,
    setForceDemoMode,
  } = useSettings();

  const [city, setCity] = useState(preferences.city);
  const [state, setState] = useState(preferences.state);
  const [rcDraft, setRcDraft] = useState(rentcastKey ?? '');
  const [gpDraft, setGpDraft] = useState(googlePlacesKey ?? '');
  const [showRc, setShowRc] = useState(false);
  const [showGp, setShowGp] = useState(false);

  const toggleNeighborhood = (n: string) => {
    const next = preferences.targetNeighborhoods.includes(n)
      ? preferences.targetNeighborhoods.filter((x) => x !== n)
      : [...preferences.targetNeighborhoods, n];
    updatePreferences({ targetNeighborhoods: next });
  };

  const hasAnyLiveKey = !!rentcastKey || !!googlePlacesKey;

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        <Text style={styles.section}>Market</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 2 }]}
              value={city}
              onChangeText={setCity}
              onEndEditing={() => updatePreferences({ city })}
              placeholder="City"
              placeholderTextColor={colors.inkFaint}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={state}
              onChangeText={setState}
              onEndEditing={() => updatePreferences({ state })}
              placeholder="State"
              placeholderTextColor={colors.inkFaint}
              autoCapitalize="characters"
              maxLength={2}
            />
          </View>
        </View>

        <Text style={styles.section}>Target neighborhoods</Text>
        <View style={[styles.card, styles.wrapRow]}>
          {allNeighborhoods.map((n) => (
            <Chip key={n} label={n} active={preferences.targetNeighborhoods.includes(n)} onPress={() => toggleNeighborhood(n)} />
          ))}
        </View>

        <Text style={styles.section}>Minimum units</Text>
        <View style={[styles.card, styles.stepperRow]}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => updatePreferences({ minUnits: Math.max(2, preferences.minUnits - 1) })}
          >
            <Ionicons name="remove" size={18} color={colors.ink} />
          </TouchableOpacity>
          <Text style={styles.stepValue}>{preferences.minUnits}+ units</Text>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => updatePreferences({ minUnits: Math.min(20, preferences.minUnits + 1) })}
          >
            <Ionicons name="add" size={18} color={colors.ink} />
          </TouchableOpacity>
        </View>

        <Text style={styles.section}>Live data sources</Text>
        <View style={styles.card}>
          <Text style={styles.helper}>
            Without a key, BRRRR Scout runs on realistic sample listings and contractors that update
            periodically so you can try the full app. Add your own API keys below to switch a category to
            live data — keys are stored securely on this device only.
          </Text>

          <ApiKeyRow
            label="RentCast (listings)"
            docsUrl="https://developers.rentcast.io/reference/introduction"
            value={rcDraft}
            onChange={setRcDraft}
            show={showRc}
            onToggleShow={() => setShowRc((v) => !v)}
            onSave={() => setRentcastKey(rcDraft.trim())}
            active={!!rentcastKey}
          />
          <View style={styles.divider} />
          <ApiKeyRow
            label="Google Places (contractors)"
            docsUrl="https://developers.google.com/maps/documentation/places/web-service/text-search"
            value={gpDraft}
            onChange={setGpDraft}
            show={showGp}
            onToggleShow={() => setShowGp((v) => !v)}
            onSave={() => setGooglePlacesKey(gpDraft.trim())}
            active={!!googlePlacesKey}
          />

          {hasAnyLiveKey && (
            <>
              <View style={styles.divider} />
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchLabel}>Force demo data</Text>
                  <Text style={styles.switchHelper}>Preview the sample dataset even though a live key is set.</Text>
                </View>
                <Switch
                  value={forceDemoMode}
                  onValueChange={setForceDemoMode}
                  trackColor={{ false: colors.border, true: colors.primaryTint }}
                  thumbColor={colors.white}
                />
              </View>
            </>
          )}
        </View>

        <Text style={styles.section}>About</Text>
        <View style={styles.card}>
          <Text style={styles.helper}>
            BRRRR Scout scores every listing on projected cash left in the deal after a refinance, cash-on-cash
            return, monthly cash flow per unit, cap rate, and debt-service coverage — the core levers of the
            Buy, Rehab, Rent, Refinance, Repeat method. Assumptions (75% ARV refinance, vacancy/management/
            maintenance reserves) are built into the analysis engine and applied consistently across every
            property.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ApiKeyRow({
  label,
  docsUrl,
  value,
  onChange,
  show,
  onToggleShow,
  onSave,
  active,
}: {
  label: string;
  docsUrl: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  onSave: () => void;
  active: boolean;
}) {
  return (
    <View>
      <View style={styles.keyLabelRow}>
        <Text style={styles.keyLabel}>{label}</Text>
        {active && (
          <View style={styles.liveTag}>
            <Ionicons name="checkmark-circle" size={12} color={colors.great} />
            <Text style={styles.liveTagText}>Connected</Text>
          </View>
        )}
      </View>
      <View style={styles.keyInputRow}>
        <TextInput
          style={styles.keyInput}
          value={value}
          onChangeText={onChange}
          placeholder="Paste API key"
          placeholderTextColor={colors.inkFaint}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.keyIconBtn} onPress={onToggleShow} hitSlop={8}>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.inkDim} />
        </TouchableOpacity>
      </View>
      <View style={styles.keyActionsRow}>
        <TouchableOpacity onPress={() => Linking.openURL(docsUrl)}>
          <Text style={styles.keyLink}>Get a key →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.keySaveBtn} onPress={onSave}>
          <Text style={styles.keySaveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  title: { fontSize: 26, fontWeight: '800', color: colors.ink, marginBottom: spacing.md },
  section: { fontSize: 13, fontWeight: '700', color: colors.inkDim, marginTop: spacing.lg, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadow.card,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  input: {
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink,
  },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { fontSize: 15, fontWeight: '700', color: colors.ink },
  helper: { fontSize: 12, color: colors.inkDim, lineHeight: 18, marginBottom: spacing.md },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
  keyLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  keyLabel: { fontSize: 14, fontWeight: '700', color: colors.ink },
  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  liveTagText: { fontSize: 11, color: colors.great, fontWeight: '700' },
  keyInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  keyInput: {
    flex: 1,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.ink,
  },
  keyIconBtn: { padding: 8 },
  keyActionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  keyLink: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  keySaveBtn: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 7 },
  keySaveText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  switchLabel: { fontSize: 14, fontWeight: '700', color: colors.ink },
  switchHelper: { fontSize: 12, color: colors.inkFaint, marginTop: 2 },
});
