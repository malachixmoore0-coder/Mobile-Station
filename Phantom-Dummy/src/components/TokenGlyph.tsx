import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, tokenColors } from '@/theme';
import { TOKEN_LOGOS } from '@/data/logos';

interface Props {
  symbol: string;
  size?: number;
  verified?: boolean;
}

/** Round token badge: real bundled logo when available, tinted initials else. */
export function TokenGlyph({ symbol, size = 44, verified }: Props) {
  const tint = tokenColors[symbol] ?? '#6B6C7C';
  const logo = TOKEN_LOGOS[symbol];
  const [failed, setFailed] = useState(false);
  const badge = Math.max(13, size * 0.34);

  return (
    <View style={{ width: size, height: size }}>
      {logo && !failed ? (
        <Image
          source={logo}
          onError={() => setFailed(true)}
          style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#0E0E10' }}
        />
      ) : (
        <View
          style={[
            styles.circle,
            { width: size, height: size, borderRadius: size / 2, backgroundColor: tint + '26', borderColor: tint + '55' },
          ]}
        >
          <Text style={[styles.label, { color: tint, fontSize: size * 0.32 }]}>
            {symbol.slice(0, symbol.length > 4 ? 3 : 2)}
          </Text>
        </View>
      )}
      {verified && (
        <View style={[styles.badge, { width: badge, height: badge, borderRadius: badge / 2, right: -1, bottom: -1 }]}>
          <Ionicons name="checkmark" size={badge * 0.66} color={colors.white} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  label: { fontWeight: '800', letterSpacing: -0.3 },
  badge: {
    position: 'absolute',
    backgroundColor: colors.verified,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
});
