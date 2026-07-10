import type { FC, HTMLAttributes, Ref } from 'react';
import { ChartHoverCard } from '../internal/ChartHoverCard';

export interface LineChartHoverPopoverProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

/**
 * The line chart's hover popover — the shared `ChartHoverCard` surface with tooltip
 * semantics (`role='tooltip'` + `aria-live`), positioned by the plotting-library tooltip.
 */
export const LineChartHoverPopover: FC<LineChartHoverPopoverProps> = ({ ref, ...props }) => (
  <ChartHoverCard ref={ref} role='tooltip' aria-live='polite' {...props} />
);

LineChartHoverPopover.displayName = 'LineChartHoverPopover';
