import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  values: number[];
  width: number;
  height: number;
  color: string;
  strokeWidth?: number;
};

export function Sparkline({ values, width, height, color, strokeWidth = 2 }: Props) {
  if (values.length < 2) return <Svg width={width} height={height} />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 0.0001);
  const step = width / (values.length - 1);
  const pad = strokeWidth;
  let d = '';
  values.forEach((v, i) => {
    const x = i * step;
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    d += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
  });
  return (
    <Svg width={width} height={height}>
      <Path d={d} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
