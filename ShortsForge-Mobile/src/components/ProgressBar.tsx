import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  progress: number; // 0–100
  color?: string;
}

export function ProgressBar({ progress, color = '#7c3aed' }: Props) {
  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          { width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    backgroundColor: '#1e1e2e',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});
