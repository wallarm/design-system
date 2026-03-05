import type { FC } from 'react';
import { DatePicker } from '@ark-ui/react';
import { cn } from '../../utils/cn';

/**
 * Day name header cell (e.g., Mon, Tue, Wed).
 * Used in the weekday header row of the calendar grid.
 */
export const CalendarDayName: FC = () => (
  <DatePicker.TableHeader
    className={cn(
      'w-40 h-24',
      'font-mono font-medium text-xs leading-xs',
      'text-text-secondary text-center',
    )}
  />
);

CalendarDayName.displayName = 'CalendarDayName';
