import type { ReactNode } from 'react';
import { format, isValid } from 'date-fns';
import { formatTimezone } from '../../../utils/formatDateTime';
import type { DateOrder } from '../../DateFormatProvider/context';

export type ChartTimeOrder = DateOrder;

export type ChartHourCycle = 12 | 24;

export interface ChartTimeFormatterOptions {
  order?: ChartTimeOrder;
  hourCycle?: ChartHourCycle;
}

const toDate = (value: unknown): Date | null => {
  if (value instanceof Date) return isValid(value) ? value : null;
  if (typeof value === 'number' || typeof value === 'string') {
    const d = new Date(value);
    return isValid(d) ? d : null;
  }
  return null;
};

const datePattern = (order: ChartTimeOrder, withYear: boolean): string => {
  if (order === 'month-first') return withYear ? 'MMM d, yyyy' : 'MMM d';
  return withYear ? 'd MMM, yyyy' : 'd MMM';
};

const timePattern = (hourCycle: ChartHourCycle, withSeconds: boolean): string => {
  if (hourCycle === 12) return withSeconds ? 'h:mm:ss a' : 'h:mm a';
  return withSeconds ? 'HH:mm:ss' : 'HH:mm';
};

/** `14:32` (24h) / `2:32 PM` (12h). Empty string for invalid input. */
export const formatChartHour = (
  value: unknown,
  options: { hourCycle?: ChartHourCycle } = {},
): string => {
  const date = toDate(value);
  if (!date) return '';
  return format(date, timePattern(options.hourCycle ?? 24, false));
};

/** `24 Jan` (day-first) / `Jan 24` (month-first). Year is omitted — axis space is precious. */
export const formatChartDate = (
  value: unknown,
  options: { order?: ChartTimeOrder } = {},
): string => {
  const date = toDate(value);
  if (!date) return '';
  return format(date, datePattern(options.order ?? 'day-first', false));
};

/** Combined `24 Jan 14:32`. Respects both `order` and `hourCycle`. */
export const formatChartDateTime = (
  value: unknown,
  options: ChartTimeFormatterOptions = {},
): string => {
  const date = toDate(value);
  if (!date) return '';
  const { order = 'day-first', hourCycle = 24 } = options;
  return format(date, `${datePattern(order, false)} ${timePattern(hourCycle, false)}`);
};

/** `GMT±N` / `UTC`. Delegates to the shared `utils/formatDateTime` helper. */
export const formatChartTimezone = (value: unknown): string => {
  const date = toDate(value);
  return date ? formatTimezone(date) : '';
};

/**
 * Wrap a string formatter so it appends a dimmed timezone chip. Returns a
 * `ReactNode` so it can be passed to tooltip / zoom-popover slots.
 */
export const withTimezoneChip = (
  formatter: (value: unknown) => string,
): ((value: unknown) => ReactNode) => {
  return (value: unknown): ReactNode => {
    const date = toDate(value);
    if (!date) return null;
    const main = formatter(value);
    if (!main) return null;
    const tz = formatTimezone(date);
    return (
      <>
        {main} <span className='text-text-secondary'>{tz}</span>
      </>
    );
  };
};
