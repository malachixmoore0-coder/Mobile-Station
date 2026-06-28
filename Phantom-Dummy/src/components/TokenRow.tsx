import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '@/theme';
import { Token, buildSeries } from '@/data/portfolio';
import { formatPrice, formatUsd, formatPct, formatAmount } from '@/utils/format';
import { TokenGlyph } from './TokenGlyph';
import { Sparkline } from './Sparkline';

interface Props {
  token: Token;
  onPress: () => void;
  hidden?: boolean;
}

export function TokenRow({ token, onPress, hidden }: Props) {
  const up = token.change24h >= 0;
  const spark = useMemo(
    () => buildSeries(token.price, token.symbol.charCodeAt(0) * 7 + 3, 24, up ? 0.03 : 0.04, up ? 0.18 : -0.12),
    [token.symbol, up], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <TokenGlyph symbol={token.symbol} />
      <View style={styles.info}>
        <Text style={styles.name}>{token.name}</Text>
        <Text style={styles.amount}>{formatAmount(token.amount, token.symbol)}</Text>
      </View>

      <Sparkline data={spark} up={up} />

      <View style={styles.right}>
        <Text style={styles.value}>{hidden ? '••••' : formatUsd(token.value)}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(token.price)}</Text>
          <Text style={[styles.change, { color: up ? colors.up : colors.down }]}>
            {formatPct(token.change24h)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  amount: {
    color: colors.textDim,
    fontSize: 13,
  },
  right: {
    alignItems: 'flex-end',
    gap: 3,
    minWidth: 96,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    color: colors.textFaint,
    fontSize: 12,
  },
  change: {
    fontSize: 12,
    fontWeight: '600',
  },
});
