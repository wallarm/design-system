import type { HorizontalCoordinatesGenerator } from 'recharts/types/cartesian/CartesianGrid';

/**
 * `<CartesianGrid horizontalCoordinatesGenerator>` that emits one grid line
 * per Y-axis tick.
 *
 * The recharts v3 default skips some ticks (notably the second-from-top) and
 * folds the topmost grid line onto the plot's top edge instead of placing it
 * at the topmost tick. That breaks the one-line-per-label visual contract:
 * a label can appear with no corresponding grid line.
 *
 * Using `yAxis.niceTicks ?? yAxis.ticks` and mapping each through the axis
 * scale produces a grid line at every rendered tick value. `dropEdgeGridLines`
 * then handles top/bottom culling against the resulting coordinates.
 */
export const tickHorizontalCoordinates: HorizontalCoordinatesGenerator = ({ yAxis }) => {
  if (!yAxis) return [];
  const { scale } = yAxis;
  const tickValues = yAxis.niceTicks ?? yAxis.ticks;
  if (!scale || !tickValues?.length) return [];
  const coords: number[] = [];
  for (const tick of tickValues) {
    const y = scale.map(tick);
    if (typeof y === 'number' && Number.isFinite(y)) coords.push(y);
  }
  return coords;
};
