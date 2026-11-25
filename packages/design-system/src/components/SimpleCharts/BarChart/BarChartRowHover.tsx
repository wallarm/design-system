import type { FC } from 'react';
import { useChartWidth, usePlotArea } from 'recharts';
import { useTestId } from '../../../utils/testId';

interface BarChartRowHoverProps {
  /** Pointer offset from the top of the plot's SVG, or `null` when the pointer is away. */
  pointerY: number | null;
  /** Number of rows (categories) in the plot. */
  rows: number;
}

/**
 * The `BarList` row hover: the row under the pointer gets the hover tint, edge to edge — label,
 * bar and total. Rows are read off the measured plot area, so a fixed body `height` or a visible
 * value axis keeps the tint on the row.
 */
export const BarChartRowHover: FC<BarChartRowHoverProps> = ({ pointerY, rows }) => {
  const testId = useTestId('row-hover');
  const plot = usePlotArea();
  const width = useChartWidth();

  if (pointerY === null || !plot || !width || rows === 0) return null;

  const rowHeight = plot.height / rows;
  const row = Math.floor((pointerY - plot.y) / rowHeight);
  if (row < 0 || row >= rows) return null;

  return (
    <rect
      x={0}
      y={plot.y + row * rowHeight}
      width={width}
      height={rowHeight}
      fill='var(--color-states-primary-hover)'
      data-slot='bar-chart-row-hover'
      data-testid={testId}
    />
  );
};

BarChartRowHover.displayName = 'BarChartRowHover';
