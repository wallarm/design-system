import type { FC, HTMLAttributes, Ref } from 'react';

import { useTestId } from '../../../utils/testId';
import { ChartHoverCard } from '../internal/ChartHoverCard';

export interface LineChartHoverPopoverProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

/**
 * The line chart's hover popover — the shared `ChartHoverCard` surface with tooltip
 * semantics (`role='tooltip'` + `aria-live`), positioned by the plotting-library tooltip.
 */
export const LineChartHoverPopover: FC<LineChartHoverPopoverProps> = ({ ref, ...props }) => {
  const testId = useTestId('hover-popover');

  return (
    <ChartHoverCard ref={ref} role='tooltip' aria-live='polite' data-testid={testId} {...props} />
  );
};

LineChartHoverPopover.displayName = 'LineChartHoverPopover';
