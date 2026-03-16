import { forwardRef, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface CalendarFooterProps {
  /** Children to render (buttons, keyboard hints, etc.) */
  children: ReactNode;
  /** Additional className for styling */
  className?: string;
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
export const CalendarFooter = forwardRef<HTMLDivElement, CalendarFooterProps>(
  ({ children, className }, ref) => (
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
  ),
);

CalendarFooter.displayName = 'CalendarFooter';
