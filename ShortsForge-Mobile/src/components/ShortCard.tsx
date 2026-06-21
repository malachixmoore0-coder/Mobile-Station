import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Short } from '@/services/projectService';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';

const PLATFORM_COLORS: Record<string, string> = {
  youtube: '#ff0000',
  tiktok: '#00f2ea',
  instagram: '#e1306c',
  all: '#7c3aed',
};

interface Props {
  short: Short;
  onPress: () => void;
}

export function ShortCard({ short, onPress }: Props) {
  const platformColor = PLATFORM_COLORS[short.platform] ?? '#7c3aed';
  const isActive = ['processing', 'rendering', 'exporting'].includes(short.status);
  const timeAgo = getTimeAgo(short.updatedAt?.toDate?.() ?? new Date());

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.row}>
        {short.thumbnailUrl ? (
          <Image source={{ uri: short.thumbnailUrl }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnailPlaceholder, { borderColor: platformColor }]}>
            <Text style={[styles.platformInitial, { color: platformColor }]}>
              {short.platform[0].toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{short.title}</Text>
          <View style={styles.meta}>
            <View style={[styles.dot, { backgroundColor: platformColor }]} />
            <Text style={styles.metaText}>{short.platform}</Text>
            <Text style={styles.metaSep}>·</Text>
            <Text style={styles.metaText}>{formatDuration(short.duration)}</Text>
            <Text style={styles.metaSep}>·</Text>
            <Text style={styles.metaText}>{timeAgo}</Text>
          </View>
          <StatusBadge status={short.status} />
        </View>
      </View>

      {isActive && (
        <View style={styles.progressSection}>
          <ProgressBar progress={short.progress} color={platformColor} />
          <Text style={styles.progressText}>{short.progress}%</Text>
        </View>
      )}

      {short.status === 'error' && short.errorMessage && (
        <Text style={styles.errorText}>{short.errorMessage}</Text>
      )}
    </TouchableOpacity>
  );
}

function formatDuration(seconds: number): string {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function getTimeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#13131f',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e1e30',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#1e1e30',
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformInitial: {
    fontSize: 22,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: '#f1f1f5',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metaText: {
    color: '#6b7280',
    fontSize: 12,
  },
  metaSep: {
    color: '#374151',
    fontSize: 12,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
    width: 32,
    textAlign: 'right',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    backgroundColor: '#ef444420',
    padding: 8,
    borderRadius: 8,
  },
});
