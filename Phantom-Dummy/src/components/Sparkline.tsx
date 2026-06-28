import React, { useMemo } from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme';

interface Props {
  data: number[];
  width?: number;
  height?: number;
  up?: boolean;
}

/** Tiny inline trend line shown on each token row. */
export function Sparkline({ data, width = 64, height = 28, up = true }: Props) {
  const path = useMemo(() => {
    if (data.length < 2) return '';
    const lo = Math.min(...data);
    const hi = Math.max(...data);
    const range = hi - lo || 1;
    return data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - lo) / range) * height;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [data, width, height]);

  return (
    <Svg width={width} height={height}>
      <Path d={path} stroke={up ? colors.up : colors.down} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
