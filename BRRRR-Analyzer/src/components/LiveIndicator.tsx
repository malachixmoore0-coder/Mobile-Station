import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';
import { timeAgo } from '@/utils/format';

interface Props {
  isLive: boolean;
  lastUpdated: number;
}

export function LiveIndicator({ isLive, lastUpdated }: Props) {
  const [, force] = useState(0);

  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: isLive ? colors.great : colors.gold }]} />
      <Text style={styles.text}>
        {isLive ? 'Live' : 'Demo data'} · updated {timeAgo(lastUpdated)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  text: { color: colors.inkFaint, fontSize: 12, fontWeight: '500' },
});
