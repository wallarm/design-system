import { createContext, type ReactNode, useContext } from 'react';
import type { CalendarType } from './types';

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
