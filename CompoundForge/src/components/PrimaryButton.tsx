import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { radius, spacing } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  colors?: readonly [string, string, ...string[]];
  textColor?: string;
  disabled?: boolean;
  compact?: boolean;
};

export function PrimaryButton({ label, onPress, colors = ['#3DFCB0', '#1FB983'], textColor = '#0A0B10', disabled, compact }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  return (
    <Pressable
      disabled={disabled}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={() => {
        if (Haptics.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        onPress();
      }}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.button, compact && styles.compact]}
        >
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  label: {
    fontWeight: '700',
    fontSize: 15,
  },
});
