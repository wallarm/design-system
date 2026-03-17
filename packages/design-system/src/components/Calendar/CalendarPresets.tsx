import { type FC, type ReactNode, useEffect } from 'react';
import { DatePicker, type UseDatePickerReturn } from '@ark-ui/react';
import { cn } from '../../utils/cn';
import { ScrollArea } from '../ScrollArea/ScrollArea';
import { ScrollAreaContent } from '../ScrollArea/ScrollAreaContent';
import { ScrollAreaScrollbar } from '../ScrollArea/ScrollAreaScrollbar';
import { ScrollAreaViewport } from '../ScrollArea/ScrollAreaViewport';
import { DEFAULT_RANGE_PRESETS, DEFAULT_SINGLE_PRESETS } from './Calendar';
import { useCalendarContext } from './CalendarContext';
import { CalendarPresetItem } from './CalendarPresetItem';
import type { DateRangePreset, PresetConfig } from './types';

export interface CalendarPresetsProps {
  /** Children preset items for custom presets */
  children?: ReactNode;
  /** Array of preset configurations. Defaults to DEFAULT_SINGLE_PRESETS or DEFAULT_RANGE_PRESETS based on calendar type */
  presets?: PresetConfig[];
  /** Whether to show keyboard shortcuts next to presets */
  showShortcuts?: boolean;
  /** Additional className for styling */
  className?: string;
}

/** Registers global keyboard shortcuts for preset selection */
const KeyboardShortcutHandler: FC<{
  presets: PresetConfig[];
  api: UseDatePickerReturn;
}> = ({ presets, api }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = event.key.toUpperCase();
      const preset = presets.find(p => p.shortcut?.toUpperCase() === key);

      if (preset) {
        if (typeof preset.value === 'string') {
          const rangeValue = api.getRangePresetValue(preset.value as DateRangePreset);
          api.setValue(rangeValue);
        } else {
          api.setValue(preset.value);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [api, presets]);

  return null;
};

/**
 * Sidebar panel with quick date selection presets.
 * Can receive preset items as children or via presets prop.
 * Automatically registers keyboard shortcuts when presets have shortcut keys.
 *
 * @example
 * // Using children
 * <CalendarPresets>
 *   <CalendarPresetItem label="Today" value={[today]} shortcut="T" />
 *   <CalendarPresetItem label="Yesterday" value={[yesterday]} shortcut="Y" />
 * </CalendarPresets>
 *
 * @example
 * // Using presets prop
 * <CalendarPresets presets={presetsArray} />
 *
 * @example
 * // Using default presets (auto-selected based on calendar type)
 * <CalendarPresets />
 */
export const CalendarPresets: FC<CalendarPresetsProps> = ({
  children,
  presets: presetsProp,
  showShortcuts = true,
  className,
}) => {
  const { isRange } = useCalendarContext();
  const presets =
    presetsProp ??
    (children ? undefined : isRange ? DEFAULT_RANGE_PRESETS : DEFAULT_SINGLE_PRESETS);

  return (
    <div
      className={cn(
        'flex flex-col',
        'w-182 py-4 px-4',
        'border-r border-border-primary-light',
        className,
      )}
    >
      {presets && (
        <DatePicker.Context>
          {api => <KeyboardShortcutHandler presets={presets} api={api} />}
        </DatePicker.Context>
      )}
      <ScrollArea>
        <ScrollAreaViewport>
          <ScrollAreaContent className='px-4 py-4'>
            <div className='flex flex-col gap-1'>
              {children ??
                presets?.map(preset => (
                  <CalendarPresetItem
                    key={preset.label}
                    label={preset.label}
                    value={preset.value}
                    shortcut={preset.shortcut}
                    showShortcut={showShortcuts}
                  />
                ))}
            </div>
          </ScrollAreaContent>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar />
      </ScrollArea>
    </div>
  );
};

CalendarPresets.displayName = 'CalendarPresets';
