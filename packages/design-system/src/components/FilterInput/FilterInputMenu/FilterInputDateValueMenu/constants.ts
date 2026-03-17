/** Minimum length of a date string worth parsing (e.g. "1d" is a preset, but "2" is noise) */
export const MIN_DATE_STRING_LENGTH = 6;

export interface DatePreset {
  value: string;
  label: string;
}

/**
 * Relative date presets shown in the date value menu
 */
export const DATE_PRESETS: DatePreset[] = [
  { value: '30m', label: '30 min ago' },
  { value: '1h', label: '1 hour ago' },
  { value: '6h', label: '6 hours ago' },
  { value: '12h', label: '12 hours ago' },
  { value: '1d', label: '1 day ago' },
  { value: '7d', label: '7 days ago' },
  { value: '14d', label: '14 days ago' },
];

/** Check if a value string is a relative date preset (e.g. "30m", "7d") */
export const isDatePreset = (value: string): boolean => /^\d+[mhd]$/.test(value);

/** Format a date string for chip display (e.g. "Mar 4, 2026").
 *  Handles both ISO (YYYY-MM-DD, parsed as UTC) and locale formats (parsed as local time). */
export const formatDateForChip = (value: string): string => {
  // ISO date-only: parse components directly — avoids timezone ambiguity
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (isoMatch) {
    const d = new Date(Date.UTC(+isoMatch[1], +isoMatch[2] - 1, +isoMatch[3]));
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }
  // Locale or other format: native Date parsing, display in local timezone
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/** Get display label for a date value — preset label or formatted date */
export const getDateDisplayLabel = (value: string): string => {
  const preset = DATE_PRESETS.find(p => p.value === value);
  if (preset) return preset.label;
  return isDatePreset(value) ? value : formatDateForChip(value);
};
