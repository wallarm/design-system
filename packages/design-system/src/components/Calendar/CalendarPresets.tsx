import type { FC, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { ScrollArea } from '../ScrollArea/ScrollArea';
import { ScrollAreaContent } from '../ScrollArea/ScrollAreaContent';
import { ScrollAreaScrollbar } from '../ScrollArea/ScrollAreaScrollbar';
import { ScrollAreaViewport } from '../ScrollArea/ScrollAreaViewport';
import { CalendarPresetItem } from './CalendarPresetItem';
import type { PresetConfig } from './types';

export interface CalendarPresetsProps {
  /** Children preset items (compound pattern) or nothing if using presets prop */
  children?: ReactNode;
  /** Array of preset configurations to display (legacy/convenience API) */
  presets?: PresetConfig[];
  /** Whether to show keyboard shortcuts next to presets */
  showShortcuts?: boolean;
  /** Additional className for styling */
  className?: string;
}

/**
 * Sidebar panel with quick date selection presets.
 * Can receive preset items as children (compound pattern) or via presets prop.
 *
 * @example
 * // Compound pattern (preferred)
 * <CalendarPresets>
 *   <CalendarPresetItem label="Today" value={[today]} shortcut="T" />
 *   <CalendarPresetItem label="Yesterday" value={[yesterday]} shortcut="Y" />
 * </CalendarPresets>
 *
 * @example
 * // Legacy/convenience API
 * <CalendarPresets presets={presetsArray} />
 */
export const CalendarPresets: FC<CalendarPresetsProps> = ({
  children,
  presets,
  showShortcuts = true,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col',
      'w-182 py-4 px-4',
      'border-r border-border-primary-light',
      className,
    )}
  >
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

CalendarPresets.displayName = 'CalendarPresets';
