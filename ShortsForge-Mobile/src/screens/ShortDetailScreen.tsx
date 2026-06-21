import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Short } from '@/services/projectService';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';

const PLATFORM_COLORS: Record<string, string> = {
  youtube: '#ff0000',
  tiktok: '#00f2ea',
  instagram: '#e1306c',
  all: '#7c3aed',
};

interface Props {
  short: Short;
  onBack: () => void;
}

export function ShortDetailScreen({ short, onBack }: Props) {
  const platformColor = PLATFORM_COLORS[short.platform] ?? '#7c3aed';
  const isActive = ['processing', 'rendering', 'exporting'].includes(short.status);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backText}>Dashboard</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {short.thumbnailUrl ? (
          <Image source={{ uri: short.thumbnailUrl }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnailPlaceholder, { borderColor: platformColor }]}>
            <Text style={styles.thumbnailEmoji}>🎬</Text>
          </View>
        )}

        <Text style={styles.title}>{short.title}</Text>

        <View style={styles.badgeRow}>
          <StatusBadge status={short.status} />
          <View style={[styles.platformBadge, { borderColor: platformColor }]}>
            <Text style={[styles.platformText, { color: platformColor }]}>
              {short.platform}
            </Text>
          </View>
        </View>

        {isActive && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Progress</Text>
              <Text style={[styles.progressPct, { color: platformColor }]}>
                {short.progress}%
              </Text>
            </View>
            <ProgressBar progress={short.progress} color={platformColor} />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailGrid}>
            <DetailRow label="Duration" value={formatDuration(short.duration)} />
            <DetailRow label="Platform" value={short.platform} />
            <DetailRow
              label="Created"
              value={short.createdAt?.toDate?.()?.toLocaleDateString() ?? '—'}
            />
            <DetailRow
              label="Updated"
              value={short.updatedAt?.toDate?.()?.toLocaleString() ?? '—'}
            />
          </View>
        </View>

        {short.status === 'done' && short.outputUrl && (
          <TouchableOpacity
            style={[styles.openBtn, { backgroundColor: platformColor }]}
            onPress={() => Linking.openURL(short.outputUrl!)}
          >
            <Text style={styles.openBtnText}>Open Output File</Text>
          </TouchableOpacity>
        )}

        {short.status === 'error' && short.errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorMsg}>{short.errorMessage}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function formatDuration(seconds: number): string {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  navBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backIcon: {
    color: '#7c3aed',
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 24,
  },
  backText: {
    color: '#7c3aed',
    fontSize: 16,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#13131f',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#13131f',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailEmoji: {
    fontSize: 56,
  },
  title: {
    color: '#f1f1f5',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  platformBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
  },
  platformText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'capitalize',
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  progressPct: {
    fontSize: 14,
    fontWeight: '700',
  },
  detailGrid: {
    backgroundColor: '#13131f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e1e30',
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e30',
  },
  detailLabel: {
    color: '#6b7280',
    fontSize: 14,
  },
  detailValue: {
    color: '#f1f1f5',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  openBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  openBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#ef444415',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  errorTitle: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700',
  },
  errorMsg: {
    color: '#fca5a5',
    fontSize: 13,
    lineHeight: 18,
  },
});
