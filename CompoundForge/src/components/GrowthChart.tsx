import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors } from '@/theme';

export type ChartPoint = { x: number; balance: number };

function toScreenPoints(points: ChartPoint[], w: number, h: number, pad: number, min: number, max: number) {
  const span = points.length > 1 ? points[points.length - 1].x - points[0].x : 1;
  const range = Math.max(max - min, 0.01);
  const originX = points[0].x;
  return points.map((p) => ({
    x: pad + ((p.x - originX) / (span || 1)) * (w - pad * 2),
    y: h - pad - ((p.balance - min) / range) * (h - pad * 2),
  }));
}

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`;
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const midX = (pts[i].x + pts[i + 1].x) / 2;
    const midY = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q${pts[i].x},${pts[i].y} ${midX},${midY}`;
  }
  const last = pts[pts.length - 1];
  d += ` L${last.x},${last.y}`;
  return d;
}

type Props = {
  history: ChartPoint[];
  projection: ChartPoint[];
  width: number;
  height: number;
  goal?: number;
};

export function GrowthChart({ history, projection, width, height, goal }: Props) {
  const pad = 14;
  const all = [...history, ...projection];
  if (all.length === 0) {
    return <View style={{ width, height }} />;
  }
  const values = all.map((p) => p.balance).concat(goal ? [goal] : []);
  const min = Math.min(...values) * 0.98;
  const max = Math.max(...values) * 1.04;

  const combined = [...history, ...projection];
  const allScreen = toScreenPoints(combined, width, height, pad, min, max);
  const historyScreen = allScreen.slice(0, history.length);
  const projectionScreen = allScreen.slice(Math.max(history.length - 1, 0));

  const historyPath = smoothPath(historyScreen);
  const projectionPath = smoothPath(projectionScreen);
  const lastHistoryPoint = historyScreen[historyScreen.length - 1];

  const areaPath = historyScreen.length > 0
    ? `${historyPath} L${historyScreen[historyScreen.length - 1].x},${height - pad} L${historyScreen[0].x},${height - pad} Z`
    : '';

  const goalY = goal ? height - pad - ((goal - min) / Math.max(max - min, 0.01)) * (height - pad * 2) : null;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.mint} stopOpacity={0.35} />
          <Stop offset="1" stopColor={colors.mint} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {goalY !== null && (
        <Line x1={pad} y1={goalY} x2={width - pad} y2={goalY} stroke={colors.gold} strokeOpacity={0.5} strokeDasharray="4,5" strokeWidth={1.5} />
      )}
      {areaPath ? <Path d={areaPath} fill="url(#areaFill)" /> : null}
      {historyPath ? <Path d={historyPath} stroke={colors.mint} strokeWidth={2.6} fill="none" strokeLinecap="round" /> : null}
      {projection.length > 0 ? (
        <Path d={projectionPath} stroke={colors.violet} strokeWidth={2} strokeDasharray="1,7" strokeLinecap="round" fill="none" />
      ) : null}
      {lastHistoryPoint ? (
        <Circle cx={lastHistoryPoint.x} cy={lastHistoryPoint.y} r={4.5} fill={colors.mint} stroke={colors.bg} strokeWidth={2} />
      ) : null}
    </Svg>
  );
}
