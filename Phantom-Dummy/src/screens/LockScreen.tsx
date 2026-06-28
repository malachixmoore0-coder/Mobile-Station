import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '@/theme';

interface Props {
  onUnlock: () => void;
}

type Phase = 'idle' | 'scanning' | 'success' | 'failed';

const PASSCODE_LENGTH = 6;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

/**
 * Phantom-style lock screen. Simulates a Face ID scan (auto-triggered on
 * launch, like iOS) with a passcode fallback. Any passcode is accepted — this
 * is a demo, there is nothing to actually protect.
 */
export function LockScreen({ onUnlock }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [usePasscode, setUsePasscode] = useState(false);
  const [code, setCode] = useState('');

  const ring = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const unlocked = useRef(false);

  const finishUnlock = useCallback(() => {
    if (unlocked.current) return;
    unlocked.current = true;
    // Drive the unlock on a timer (not the animation callback) so it always
    // fires, including on web where native-driver completion can be a no-op.
    Animated.timing(fade, { toValue: 0, duration: 280, useNativeDriver: true }).start();
    timers.current.push(setTimeout(onUnlock, 300));
  }, [fade, onUnlock]);

  const runScan = useCallback(() => {
    setPhase('scanning');
    ring.setValue(0);
    // Visual spin only; state transitions are timer-driven below.
    Animated.loop(
      Animated.timing(ring, { toValue: 1, duration: 1100, easing: Easing.linear, useNativeDriver: true }),
    ).start();
    timers.current.push(
      setTimeout(() => {
        setPhase('success');
        Animated.spring(successScale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
      }, 2000),
    );
    timers.current.push(setTimeout(finishUnlock, 2480));
  }, [ring, successScale, finishUnlock]);

  // Auto-prompt Face ID shortly after launch, mirroring iOS behaviour.
  useEffect(() => {
    timers.current.push(
      setTimeout(() => {
        if (!usePasscode) runScan();
      }, 550),
    );
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function press(key: string) {
    if (key === 'del') {
      setCode((c) => c.slice(0, -1));
      return;
    }
    if (!key) return;
    setCode((c) => {
      const next = (c + key).slice(0, PASSCODE_LENGTH);
      if (next.length === PASSCODE_LENGTH) {
        setTimeout(() => {
          setPhase('success');
          finishUnlock();
        }, 180);
      }
      return next;
    });
  }

  const spin = ring.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const scanColor =
    phase === 'success' ? colors.up : phase === 'failed' ? colors.down : colors.accent;

  return (
    <Animated.View style={[styles.fill, { opacity: fade }]}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.brand}>
          <View style={styles.ghost}>
            <Text style={styles.ghostGlyph}>👻</Text>
          </View>
          <Text style={styles.brandName}>Phantom</Text>
        </View>

        {!usePasscode ? (
          <View style={styles.center}>
            <TouchableOpacity activeOpacity={0.85} onPress={runScan} disabled={phase === 'scanning'}>
              <View style={styles.faceWrap}>
                {phase === 'scanning' && (
                  <Animated.View
                    style={[styles.scanRing, { borderTopColor: scanColor, transform: [{ rotate: spin }] }]}
                  />
                )}
                <View style={[styles.faceCircle, { borderColor: scanColor + '55' }]}>
                  {phase === 'success' ? (
                    <Animated.View style={{ transform: [{ scale: successScale }] }}>
                      <Ionicons name="checkmark" size={56} color={colors.up} />
                    </Animated.View>
                  ) : (
                    <MaterialCommunityIcons name="face-recognition" size={56} color={scanColor} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
            <Text style={styles.statusText}>
              {phase === 'scanning'
                ? 'Scanning…'
                : phase === 'success'
                ? 'Face ID'
                : 'Tap to unlock with Face ID'}
            </Text>
            <TouchableOpacity
              style={styles.altBtn}
              onPress={() => {
                timers.current.forEach(clearTimeout);
                timers.current = [];
                setPhase('idle');
                setUsePasscode(true);
              }}
            >
              <Text style={styles.altBtnText}>Use passcode</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.center}>
            <Text style={styles.passTitle}>Enter passcode</Text>
            <View style={styles.dots}>
              {Array.from({ length: PASSCODE_LENGTH }).map((_, i) => (
                <View key={i} style={[styles.dot, i < code.length && styles.dotFilled]} />
              ))}
            </View>
            <View style={styles.pad}>
              {KEYS.map((k, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.key, (!k || k === 'del') && styles.keyBare]}
                  activeOpacity={k ? 0.6 : 1}
                  onPress={() => press(k)}
                  disabled={!k}
                >
                  {k === 'del' ? (
                    <Ionicons name="backspace-outline" size={26} color={colors.text} />
                  ) : (
                    <Text style={styles.keyText}>{k}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.altBtn} onPress={() => { setUsePasscode(false); setCode(''); }}>
              <Text style={styles.altBtnText}>Use Face ID</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.bg, zIndex: 10 },
  safe: { flex: 1, justifyContent: 'space-between', paddingBottom: spacing.xl },
  brand: { alignItems: 'center', marginTop: 64, gap: spacing.md },
  ghost: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.accent + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostGlyph: { fontSize: 40 },
  brandName: { color: colors.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  faceWrap: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center' },
  scanRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  faceCircle: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 1.5,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: { color: colors.textDim, fontSize: 15, fontWeight: '500' },
  altBtn: { marginTop: spacing.md, paddingVertical: 10, paddingHorizontal: spacing.lg },
  altBtnText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
  passTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  dots: { flexDirection: 'row', gap: 18, marginVertical: spacing.lg },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.textFaint,
  },
  dotFilled: { backgroundColor: colors.accent, borderColor: colors.accent },
  pad: {
    width: 280,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  key: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgElevated,
  },
  keyBare: { backgroundColor: 'transparent' },
  keyText: { color: colors.text, fontSize: 28, fontWeight: '500' },
});
