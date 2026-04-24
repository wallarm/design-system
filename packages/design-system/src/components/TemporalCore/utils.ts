import { MONTH_NAMES as MONTH_NAMES_LONG } from '../Calendar/const';

// Derive short month names (first 3 chars) from long names
const MONTH_NAMES = MONTH_NAMES_LONG.map(name => name.slice(0, 3));

export function getMonthName(monthNumber: number): string {
  const index = monthNumber - 1;
  return MONTH_NAMES[index] || String(monthNumber);
}

export function getMonthSegmentText(value: number | null, placeholder = 'MM'): string {
  if (value === null || value === undefined) {
    return placeholder;
  }

  return getMonthName(value);
}

export type TemporalGranularity = 'day' | 'hour' | 'minute' | 'second';

interface DefaultPlaceholderOptions {
  granularity?: TemporalGranularity;
  isRange?: boolean;
  isTimeOnly?: boolean;
}

export function getDefaultTemporalPlaceholder({
  granularity,
  isRange = false,
  isTimeOnly = false,
}: DefaultPlaceholderOptions): string {
  if (isTimeOnly) return 'Select time';
  if (granularity === 'day' || granularity === undefined) {
    return isRange ? 'Select a date range' : 'Select a date';
  }
  return isRange ? 'Select date and time range' : 'Select date and time';
}
