import { useContext } from 'react';
import { DateFormatContext, type DateFormatContextValue } from './context';

const DEFAULT_DATE_FORMAT: DateFormatContextValue = { order: 'day-first' };

/**
 * Read the active date-segment order.
 *
 * Does **not** throw when called outside `DateFormatProvider` — formats are
 * an optional app-level concern, so the hook falls back to `day-first`.
 * This keeps every DS temporal input working out of the box in apps that
 * haven't mounted the provider.
 */
export const useDateFormat = (): DateFormatContextValue =>
  useContext(DateFormatContext) ?? DEFAULT_DATE_FORMAT;
