import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ListingStatus } from '@/services/types';
import { colors, radius, statusColor, spacing } from '@/theme';
import { formatDaysOnMarket } from '@/utils/format';

interface Props {
  status: ListingStatus;
  daysOnMarket?: number;
}

export function StatusPill({ status, daysOnMarket }: Props) {
  const color = statusColor(status);
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.status, { color }]}>{status}</Text>
      {daysOnMarket !== undefined && (
        <>
          <Text style={styles.sep}>·</Text>
          <Text style={styles.dom}>{formatDaysOnMarket(daysOnMarket)}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  status: { fontSize: 12, fontWeight: '700' },
  sep: { color: colors.inkFaint, fontSize: 12 },
  dom: { color: colors.inkDim, fontSize: 12, fontWeight: '500' },
});
