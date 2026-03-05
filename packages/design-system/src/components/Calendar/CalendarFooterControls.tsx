import { forwardRef, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface CalendarFooterControlsProps {
  /** Children to render (typically Reset and Apply buttons) */
  children: ReactNode;
  /** Additional className for styling */
  className?: string;
}

/**
 * Container for footer action buttons.
 * Positions buttons to the right with consistent spacing.
 */
export const CalendarFooterControls = forwardRef<HTMLDivElement, CalendarFooterControlsProps>(
  ({ children, className }, ref) => (
    <div ref={ref} className={cn('flex items-center gap-10 ml-auto', className)}>
      {children}
    </div>
  ),
);

CalendarFooterControls.displayName = 'CalendarFooterControls';
