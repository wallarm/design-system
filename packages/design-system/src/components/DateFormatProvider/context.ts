import { createContext } from 'react';

/**
 * Order in which date segments are rendered by temporal inputs and the
 * calendar.
 *
 * - `day-first` — "24 Apr, 2026" (segments: DD MMM YYYY)
 * - `month-first` — "Apr 24, 2026" (segments: MMM DD YYYY)
 *
 * Year stays last in both; time segments, when present, are appended after
 * the date with a leading space.
 */
export type DateOrder = 'day-first' | 'month-first';

export interface DateFormatContextValue {
  order: DateOrder;
}

export const DateFormatContext = createContext<DateFormatContextValue | undefined>(undefined);
