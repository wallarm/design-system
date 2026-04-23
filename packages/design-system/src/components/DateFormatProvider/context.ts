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
  /**
   * App-wide hour cycle — `12` (AM/PM) or `24`. When `undefined`, the
   * browser locale decides (react-aria's default).
   *
   * Individual inputs can still override with an `hourCycle` prop for
   * per-component exceptions. Precedence: prop > context > locale.
   */
  hourCycle?: 12 | 24;
}

export const DateFormatContext = createContext<DateFormatContextValue | undefined>(undefined);
