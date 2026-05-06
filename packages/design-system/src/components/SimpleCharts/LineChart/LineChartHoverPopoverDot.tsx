import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import type { ChartColor } from '../types';
import { lineChartHoverPopoverDotClasses } from './classes';
import { resolveSeriesColor } from './constants';

export interface LineChartHoverPopoverDotProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
  /**
   * Dot colour. Either a built-in palette token (`'brand'`, `'red'`, …) or any
   * CSS colour string (`'var(--color-violet-500)'`, `'#8b5cf6'`, `'oklch(…)'`).
   * Same shape as `LineChartSeries.color`, so passing `color={series.color}`
   * keeps the dot in sync with its line. Consumer-supplied
   * `style.backgroundColor` still wins when present.
   */
  color?: ChartColor | (string & {});
}

export const LineChartHoverPopoverDot: FC<LineChartHoverPopoverDotProps> = ({
  color,
  className,
  style,
  ref,
  ...props
}) => {
  const backgroundColor = style?.backgroundColor ?? resolveSeriesColor(color);

  return (
    <span
      {...props}
      ref={ref}
      data-slot='line-chart-hover-popover-dot'
      aria-hidden='true'
      className={cn(lineChartHoverPopoverDotClasses, className)}
      style={{ ...style, backgroundColor }}
    />
  );
};

LineChartHoverPopoverDot.displayName = 'LineChartHoverPopoverDot';
