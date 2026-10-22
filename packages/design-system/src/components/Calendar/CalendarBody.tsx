import type { FC, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';

export interface CalendarBodyProps {
  /** Content to render (InputHeader, Grid(s), etc.) */
  children: ReactNode;
  /** Additional className for styling */
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Container for the main calendar body content.
 * Wraps InputHeader, Grid(s), and optionally Footer.
 */
export const CalendarBody: FC<CalendarBodyProps> = ({ ref, children, className }) => (
  <div ref={ref} className={cn('flex flex-col', className)}>
    {children}
  </div>
);

CalendarBody.displayName = 'CalendarBody';
