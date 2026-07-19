import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius, spacing } from '@/theme';
import { useAppState } from '@/context/AppStateContext';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Card } from '@/components/Card';

export function OnboardingScreen() {
  const { completeOnboarding } = useAppState();
  const [username, setUsername] = useState('Trader');
  const [startingBalance, setStartingBalance] = useState('50');
  const [dailyTargetRate, setDailyTargetRate] = useState('10');
  const [weekendsActive, setWeekendsActive] = useState(false);

  const submit = () => {
    const balance = Math.max(1, parseFloat(startingBalance) || 50);
    const rate = Math.max(0, parseFloat(dailyTargetRate) || 10) / 100;
    completeOnboarding({
      username: username.trim() || 'Trader',
      startingBalance: balance,
      dailyTargetRate: rate,
      weekendsActive,
    });
  };

  return (
    <LinearGradient colors={gradients.hero} style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.kicker}>COMPOUNDFORGE</Text>
          <Text style={styles.title}>Turn your trading{'\n'}into a compounding game.</Text>
          <Text style={styles.subtitle}>Set your starting point. Every logged win grows your crystal.</Text>

          <Card style={{ marginTop: spacing.xl }}>
            <Text style={styles.label}>Your name</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Trader"
              placeholderTextColor={colors.inkFaint}
              style={styles.input}
            />

            <Text style={styles.label}>Starting balance ($)</Text>
            <TextInput
              value={startingBalance}
              onChangeText={setStartingBalance}
              keyboardType="decimal-pad"
              placeholder="50"
              placeholderTextColor={colors.inkFaint}
              style={styles.input}
            />

            <Text style={styles.label}>Daily target rate (%)</Text>
            <TextInput
              value={dailyTargetRate}
              onChangeText={setDailyTargetRate}
              keyboardType="decimal-pad"
              placeholder="10"
              placeholderTextColor={colors.inkFaint}
              style={styles.input}
            />

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Count weekends as trading days</Text>
                <Text style={styles.hint}>Matches the CompoundDaily "Weekends" setting</Text>
              </View>
              <PrimaryButton
                label={weekendsActive ? 'Yes' : 'No'}
                onPress={() => setWeekendsActive((v) => !v)}
                colors={weekendsActive ? ['#3DFCB0', '#1FB983'] : ['#262B3B', '#1D2130']}
                textColor={weekendsActive ? '#0A0B10' : colors.inkDim}
                compact
              />
            </View>
          </Card>

          <View style={{ marginTop: spacing.xl }}>
            <PrimaryButton label="Start Compounding" onPress={submit} colors={['#8B5CF6', '#6D28D9']} textColor={colors.white} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: spacing.xl, paddingTop: 72, paddingBottom: 60 },
  kicker: { color: colors.violet, fontWeight: '800', letterSpacing: 3, fontSize: 12, marginBottom: spacing.md },
  title: { color: colors.ink, fontSize: 30, fontWeight: '800', lineHeight: 36 },
  subtitle: { color: colors.inkDim, fontSize: 15, marginTop: spacing.sm, lineHeight: 21 },
  label: { color: colors.inkDim, fontSize: 13, fontWeight: '600', marginTop: spacing.md, marginBottom: spacing.xs },
  hint: { color: colors.inkFaint, fontSize: 11, marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.ink,
    fontSize: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
});
