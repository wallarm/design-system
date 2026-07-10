import type { FC } from 'react';
import { ChartHoverCardDot, type ChartHoverCardDotProps } from '../internal/ChartHoverCard';

/**
 * The hover popover's series dot — the shared `ChartHoverCardDot`. `color` accepts a palette
 * token or any CSS colour, so `color={series.color}` keeps the dot in sync with its line.
 */
export type LineChartHoverPopoverDotProps = ChartHoverCardDotProps;

export const LineChartHoverPopoverDot: FC<LineChartHoverPopoverDotProps> = props => (
  <ChartHoverCardDot {...props} />
);

LineChartHoverPopoverDot.displayName = 'LineChartHoverPopoverDot';
