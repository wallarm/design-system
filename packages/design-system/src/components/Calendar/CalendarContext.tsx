import { createContext, type ReactNode, type RefObject, useContext } from 'react';
import type { CalendarType, DateValue } from './types';

export interface CalendarContextValue {
  /** Calendar type: 'single' for one month, 'range' for two months (date range selection) */
  type: CalendarType;
  /** Whether calendar is in range selection mode */
  isRange: boolean;
  /** Whether to show keyboard shortcut hints */
  showKeyboardHints: boolean;
  /** Whether to show time selection */
  showTime: boolean;
  /** Whether calendar is readonly (display only, no selection) */
  readonly: boolean;
  /**
   * Last-known time-of-day, owned by `Calendar`. In `showTime` mode the grid
   * only produces date-only values; this ref carries the hour/minute so they
   * survive a day change and so `Calendar`'s `onChange` can emit a full
   * `CalendarDateTime`. Undefined outside a `Calendar`.
   */
  timeRef?: RefObject<{ hour: number; minute: number }>;
  /**
   * Push a value straight to the consumer `onChange`, bypassing Ark's machine.
   * Ark's DatePicker dedupes its value by date (year/month/day) and silently
   * drops a same-date, time-only change, so the `showTime` header uses this to
   * commit a time edit. Undefined outside a `Calendar`.
   */
  commitValue?: (value: DateValue[]) => void;
}

/** Default context values when used outside Calendar component */
const defaultContextValue: CalendarContextValue = {
  type: 'single',
  isRange: false,
  showKeyboardHints: true,
  showTime: false,
  readonly: false,
};

const CalendarContext = createContext<CalendarContextValue>(defaultContextValue);

export interface CalendarProviderProps {
  children: ReactNode;
  value: CalendarContextValue;
}

export const CalendarProvider = ({ children, value }: CalendarProviderProps) => (
  <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
);

/**
 * Hook to access Calendar context.
 * Returns default values if used outside Calendar component.
 */
export const useCalendarContext = (): CalendarContextValue => useContext(CalendarContext);

CalendarProvider.displayName = 'CalendarProvider';
