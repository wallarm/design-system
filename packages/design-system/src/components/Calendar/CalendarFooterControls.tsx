import type { FC, ReactNode, Ref } from 'react';

import { cn } from '../../utils/cn';

export interface CalendarFooterControlsProps {
  /** Children to render (typically Reset and Apply buttons) */
  children: ReactNode;
  /** Additional className for styling */
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Container for footer action buttons.
 * Positions buttons to the right with consistent spacing.
 */
export const CalendarFooterControls: FC<CalendarFooterControlsProps> = ({
  ref,
  children,
  className,
}) => (
  <div ref={ref} className={cn('ml-auto flex items-center gap-10', className)}>
    {children}
  </div>
);

CalendarFooterControls.displayName = 'CalendarFooterControls';
