import type { FC } from 'react';
import { CartesianGrid } from 'recharts';
import type { VerticalCoordinatesGenerator } from 'recharts/types/cartesian/CartesianGrid';
import { LINE_GRID_DASHARRAY } from '../LineChart/constants';

/**
 * One dashed line per value tick, except the one on zero — the bars start there (the same rule
 * `LineChartGrid` applies to the bottom line).
 */
const valueTickCoordinates: VerticalCoordinatesGenerator = ({ xAxis, offset }) => {
  if (!xAxis) return [];
  const { scale } = xAxis;
  const tickValues = xAxis.niceTicks ?? xAxis.ticks;
  if (!scale || !tickValues?.length) return [];
  const axisX = offset.left ?? 0;
  const coords: number[] = [];
  for (const tick of tickValues) {
    const x = scale.map(tick);
    if (typeof x === 'number' && Number.isFinite(x) && Math.abs(x - axisX) >= 0.5) coords.push(x);
  }
  return coords;
};

/** Optional vertical dashed grid for a visible value scale — `LineChartGrid` turned on its side. */
export const BarChartGrid: FC = () => (
  <CartesianGrid
    strokeDasharray={LINE_GRID_DASHARRAY}
    stroke='var(--color-border-primary-light)'
    horizontal={false}
    verticalCoordinatesGenerator={valueTickCoordinates}
  />
);

BarChartGrid.displayName = 'BarChartGrid';
