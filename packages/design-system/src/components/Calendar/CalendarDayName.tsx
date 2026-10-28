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
      'h-24 w-40',
      'font-mono text-xs leading-xs font-medium',
      'text-center text-text-secondary',
    )}
  />
);

CalendarDayName.displayName = 'CalendarDayName';
