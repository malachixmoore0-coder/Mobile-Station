import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DesktopStatus } from '@/services/projectService';

interface Props {
  status: DesktopStatus;
}

export function DesktopStatusBar({ status }: Props) {
  const lastSeenText = status.lastSeen
    ? getTimeAgo(new Date(status.lastSeen))
    : 'never';

  return (
    <View style={[styles.bar, status.online ? styles.online : styles.offline]}>
      <View style={[styles.indicator, { backgroundColor: status.online ? '#10b981' : '#6b7280' }]} />
      <Text style={styles.text}>
        {status.online
          ? `Desktop connected${status.currentProject ? ` · Working on "${status.currentProject}"` : ''}`
          : `Desktop offline · Last seen ${lastSeenText}`}
      </Text>
    </View>
  );
}

function getTimeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 4,
  },
  online: {
    backgroundColor: '#10b98115',
  },
  offline: {
    backgroundColor: '#13131f',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
});
