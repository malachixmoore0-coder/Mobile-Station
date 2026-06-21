import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { LoginScreen } from '@/screens/LoginScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { ShortDetailScreen } from '@/screens/ShortDetailScreen';
import { Short } from '@/services/projectService';

export function AppNavigator() {
  const { user, loading } = useAuth();
  const [selectedShort, setSelectedShort] = useState<Short | null>(null);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#7c3aed" size="large" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (selectedShort) {
    return (
      <ShortDetailScreen
        short={selectedShort}
        onBack={() => setSelectedShort(null)}
      />
    );
  }

  return <DashboardScreen onSelectShort={setSelectedShort} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
