import React, { useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius } from '@/theme';

type Props = {
  value: number; // 0..1
  onChange: (value: number) => void;
  trackColors?: readonly [string, string, ...string[]];
};

export function SliderControl({ value, onChange, trackColors = ['#3DFCB0', '#33D6FF'] }: Props) {
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);

  const onLayout = (e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width;
    setWidth(e.nativeEvent.layout.width);
  };

  const respond = (x: number) => {
    if (widthRef.current <= 0) return;
    const clamped = Math.max(0, Math.min(1, x / widthRef.current));
    onChange(clamped);
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => respond(e.nativeEvent.locationX),
      onPanResponderMove: (e) => respond(e.nativeEvent.locationX),
    })
  ).current;

  const thumbLeft = Math.max(0, Math.min(width - 22, value * width - 11));

  return (
    <View style={styles.wrap} onLayout={onLayout} {...pan.panHandlers}>
      <View style={styles.track}>
        <LinearGradient
          colors={trackColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: `${value * 100}%`, height: '100%', borderRadius: radius.pill }}
        />
      </View>
      {width > 0 && <View style={[styles.thumb, { left: thumbLeft }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 32,
    justifyContent: 'center',
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.mint,
  },
});
