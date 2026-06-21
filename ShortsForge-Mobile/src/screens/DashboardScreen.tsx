import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShorts } from '@/hooks/useShorts';
import { useDesktopStatus } from '@/hooks/useDesktopStatus';
import { ShortCard } from '@/components/ShortCard';
import { DesktopStatusBar } from '@/components/DesktopStatusBar';
import { Short } from '@/services/projectService';
import { logOut } from '@/services/authService';

interface Props {
  onSelectShort: (short: Short) => void;
}

export function DashboardScreen({ onSelectShort }: Props) {
  const { shorts, loading } = useShorts();
  const desktopStatus = useDesktopStatus();

  const { active, recent } = useMemo(() => ({
    active: shorts.filter((s) =>
      ['processing', 'rendering', 'exporting'].includes(s.status)
    ),
    recent: shorts.filter((s) =>
      !['processing', 'rendering', 'exporting'].includes(s.status)
    ),
  }), [shorts]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>ShortsForge</Text>
          <Text style={styles.subheading}>Mobile</Text>
        </View>
        <TouchableOpacity onPress={logOut} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <DesktopStatusBar status={desktopStatus} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#7c3aed" size="large" />
        </View>
      ) : shorts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎬</Text>
          <Text style={styles.emptyTitle}>No shorts yet</Text>
          <Text style={styles.emptyText}>
            Create a short in ShortsForge on your desktop. It will appear here in real time.
          </Text>
        </View>
      ) : (
        <FlatList
          data={shorts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ShortCard short={item} onPress={() => onSelectShort(item)} />
          )}
          ListHeaderComponent={
            <>
              {active.length > 0 && (
                <Text style={styles.sectionLabel}>In Progress ({active.length})</Text>
              )}
              {active.map((s) => (
                <ShortCard key={s.id} short={s} onPress={() => onSelectShort(s)} />
              ))}
              {recent.length > 0 && active.length > 0 && (
                <Text style={styles.sectionLabel}>Recent</Text>
              )}
            </>
          }
          ListHeaderComponentStyle={styles.listHeader}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  heading: {
    color: '#f1f1f5',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subheading: {
    color: '#7c3aed',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#1e1e30',
    borderRadius: 8,
  },
  logoutText: {
    color: '#9ca3af',
    fontSize: 13,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  listHeader: {
    gap: 0,
  },
  sectionLabel: {
    color: '#4b5563',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 10,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    color: '#f1f1f5',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
