import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds,
  differenceInWeeks,
  differenceInYears,
  format,
  isValid,
} from 'date-fns';
import type { DateOrder } from '../components/DateFormatProvider/context';

/**
 * App-level date preferences, as `DateFormatProvider` models them.
 *
 * The formatters below take them as an argument rather than reading the
 * context, so they stay pure and usable outside React; `FormatDateTime` is
 * what feeds them the active values. Omitted, each falls back to the shape
 * these functions have always produced — day-first, 24-hour.
 */
export interface DateTimeFormatOptions {
  order?: DateOrder;
  hourCycle?: 12 | 24;
}

/** `d MMM` / `MMM d`, per the app's segment order. */
const dayMonth = (order: DateOrder | undefined): string =>
  order === 'month-first' ? 'MMM d' : 'd MMM';

/** `d MMM, yyyy` / `MMM d, yyyy`. The year stays last in both orders. */
const dayMonthYear = (order: DateOrder | undefined): string => `${dayMonth(order)}, yyyy`;

/** 24-hour `HH:mm[:ss]`, or 12-hour `hh:mm[:ss] a`. */
const timePattern = (hourCycle: 12 | 24 | undefined, showSeconds: boolean): string => {
  const seconds = showSeconds ? ':ss' : '';
  return hourCycle === 12 ? `hh:mm${seconds} a` : `HH:mm${seconds}`;
};

/**
 * Format a date as relative time for table cells.
 *
 * Granularity (from the Date & timestamp display guide):
 * - 0–59 sec → "Just now"
 * - 1–59 min → "{n} min ago"
 * - 1–23 h → "{n} hours ago" / "1 hour ago"
 * - 24–47 h → "Yesterday, {HH:mm}"
 * - 2–6 days → "{n} days ago"
 * - 7–13 days → "1 week ago"
 * - 14–27 days → "{n} weeks ago"
 * - 28–149 days → "{n} months ago"
 * - 150 days – 11 months → "{d} {MMM}"
 * - ≥ 12 months → "{d} {MMM}, {yyyy}"
 *
 * Future dates are treated as "Just now" (clock skew tolerance).
 */
export const formatRelativeTime = (
  date: Date,
  now: Date = new Date(),
  options: DateTimeFormatOptions = {},
): string => {
  if (!isValid(date)) return '—';

  const seconds = differenceInSeconds(now, date);

  // Future date → Just now
  if (seconds < 0) return 'Just now';
  if (seconds < 60) return 'Just now';

  const minutes = differenceInMinutes(now, date);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = differenceInHours(now, date);
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;

  const days = differenceInDays(now, date);
  if (days < 2) return `Yesterday, ${format(date, timePattern(options.hourCycle, false))}`;
  if (days < 7) return `${days} days ago`;

  const weeks = differenceInWeeks(now, date);
  if (days < 14) return '1 week ago';
  if (days < 28) return `${weeks} weeks ago`;

  const months = differenceInMonths(now, date);
  if (days < 150) return months === 1 ? '1 month ago' : `${months} months ago`;

  if (differenceInYears(now, date) < 1) return format(date, dayMonth(options.order));

  return format(date, dayMonthYear(options.order));
};

/**
 * Format a date as absolute time for tooltips.
 *
 * Output: "11 Feb, 2026 14:32:07 GMT+2"
 */
export const formatAbsoluteTime = (
  date: Date,
  options: DateTimeFormatOptions & { showSeconds?: boolean } = {},
): string => {
  if (!isValid(date)) return '—';
  const { showSeconds = true } = options;
  const formatted = format(
    date,
    `${dayMonthYear(options.order)} ${timePattern(options.hourCycle, showSeconds)}`,
  );
  const tz = formatTimezone(date);
  return `${formatted} ${tz}`;
};

/**
 * Format a date as short absolute date for cells.
 *
 * Output: "11 Feb, 2026"
 */
export const formatAbsoluteDate = (
  date: Date,
  now: Date = new Date(),
  options: DateTimeFormatOptions = {},
): string => {
  if (!isValid(date)) return '—';
  if (date.getFullYear() === now.getFullYear()) return format(date, dayMonth(options.order));
  return format(date, dayMonthYear(options.order));
};

/**
 * Format only the time portion for cells.
 *
 * Output: "14:32 GMT+2"
 */
export const formatTimeOnly = (date: Date, options: DateTimeFormatOptions = {}): string => {
  if (!isValid(date)) return '—';
  return `${format(date, timePattern(options.hourCycle, false))} ${formatTimezone(date)}`;
};

/**
 * Format timezone as "GMT+N" or "UTC".
 */
export const formatTimezone = (date: Date): string => {
  const offset = -date.getTimezoneOffset();
  if (offset === 0) return 'UTC';
  const sign = offset > 0 ? '+' : '-';
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  return minutes === 0
    ? `GMT${sign}${hours}`
    : `GMT${sign}${hours}:${String(minutes).padStart(2, '0')}`;
};
