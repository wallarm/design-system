import { forwardRef, type ReactNode } from 'react';
import { DatePicker, Portal } from '@ark-ui/react';
import { cn } from '../../utils/cn';

export interface CalendarContentProps {
  /** Content to render inside the calendar popover */
  children: ReactNode;
  /** Additional className for styling */
  className?: string;
}

/**
 * Content container for the calendar popover.
 * Renders within a Portal with positioning and animation.
 */
export const CalendarContent = forwardRef<HTMLDivElement, CalendarContentProps>(
  ({ children, className }, ref) => (
    <Portal>
      <DatePicker.Positioner>
        <DatePicker.Content
          ref={ref}
          className={cn(
            'flex bg-bg-surface-1 rounded-12 shadow-lg',
            'border border-border-primary-light',
            // Animation (same as DropdownMenu/Popover)
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            className,
          )}
        >
          {children}
        </DatePicker.Content>
      </DatePicker.Positioner>
    </Portal>
  ),
);

CalendarContent.displayName = 'CalendarContent';
