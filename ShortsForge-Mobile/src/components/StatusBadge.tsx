import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProjectStatus } from '@/services/projectService';

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string }> = {
  idle: { label: 'Idle', color: '#6b7280' },
  processing: { label: 'Processing', color: '#3b82f6' },
  rendering: { label: 'Rendering', color: '#f59e0b' },
  exporting: { label: 'Exporting', color: '#8b5cf6' },
  done: { label: 'Done', color: '#10b981' },
  error: { label: 'Error', color: '#ef4444' },
};

interface Props {
  status: ProjectStatus;
}

export function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.idle;
  return (
    <View style={[styles.badge, { backgroundColor: config.color + '22', borderColor: config.color }]}>
      {(status === 'processing' || status === 'rendering' || status === 'exporting') && (
        <View style={[styles.pulse, { backgroundColor: config.color }]} />
      )}
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    gap: 6,
  },
  pulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
