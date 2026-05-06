import type { FC } from 'react';
import { CartesianGrid } from 'recharts';
import { LINE_GRID_DASHARRAY } from './constants';
import { dropEdgeGridLines } from './lib/dropEdgeGridLines';
import { tickHorizontalCoordinates } from './lib/tickHorizontalCoordinates';

export interface LineChartGridProps {
  /** Render vertical grid lines in addition to the default horizontal ones. */
  vertical?: boolean;
  /**
   * Keep the topmost horizontal grid line unconditionally. By default the line
   * is dropped only when it would visually crowd the chart's top edge — see
   * {@link dropEdgeGridLines} for the threshold (Figma "no top x-line" rule).
   */
  keepTopLine?: boolean;
  /**
   * Keep the bottommost horizontal grid line. By default the line is dropped
   * because the solid `<LineChartXAxis>` axis line owns the bottom rail — set
   * to `true` when the X-axis line is hidden and the grid should draw the
   * bottom rail itself.
   */
  keepBottomLine?: boolean;
}

// Recharts requires `<CartesianGrid>` to be a direct child of `<RechartsLineChart>`
// — but in v3 every recharts primitive self-registers via Redux dispatch, so
// rendering it from inside this wrapper still works.
export const LineChartGrid: FC<LineChartGridProps> = ({
  vertical = false,
  keepTopLine = false,
  keepBottomLine = false,
}) => (
  <CartesianGrid
    strokeDasharray={LINE_GRID_DASHARRAY}
    stroke='var(--color-border-primary-light)'
    vertical={vertical}
    horizontal={dropEdgeGridLines({ keepTop: keepTopLine, keepBottom: keepBottomLine })}
    horizontalCoordinatesGenerator={tickHorizontalCoordinates}
  />
);

LineChartGrid.displayName = 'LineChartGrid';
