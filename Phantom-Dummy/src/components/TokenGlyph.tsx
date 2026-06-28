import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokenColors } from '@/theme';

interface Props {
  symbol: string;
  size?: number;
}

/** Round, brand-tinted coin badge standing in for a real token logo. */
export function TokenGlyph({ symbol, size = 44 }: Props) {
  const tint = tokenColors[symbol] ?? '#6B6C7C';
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: tint + '22', borderColor: tint + '55' },
      ]}
    >
      <Text style={[styles.label, { color: tint, fontSize: size * 0.34 }]}>
        {symbol.slice(0, symbol.length > 4 ? 3 : 2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: {
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});
