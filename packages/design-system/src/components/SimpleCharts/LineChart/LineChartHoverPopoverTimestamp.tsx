import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { lineChartHoverPopoverTimestampClasses } from './classes';

export interface LineChartHoverPopoverTimestampProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export const LineChartHoverPopoverTimestamp: FC<LineChartHoverPopoverTimestampProps> = ({
  ref,
  className,
  children,
  ...props
}) => {
  return (
    <div
      {...props}
      ref={ref}
      data-slot='line-chart-hover-popover-timestamp'
      className={cn(lineChartHoverPopoverTimestampClasses, className)}
    >
      {children}
    </div>
  );
};

LineChartHoverPopoverTimestamp.displayName = 'LineChartHoverPopoverTimestamp';
