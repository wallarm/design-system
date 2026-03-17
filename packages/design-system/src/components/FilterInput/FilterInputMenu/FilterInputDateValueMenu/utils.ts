import { parseDate } from '@ark-ui/react/date-picker';
import type { DateValue } from '../../../Calendar';
import { MIN_DATE_STRING_LENGTH } from './constants';

/** Safely parse a date string (ISO or locale format) into a DateValue. */
export const tryParseDateValue = (value: string | undefined): DateValue | undefined => {
  if (!value || value.length < MIN_DATE_STRING_LENGTH) return undefined;
  try {
    // Try ISO format first (e.g. "2026-03-06")
    return parseDate(value);
  } catch {
    try {
      // Fallback: try native Date (e.g. "Mar 6, 2026")
      // Use LOCAL date components (getFullYear/getMonth/getDate) — NOT toISOString()
      // which converts to UTC and can shift the date by ±1 day depending on timezone.
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return undefined;
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return parseDate(`${y}-${m}-${d}`);
    } catch {
      return undefined;
    }
  }
};

/** Convert a DateValue to ISO date string (YYYY-MM-DD) */
export const dateValueToIso = (dv: DateValue): string =>
  `${dv.year}-${String(dv.month).padStart(2, '0')}-${String(dv.day).padStart(2, '0')}`;
