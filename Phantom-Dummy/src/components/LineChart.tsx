import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, LayoutChangeEvent } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line } from 'react-native-svg';
import { colors } from '@/theme';
import { formatUsd } from '@/utils/format';

interface Props {
  data: number[];
  height?: number;
  up?: boolean;
  /** Called while the user scrubs; null when they let go. */
  onScrub?: (value: number | null) => void;
}

/** Catmull-Rom → cubic bezier so the line reads as a smooth market curve. */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function LineChart({ data, height = 180, up = true, onScrub }: Props) {
  const [width, setWidth] = useState(0);
  const [scrubX, setScrubX] = useState<number | null>(null);
  const stroke = up ? colors.up : colors.down;

  const { points } = useMemo(() => {
    const lo = Math.min(...data);
    const hi = Math.max(...data);
    const pad = (hi - lo) * 0.12 || 1;
    const minV = lo - pad;
    const maxV = hi + pad;
    const pts = data.map((v, i) => ({
      x: data.length > 1 ? (i / (data.length - 1)) * width : 0,
      y: height - ((v - minV) / (maxV - minV)) * height,
    }));
    return { points: pts, min: minV, max: maxV };
  }, [data, width, height]);

  const linePath = useMemo(() => smoothPath(points), [points]);
  const areaPath = useMemo(() => {
    if (!linePath) return '';
    return `${linePath} L ${width} ${height} L 0 ${height} Z`;
  }, [linePath, width, height]);

  // Closest data point to the current scrub position.
  const active = useMemo(() => {
    if (scrubX == null || points.length === 0) return null;
    let nearest = points[0];
    let nearestIdx = 0;
    for (let i = 0; i < points.length; i++) {
      if (Math.abs(points[i].x - scrubX) < Math.abs(nearest.x - scrubX)) {
        nearest = points[i];
        nearestIdx = i;
      }
    }
    return { ...nearest, value: data[nearestIdx] };
  }, [scrubX, points, data]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          const x = e.nativeEvent.locationX;
          setScrubX(x);
          onScrub?.(nearestValue(x));
        },
        onPanResponderMove: (e) => {
          const x = Math.max(0, Math.min(width, e.nativeEvent.locationX));
          setScrubX(x);
          onScrub?.(nearestValue(x));
        },
        onPanResponderRelease: () => {
          setScrubX(null);
          onScrub?.(null);
        },
        onPanResponderTerminate: () => {
          setScrubX(null);
          onScrub?.(null);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width, points, data],
  );

  function nearestValue(x: number): number {
    if (points.length === 0) return 0;
    let idx = 0;
    let best = Infinity;
    for (let i = 0; i < points.length; i++) {
      const d = Math.abs(points[i].x - x);
      if (d < best) {
        best = d;
        idx = i;
      }
    }
    return data[idx];
  }

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={{ height }} onLayout={onLayout} {...pan.panHandlers}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={stroke} stopOpacity={0.28} />
              <Stop offset="1" stopColor={stroke} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={areaPath} fill="url(#fill)" />
          <Path d={linePath} stroke={stroke} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          {active && (
            <>
              <Line x1={active.x} y1={0} x2={active.x} y2={height} stroke={colors.border} strokeWidth={1} />
              <Circle cx={active.x} cy={active.y} r={6} fill={stroke} stroke={colors.bg} strokeWidth={2} />
            </>
          )}
        </Svg>
      )}
      {active && (
        <View
          pointerEvents="none"
          style={[
            styles.tooltip,
            { left: Math.max(0, Math.min((active.x ?? 0) - 50, width - 100)) },
          ]}
        >
          <Text style={styles.tooltipText}>{formatUsd(active.value)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    top: -6,
    width: 100,
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tooltipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
});
