import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { lineChartZoomPopoverRangeClasses } from './classes';

export interface LineChartZoomPopoverRangeProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export const LineChartZoomPopoverRange: FC<LineChartZoomPopoverRangeProps> = ({
  ref,
  className,
  children,
  ...props
}) => {
  return (
    <div
      {...props}
      ref={ref}
      data-slot='line-chart-zoom-popover-range'
      className={cn(lineChartZoomPopoverRangeClasses, className)}
    >
      {children}
    </div>
  );
};

LineChartZoomPopoverRange.displayName = 'LineChartZoomPopoverRange';
