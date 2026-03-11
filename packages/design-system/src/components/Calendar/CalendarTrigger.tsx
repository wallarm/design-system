import { forwardRef, type ReactNode } from 'react';
import { DatePicker } from '@ark-ui/react';

export interface CalendarTriggerProps {
  /** Trigger element that opens the calendar popover */
  children: ReactNode;
  /** Additional props passed to the trigger wrapper */
  asChild?: boolean;
}

/**
 * Trigger element that opens the calendar popover.
 * Wraps children with Ark UI DatePicker.Trigger.
 */
export const CalendarTrigger = forwardRef<HTMLButtonElement, CalendarTriggerProps>(
  ({ children, asChild = true }, ref) => (
    <DatePicker.Control>
      <DatePicker.Trigger ref={ref} asChild={asChild}>
        {children}
      </DatePicker.Trigger>
    </DatePicker.Control>
  ),
);

CalendarTrigger.displayName = 'CalendarTrigger';
