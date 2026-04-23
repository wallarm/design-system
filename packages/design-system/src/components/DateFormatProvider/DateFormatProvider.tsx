import { type FC, type ReactNode, useMemo } from 'react';
import { DateFormatContext, type DateOrder } from './context';

export interface DateFormatProviderProps {
  /**
   * Order in which date segments render across every DS temporal input and
   * the calendar. Set once at the app root.
   */
  order: DateOrder;
  /**
   * Hour cycle applied to every DS temporal input with time segments and
   * every time dropdown. `12` (AM/PM) or `24`. When omitted, the browser
   * locale decides. Can be overridden per-input via the `hourCycle` prop.
   */
  hourCycle?: 12 | 24;
  children: ReactNode;
}

/**
 * Application-level provider for temporal display format.
 *
 * Mount once near the root — DateInput, DateRangeInput, TimeInput, and
 * Calendar all pick up the chosen `order` and `hourCycle` via
 * `useDateFormat`. If no provider is mounted, DS defaults to `day-first`
 * order and locale-driven hour cycle.
 *
 * @example
 * <DateFormatProvider order='month-first' hourCycle={24}>
 *   <App />
 * </DateFormatProvider>
 */
export const DateFormatProvider: FC<DateFormatProviderProps> = ({ order, hourCycle, children }) => {
  const value = useMemo(() => ({ order, hourCycle }), [order, hourCycle]);
  return <DateFormatContext.Provider value={value}>{children}</DateFormatContext.Provider>;
};

DateFormatProvider.displayName = 'DateFormatProvider';
