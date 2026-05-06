import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { lineChartHoverPopoverClasses } from './classes';

export interface LineChartHoverPopoverProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export const LineChartHoverPopover: FC<LineChartHoverPopoverProps> = ({
  ref,
  className,
  children,
  ...props
}) => {
  return (
    <div
      {...props}
      ref={ref}
      data-slot='line-chart-hover-popover'
      role='tooltip'
      aria-live='polite'
      className={cn(lineChartHoverPopoverClasses, className)}
    >
      {children}
    </div>
  );
};

LineChartHoverPopover.displayName = 'LineChartHoverPopover';
