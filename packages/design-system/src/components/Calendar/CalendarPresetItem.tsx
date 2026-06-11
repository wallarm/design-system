import type { ButtonHTMLAttributes, FC, MouseEvent } from 'react';
import { DatePicker } from '@ark-ui/react';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
import { useCalendarContext } from './CalendarContext';
import type { DateRangePreset, PresetValue } from './types';

export interface CalendarPresetItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color' | 'type' | 'value'>,
    TestableProps {
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
 *
 * Arbitrary HTML attributes (`data-analytics-id`, `data-analytics-props`,
 * `data-testid`, `aria-*`, `id`, `onClick`) land on the rendered `<button>`.
 * Consumer's `onClick` runs after the internal preset-selection logic
 * (it cannot cancel the selection because the preset semantics are owned
 * by the DS — consumers track *that* the preset was clicked).
 */
export const CalendarPresetItem: FC<CalendarPresetItemProps> = ({
  label,
  value,
  shortcut,
  showShortcut = true,
  onClick: consumerOnClick,
  className,
  disabled: consumerDisabled,
  ...rest
}) => {
  const { readonly } = useCalendarContext();
  const isDisabled = readonly || consumerDisabled;

  return (
    <DatePicker.Context>
      {api => (
        <button
          {...rest}
          type='button'
          disabled={isDisabled}
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            if (isDisabled) return;
            // Use API to set value without triggering close
            if (typeof value === 'string') {
              const rangeValue = api.getRangePresetValue(value as DateRangePreset);
              api.setValue(rangeValue);
            } else {
              api.setValue(value);
            }
            consumerOnClick?.(event);
          }}
          className={cn(
            'flex items-center justify-between',
            'w-full px-8 py-6 rounded-6',
            'font-sans font-normal text-sm leading-sm text-text-primary',
            'select-none',
            'transition-colors',
            'outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
            isDisabled
              ? 'cursor-default opacity-50'
              : 'cursor-pointer hover:bg-states-primary-hover active:bg-states-primary-pressed',
            className,
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
