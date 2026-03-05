import { DatePicker } from '@ark-ui/react/date-picker';
import type { FC } from 'react';
import { ChevronLeft } from '../../../../icons/ChevronLeft';
import { DropdownMenuSeparator } from '../../../DropdownMenu';
import { DayView } from './DayView';
import { MonthView } from './MonthView';
import { YearView } from './YearView';

export interface DateCalendarProps {
  onSelect: (isoString: string) => void;
  onRangeSelect?: (from: string, to: string) => void;
  onBack: () => void;
  onEscape: () => void;
  betweenLabel?: string;
  range?: boolean;
}

export const DateCalendar: FC<DateCalendarProps> = ({ onSelect, onRangeSelect, onBack, onEscape, betweenLabel, range = false }) => {
  const handleValueChange = (details: { value: unknown[] }) => {
    if (range && onRangeSelect && details.value.length >= 2) {
      onRangeSelect(String(details.value[0]), String(details.value[1]));
      return;
    }
    if (!range && details.value.length > 0) {
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
        onClick={(e) => {
          e.stopPropagation();
          onBack();
        }}
      >
        <ChevronLeft />
        <span>Back</span>
      </button>
      <DropdownMenuSeparator />

      {betweenLabel && (
        <div className='px-8 py-4 text-xs font-medium text-text-secondary'>
          {betweenLabel}
        </div>
      )}

      <div className='p-8'>
        <DatePicker.Root
          open
          closeOnSelect={false}
          selectionMode={range ? 'range' : 'single'}
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
