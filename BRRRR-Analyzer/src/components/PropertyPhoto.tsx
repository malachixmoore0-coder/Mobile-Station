import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PropertyType } from '@/services/types';

/**
 * Shows the listing's real photo when one is available (e.g. from a live
 * RentCast result), and falls back to a local, zero-network placeholder
 * graphic when there isn't one or the image fails to load. Sample/demo data
 * has no real photos, so it always shows the placeholder — which renders
 * instantly and never shows a broken-image icon.
 */

const PALETTE: [string, string][] = [
  ['#0F3D2E', '#1E5F44'],
  ['#2E4B3D', '#3C6656'],
  ['#3A4A3F', '#4E6355'],
  ['#26433A', '#33574C'],
  ['#1F3B33', '#2C5148'],
];

const ICON_BY_TYPE: Record<PropertyType, keyof typeof Ionicons.glyphMap> = {
  Duplex: 'home-outline',
  Triplex: 'business-outline',
  Fourplex: 'business-outline',
  'Multi-family 5+': 'business-outline',
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

interface Props {
  id: string;
  propertyType: PropertyType;
  size?: 'card' | 'hero';
  photoUrl?: string;
}

export function PropertyPhoto({ id, propertyType, size = 'card', photoUrl }: Props) {
  const [failed, setFailed] = useState(false);
  const [bg] = PALETTE[hashString(id) % PALETTE.length];
  const iconSize = size === 'hero' ? 56 : 34;
  const showPhoto = !!photoUrl && !failed;

  return (
    <View style={[styles.wrap, { backgroundColor: bg }]}>
      {showPhoto ? (
        <Image source={{ uri: photoUrl }} style={StyleSheet.absoluteFill} onError={() => setFailed(true)} />
      ) : (
        <>
          <Ionicons name={ICON_BY_TYPE[propertyType] ?? 'home-outline'} size={iconSize} color="rgba(255,255,255,0.28)" />
          <Text style={[styles.label, size === 'hero' && styles.labelHero]}>{propertyType}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  label: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  labelHero: { fontSize: 14 },
});
