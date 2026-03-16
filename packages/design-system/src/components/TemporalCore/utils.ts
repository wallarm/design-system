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
