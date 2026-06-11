import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { DatePicker } from '@ark-ui/react';
import type { TestableProps } from '../../utils/testId';

export interface CalendarTriggerProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, 'children' | 'color'>,
    TestableProps {
  /** Trigger element that opens the calendar popover */
  children: ReactNode;
  /** Additional props passed to the trigger wrapper */
  asChild?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Trigger element that opens the calendar popover.
 * Wraps children with Ark UI DatePicker.Trigger.
 *
 * Arbitrary HTML attributes (`data-analytics-id`, `data-analytics-props`,
 * `data-testid`, `aria-*`, `id`) are forwarded to Ark's Trigger and reach
 * the final rendered child via `asChild` slot merge.
 */
export const CalendarTrigger = ({
  children,
  asChild = true,
  ref,
  ...rest
}: CalendarTriggerProps) => (
  <DatePicker.Control>
    <DatePicker.Trigger {...rest} ref={ref} asChild={asChild}>
      {children}
    </DatePicker.Trigger>
  </DatePicker.Control>
);

CalendarTrigger.displayName = 'CalendarTrigger';
