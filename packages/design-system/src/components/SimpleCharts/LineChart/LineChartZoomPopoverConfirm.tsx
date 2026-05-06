import type { ButtonHTMLAttributes, FC, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { lineChartZoomPopoverConfirmClasses } from './classes';

export interface LineChartZoomPopoverConfirmProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
}

export const LineChartZoomPopoverConfirm: FC<LineChartZoomPopoverConfirmProps> = ({
  ref,
  className,
  children,
  type = 'button',
  ...props
}) => {
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      data-slot='line-chart-zoom-popover-confirm'
      // The popover is keyboard-confirmable via Enter even when focus is not
      // inside the button (the chart body / page body stays focused). The
      // shortcut is surfaced via aria-keyshortcuts so screen readers announce it.
      aria-keyshortcuts='Enter'
      className={cn(lineChartZoomPopoverConfirmClasses, className)}
    >
      {children}
    </button>
  );
};

LineChartZoomPopoverConfirm.displayName = 'LineChartZoomPopoverConfirm';
