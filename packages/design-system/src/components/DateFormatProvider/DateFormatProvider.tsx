import type { FC, ReactNode } from 'react';
import { DateFormatContext, type DateOrder } from './context';

export interface DateFormatProviderProps {
  /**
   * Order in which date segments render across every DS temporal input and
   * the calendar. Set once at the app root.
   */
  order: DateOrder;
  children: ReactNode;
}

/**
 * Application-level provider for date segment ordering.
 *
 * Mount once near the root — DateInput, DateRangeInput, TimeInput (time-only
 * rendering is unaffected), and Calendar all pick up the chosen order via
 * `useDateFormat`. If no provider is mounted, DS defaults to `day-first`.
 *
 * @example
 * <DateFormatProvider order='month-first'>
 *   <App />
 * </DateFormatProvider>
 */
export const DateFormatProvider: FC<DateFormatProviderProps> = ({ order, children }) => (
  <DateFormatContext.Provider value={{ order }}>{children}</DateFormatContext.Provider>
);

DateFormatProvider.displayName = 'DateFormatProvider';
