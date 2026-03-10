import { type FC, useEffect, useMemo, useState } from 'react';
import { type DateValue, DatePicker, parseDate } from '@ark-ui/react/date-picker';
import { ChevronLeft } from '../../../../icons/ChevronLeft';
import { DropdownMenuSeparator } from '../../../DropdownMenu';
import { DayView } from './DayView';
import { MonthView } from './MonthView';
import { YearView } from './YearView';

/** Safely parse a date string (ISO or locale format) into a DateValue. */
const tryParseDateValue = (value: string | undefined): DateValue | undefined => {
  if (!value || value.length < 6) return undefined;
  try {
    // Try ISO format first (e.g. "2026-03-06"), then native Date (e.g. "Mar 6, 2026")
    return parseDate(value);
  } catch {
    try {
      return parseDate(new Date(value));
    } catch {
      return undefined;
    }
  }
};

export interface DateCalendarProps {
  onSelect: (isoString: string) => void;
  onRangeSelect?: (from: string, to: string) => void;
  onBack: () => void;
  onEscape: () => void;
  betweenLabel?: string;
  range?: boolean;
  /** ISO date string for the initially selected date */
  initialValue?: string;
  /** Live text from segment inline edit — calendar navigates to valid dates */
  filterText?: string;
}

export const DateCalendar: FC<DateCalendarProps> = ({
  onSelect,
  onRangeSelect,
  onBack,
  onEscape,
  betweenLabel,
  range = false,
  initialValue,
  filterText,
}) => {
  const parsedInitial = useMemo(() => tryParseDateValue(initialValue), [initialValue]);
  const [selectedValue, setSelectedValue] = useState<DateValue | undefined>(parsedInitial);

  // Reset selectedValue when initialValue changes (e.g. reopening with different date)
  useEffect(() => {
    setSelectedValue(parsedInitial);
  }, [parsedInitial]);

  // Parse filterText into a DateValue for focused navigation
  const parsedFilter = useMemo(() => tryParseDateValue(filterText), [filterText]);
  // Navigate calendar to the typed date, or fall back to selection / initial
  const focusedValue = parsedFilter ?? selectedValue ?? parsedInitial;

  const value = useMemo(
    () => (selectedValue ? [selectedValue] : parsedInitial ? [parsedInitial] : undefined),
    [selectedValue, parsedInitial],
  );

  const handleValueChange = (details: { value: DateValue[] }) => {
    if (range && onRangeSelect && details.value.length >= 2) {
      onRangeSelect(String(details.value[0]), String(details.value[1]));
      return;
    }
    if (!range && details.value.length > 0) {
      setSelectedValue(details.value[0]);
      onSelect(String(details.value[0]));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onEscape();
    }
  };

  return (
    <div onKeyDown={handleKeyDown}>
      <button
        type='button'
        className='flex items-center gap-4 px-8 py-6 text-sm text-text-secondary hover:text-text-primary w-full'
        onClick={e => {
          e.stopPropagation();
          onBack();
        }}
      >
        <ChevronLeft />
        <span>Back</span>
      </button>
      <DropdownMenuSeparator />

      {betweenLabel && (
        <div className='px-8 py-4 text-xs font-medium text-text-secondary'>{betweenLabel}</div>
      )}

      <div className='p-8'>
        <DatePicker.Root
          open
          closeOnSelect={false}
          selectionMode={range ? 'range' : 'single'}
          value={value}
          focusedValue={focusedValue}
          onValueChange={handleValueChange}
        >
          <DatePicker.Content>
            <DayView />
            <MonthView />
            <YearView />
          </DatePicker.Content>
        </DatePicker.Root>
      </div>
    </div>
  );
};
