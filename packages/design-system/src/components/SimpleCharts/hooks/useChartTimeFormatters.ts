import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useDateFormat } from '../../DateFormatProvider/useDateFormat';
import {
  type ChartHourCycle,
  formatChartDate,
  formatChartDateTime,
  formatChartHour,
  formatChartTimezone,
  withTimezoneChip,
} from '../lib/timeFormatters';

export interface ChartTimeFormatters {
  formatHour: (value: unknown) => string;
  formatDate: (value: unknown) => string;
  formatDateTime: (value: unknown) => string;
  formatTimezone: (value: unknown) => string;
  formatHourWithTimezone: (value: unknown) => ReactNode;
  formatDateWithTimezone: (value: unknown) => ReactNode;
  formatDateTimeWithTimezone: (value: unknown) => ReactNode;
  /** `from → to` using `formatDate`. Suitable for `<LineChartZoomBrush formatRange>`. */
  formatDateRange: (range: { from: unknown; to: unknown }) => string;
}

/**
 * Memoised bundle of chart time formatters bound to `DateFormatProvider`
 * settings. Falls back to `day-first` + `hourCycle: 24` when no provider is
 * mounted (mirrors `useDateFormat`).
 */
export const useChartTimeFormatters = (): ChartTimeFormatters => {
  const { order = 'day-first', hourCycle } = useDateFormat();
  const resolvedHourCycle: ChartHourCycle = hourCycle ?? 24;

  return useMemo<ChartTimeFormatters>(() => {
    const formatHour = (value: unknown) => formatChartHour(value, { hourCycle: resolvedHourCycle });
    const formatDate = (value: unknown) => formatChartDate(value, { order });
    const formatDateTime = (value: unknown) =>
      formatChartDateTime(value, { order, hourCycle: resolvedHourCycle });

    return {
      formatHour,
      formatDate,
      formatDateTime,
      formatTimezone: formatChartTimezone,
      formatHourWithTimezone: withTimezoneChip(formatHour),
      formatDateWithTimezone: withTimezoneChip(formatDate),
      formatDateTimeWithTimezone: withTimezoneChip(formatDateTime),
      formatDateRange: ({ from, to }) => `${formatDate(from)} → ${formatDate(to)}`,
    };
  }, [order, resolvedHourCycle]);
};
