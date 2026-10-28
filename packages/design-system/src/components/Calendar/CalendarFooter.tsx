import type { FC, ReactNode, Ref } from 'react';

import { cn } from '../../utils/cn';

export interface CalendarFooterProps {
  /** Children to render (buttons, keyboard hints, etc.) */
  children: ReactNode;
  /** Additional className for styling */
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Footer container for the calendar.
 * Accepts children for flexible composition (buttons, keyboard hints, etc.).
 *
 * @example
 * <CalendarFooter>
 *   <CalendarKeyboardHints />
 *   <CalendarResetButton />
 *   <CalendarApplyButton />
 * </CalendarFooter>
 */
export const CalendarFooter: FC<CalendarFooterProps> = ({ ref, children, className }) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-between',
      'h-48 px-12',
      'border-t border-border-primary-light',
      className,
    )}
  >
    {children}
  </div>
);

CalendarFooter.displayName = 'CalendarFooter';
