import type { RefObject } from 'react';
import { type FC, useCallback, useMemo } from 'react';
import { cn } from '../../../../utils/cn';
import {
  Calendar,
  CalendarBody,
  CalendarFooter,
  CalendarFooterControls,
  CalendarGrids,
  CalendarInputHeader,
  CalendarPresets,
  CalendarResetButton,
  type DateValue,
} from '../../../Calendar';
import { DropdownMenu, DropdownMenuContent } from '../../../DropdownMenu';
import { ApplyButton } from './ApplyButton';
import { dateValueToIso, tryParseDateValue } from './utils';

export interface FilterInputDateValueMenuProps {
  open: boolean;
  onSelect: (value: string) => void;
  onRangeSelect?: (from: string, to: string) => void;
  onOpenChange?: (open: boolean) => void;
  onEscape?: () => void;
  positioning?: Record<string, unknown>;
  /** Enable range selection in the calendar (for "between" operator) */
  range?: boolean;
  /** ISO date string for the initially selected date in the calendar */
  initialValue?: string;
  /** [from, to] ISO date strings for range editing (between operator) */
  initialRangeValue?: [string, string];
  /** Live text from chip inline edit — calendar navigates to valid dates */
  filterText?: string;
  /** Ref to the menu content element — shared across menus for focus management */
  menuRef?: RefObject<HTMLDivElement | null>;
  className?: string;
}

export const FilterInputDateValueMenu: FC<FilterInputDateValueMenuProps> = ({
  open,
  onSelect,
  onRangeSelect,
  onOpenChange,
  onEscape,
  positioning,
  range = false,
  initialValue,
  initialRangeValue,
  filterText,
  menuRef,
  className,
}) => {
  const parsedInitial = useMemo(() => tryParseDateValue(initialValue), [initialValue]);
  const parsedRangeFrom = useMemo(
    () => tryParseDateValue(initialRangeValue?.[0]),
    [initialRangeValue],
  );
  const parsedRangeTo = useMemo(
    () => tryParseDateValue(initialRangeValue?.[1]),
    [initialRangeValue],
  );
  const parsedFilter = useMemo(() => tryParseDateValue(filterText), [filterText]);
  const focusedValue = parsedFilter ?? parsedRangeFrom ?? parsedInitial;
  const defaultValue = useMemo(() => {
    if (range && parsedRangeFrom && parsedRangeTo) {
      return [parsedRangeFrom, parsedRangeTo];
    }
    return parsedInitial ? [parsedInitial] : undefined;
  }, [range, parsedInitial, parsedRangeFrom, parsedRangeTo]);

  const handleApply = useCallback(
    (values: DateValue[]) => {
      const first = values[0];
      const second = values[1];
      if (range && onRangeSelect && first && second) {
        onRangeSelect(dateValueToIso(first), dateValueToIso(second));
      } else if (!range && first) {
        onSelect(dateValueToIso(first));
      }
    },
    [range, onSelect, onRangeSelect],
  );

  return (
    <DropdownMenu
      open={open}
      onOpenChange={isOpen => onOpenChange?.(isOpen)}
      closeOnSelect={false}
      positioning={positioning}
    >
      <DropdownMenuContent
        ref={menuRef}
        className={cn('w-fit', className)}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            onEscape ? onEscape() : onOpenChange?.(false);
          }
        }}
      >
        <Calendar
          key={initialRangeValue ? `${initialRangeValue[0]}_${initialRangeValue[1]}` : initialValue}
          open
          closeOnSelect={false}
          type={range ? 'range' : 'single'}
          defaultValue={defaultValue}
          focusedValue={focusedValue}
        >
          {/* Render directly without DatePicker.Content to avoid
              presence-based remounts that reset uncontrolled state */}
          <div className='flex'>
            <CalendarPresets />
            <CalendarBody>
              <CalendarInputHeader />
              <CalendarGrids />
              <CalendarFooter>
                <CalendarFooterControls>
                  <CalendarResetButton />
                  <ApplyButton range={range} onApply={handleApply} />
                </CalendarFooterControls>
              </CalendarFooter>
            </CalendarBody>
          </div>
        </Calendar>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

FilterInputDateValueMenu.displayName = 'FilterInputDateValueMenu';
