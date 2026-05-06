import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { lineChartZoomPopoverClasses } from './classes';

export interface LineChartZoomPopoverProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export const LineChartZoomPopover: FC<LineChartZoomPopoverProps> = ({
  ref,
  className,
  children,
  ...props
}) => {
  return (
    <div
      {...props}
      ref={ref}
      data-slot='line-chart-zoom-popover'
      role='dialog'
      // Non-modal: focus stays on the brush traveller / surrounding page; the
      // popover is a transient affordance, not a focus trap.
      aria-modal='false'
      className={cn(lineChartZoomPopoverClasses, className)}
    >
      {children}
    </div>
  );
};

LineChartZoomPopover.displayName = 'LineChartZoomPopover';
