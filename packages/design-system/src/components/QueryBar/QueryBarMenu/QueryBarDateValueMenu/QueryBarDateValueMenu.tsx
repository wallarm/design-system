import type { RefObject } from 'react';
import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../../../utils/cn';
import { DropdownMenu, DropdownMenuContent } from '../../../DropdownMenu';
import type { QueryBarDropdownItem } from '../../types';
import { useKeyboardNav } from '../useKeyboardNav';
import { DATE_PRESETS } from './constants';
import { DateCalendar } from './DateCalendar';
import { DatePresets } from './DatePresets';

export interface QueryBarDateValueMenuProps {
  open: boolean;
  onSelect: (value: string) => void;
  onRangeSelect?: (from: string, to: string) => void;
  onOpenChange?: (open: boolean) => void;
  onEscape?: () => void;
  positioning?: Record<string, unknown>;
  betweenLabel?: string;
  initialCalendar?: boolean;
  /** Enable range selection in the calendar (for "between" operator) */
  range?: boolean;
  /** Ref to the query bar input — ArrowUp on first item returns focus here */
  inputRef?: RefObject<HTMLInputElement | null>;
  /** Text to filter date presets by label */
  filterText?: string;
  /** ISO date string for the initially selected date in the calendar */
  initialValue?: string;
  /** Ref to the menu content element — shared across menus for focus management */
  menuRef?: RefObject<HTMLDivElement | null>;
  className?: string;
}

export const QueryBarDateValueMenu: FC<QueryBarDateValueMenuProps> = ({
  open,
  onSelect,
  onRangeSelect,
  onOpenChange,
  onEscape,
  positioning,
  betweenLabel,
  initialCalendar = false,
  range = false,
  inputRef,
  filterText = '',
  initialValue,
  menuRef,
  className,
}) => {
  const [showCalendar, setShowCalendar] = useState(initialCalendar);
  const switchingViewRef = useRef(false);
  const query = filterText.toLowerCase();

  useEffect(() => {
    if (open) {
      setShowCalendar(initialCalendar);
    } else if (showCalendar) {
      setShowCalendar(false);
    }
  }, [open, initialCalendar]);

  const allItems: QueryBarDropdownItem[] = useMemo(
    () => [
      ...DATE_PRESETS.map(p => ({ id: p.value, label: p.label, value: p.value })),
      { id: '__absolute__', label: 'Absolute date', value: '__absolute__' },
    ],
    [],
  );

  const flatItems = useMemo(
    () => (query ? allItems.filter(item => item.label.toLowerCase().includes(query)) : allItems),
    [allItems, query],
  );

  const handleItemSelect = (item: QueryBarDropdownItem) => {
    if (item.id === '__absolute__') {
      setShowCalendar(true);
      return;
    }
    onSelect(String(item.value));
  };

  const { highlightedValue, onHighlightChange } = useKeyboardNav({
    items: flatItems,
    open: open && !showCalendar,
    onSelect: handleItemSelect,
    onClose: onEscape ?? (() => onOpenChange?.(false)),
    inputRef,
    menuRef,
    onArrowRight: () => {
      const highlighted = flatItems.find(i => i.id === highlightedValue);
      if (highlighted?.id === '__absolute__') {
        setShowCalendar(true);
      }
    },
  });

  const handleCalendarSelect = (isoString: string) => {
    onSelect(isoString);
    setShowCalendar(false);
  };

  const handleRangeSelect = (from: string, to: string) => {
    onRangeSelect?.(from, to);
    setShowCalendar(false);
  };

  return (
    <DropdownMenu
      open={open}
      onOpenChange={isOpen => {
        // Suppress close triggered by unmounted element (Back / Absolute click)
        if (!isOpen && switchingViewRef.current) {
          switchingViewRef.current = false;
          return;
        }
        onOpenChange?.(isOpen);
      }}
      closeOnSelect={false}
      positioning={positioning}
      highlightedValue={showCalendar ? undefined : highlightedValue}
      onHighlightChange={showCalendar ? undefined : onHighlightChange}
    >
      <DropdownMenuContent
        ref={menuRef}
        className={cn(showCalendar ? 'w-[280px]' : 'w-[200px]', className)}
      >
        {showCalendar ? (
          <DateCalendar
            onSelect={handleCalendarSelect}
            onRangeSelect={handleRangeSelect}
            onBack={() => {
              switchingViewRef.current = true;
              setShowCalendar(false);
            }}
            onEscape={() => setShowCalendar(false)}
            betweenLabel={betweenLabel}
            range={range}
            initialValue={initialValue}
            filterText={filterText}
          />
        ) : (
          <DatePresets
            onSelect={onSelect}
            onAbsoluteClick={() => {
              switchingViewRef.current = true;
              setShowCalendar(true);
            }}
            betweenLabel={betweenLabel}
            filterText={filterText}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

QueryBarDateValueMenu.displayName = 'QueryBarDateValueMenu';
