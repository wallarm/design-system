import type { FC } from 'react';
import { DatePicker } from '@ark-ui/react';
import { cn } from '../../utils/cn';
import { useCalendarContext } from './CalendarContext';
import type { DateRangePreset, PresetValue } from './types';

interface CalendarPresetItemProps {
  /** Display label for the preset */
  label: string;
  /** Preset value - dates array or named preset string */
  value: PresetValue;
  /** Keyboard shortcut key */
  shortcut?: string;
  /** Whether to display the shortcut badge */
  showShortcut?: boolean;
}

/**
 * Individual preset item in the presets sidebar.
 * Triggers date selection when clicked without closing the calendar.
 */
export const CalendarPresetItem: FC<CalendarPresetItemProps> = ({
  label,
  value,
  shortcut,
  showShortcut = true,
}) => {
  const { readonly } = useCalendarContext();

  return (
    <DatePicker.Context>
      {api => (
        <button
          type='button'
          disabled={readonly}
          onClick={() => {
            if (readonly) return;
            // Use API to set value without triggering close
            if (typeof value === 'string') {
              const rangeValue = api.getRangePresetValue(value as DateRangePreset);
              api.setValue(rangeValue);
            } else {
              api.setValue(value);
            }
          }}
          className={cn(
            'flex items-center justify-between',
            'w-full px-8 py-6 rounded-6',
            'font-sans font-normal text-sm leading-sm text-text-primary',
            'select-none',
            'transition-colors',
            'outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
            readonly
              ? 'cursor-default opacity-50'
              : 'cursor-pointer hover:bg-states-primary-hover active:bg-states-primary-pressed',
          )}
        >
          <span>{label}</span>
          {showShortcut && shortcut && (
            <span
              className={cn(
                'flex items-center justify-center',
                'min-w-20 h-20 px-4',
                'font-mono font-normal text-xs leading-xs',
                'border border-component-border-hotkey rounded-4',
                'bg-bg-surface-2',
              )}
            >
              {shortcut}
            </span>
          )}
        </button>
      )}
    </DatePicker.Context>
  );
};

CalendarPresetItem.displayName = 'CalendarPresetItem';
