import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius } from '@/theme';

type Props = {
  progress: number; // 0..1
  colors?: readonly [string, string, ...string[]];
  height?: number;
};

export function ProgressBar({ progress, colors: barColors = ['#3DFCB0', '#33D6FF'], height = 8 }: Props) {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: Math.max(0, Math.min(1, progress)) * 100,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress, width]);

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <Animated.View style={{ width: width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }), height: '100%' }}>
        <LinearGradient colors={barColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, borderRadius: height / 2 }} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.cardAlt,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
