import type { DatePicker } from '@ark-ui/react';

export type DateValue = DatePicker.DateValue;

export type CalendarType = 'single' | 'double';

export type DateRangePreset =
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'lastQuarter'
  | 'thisYear'
  | 'lastYear'
  | 'last3Days'
  | 'last7Days'
  | 'last14Days'
  | 'last30Days'
  | 'last90Days';

export type PresetValue = DateValue[] | DateRangePreset;

export interface PresetConfig {
  label: string;
  value: PresetValue;
  shortcut?: string;
}
