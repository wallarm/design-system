import { type FC, useMemo } from 'react';
import { ChevronRight } from '../../../icons/ChevronRight';
import { cn } from '../../../utils/cn';
import { Checkmark } from '../../Checkmark';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuFooter,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemText,
} from '../../DropdownMenu';
import { Kbd } from '../../Kbd/Kbd';
import { KbdGroup } from '../../Kbd/KbdGroup';
import { useKeyboardNav } from '../hooks';
import type { QueryBarDropdownItem } from '../types';

export interface ValueOption {
  /** Value identifier */
  value: string | number | boolean;
  /** Display label */
  label: string;
  /** Optional badge configuration */
  badge?: {
    color: string;
    text: string;
  };
  /** Whether this option opens a submenu */
  hasSubmenu?: boolean;
}

export interface QueryBarValueMenuProps {
  /** Available value options */
  values: ValueOption[];
  /** Callback when value is selected */
  onSelect: (value: ValueOption['value']) => void;
  /** Whether the menu is open */
  open?: boolean;
  /** Callback when open state should change */
  onOpenChange?: (open: boolean) => void;
  /** Enable multi-select mode with checkboxes */
  multiSelect?: boolean;
  /** Currently selected values (for checkboxes) */
  selectedValues?: Array<ValueOption['value']>;
  /** Callback when Escape is pressed (discard) */
  onEscape?: () => void;
  /** Custom width (defaults to 300px for standard, 172px for date pickers) */
  width?: 'standard' | 'compact' | number;
  /** Virtual anchor point for positioning */
  /** Override positioning config for the dropdown */
  positioning?: Record<string, unknown>;
  /** Optional custom class name */
  className?: string;
}

/**
 * QueryBarValueMenu component
 * Dropdown menu for selecting filter values
 * Supports enum values, dates, checkboxes, badges, and submenus
 */
export const QueryBarValueMenu: FC<QueryBarValueMenuProps> = ({
  values,
  onSelect,
  open = false,
  onOpenChange,
  onEscape,
  multiSelect = false,
  selectedValues = [],
  width = 'standard',
  positioning,
  className,
}) => {
  const flatItems: QueryBarDropdownItem[] = useMemo(
    () =>
      values.map(opt => ({
        id: String(opt.value),
        label: opt.label,
        value: opt.value,
      })),
    [values],
  );

  const { highlightedValue, onHighlightChange, pendingIds } = useKeyboardNav({
    items: flatItems,
    open,
    onSelect: item => onSelect(item.value),
    onClose: onEscape ?? (() => onOpenChange?.(false)),
  });

  // Determine width class
  let widthClass = 'w-[300px]';
  if (width === 'compact') {
    widthClass = 'w-[172px]';
  } else if (typeof width === 'number') {
    widthClass = `w-[${width}px]`;
  }

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange} closeOnSelect={false} positioning={positioning} highlightedValue={highlightedValue} onHighlightChange={onHighlightChange}>
      <DropdownMenuContent className={cn(widthClass, className)}>
        <DropdownMenuGroup>
          {values.map(option => {
            const isChecked = selectedValues.includes(option.value);
            const isPending = pendingIds.has(String(option.value));

            return (
              <DropdownMenuItem
                key={String(option.value)}
                value={String(option.value)}
                onSelect={() => onSelect(option.value)}
                style={isPending ? { backgroundColor: 'var(--color-states-primary-hover)' } : undefined}
              >
                {/* Badge */}
                {option.badge ? (
                  <div
                    className='flex items-center gap-4 px-6 py-2 rounded-4 text-xs font-medium max-w-[320px] min-h-[20px] overflow-clip'
                    style={{ backgroundColor: option.badge.color }}
                  >
                    <div className='size-6 rounded-full bg-current' />
                    <span className='leading-4 text-ellipsis'>
                      {option.badge.text}
                    </span>
                  </div>
                ) : (
                  <DropdownMenuItemText>{option.label}</DropdownMenuItemText>
                )}

                {/* Checkbox for multi-select, checkmark for single-select */}
                {multiSelect ? (
                  <div className='flex items-start justify-end py-2 ml-auto'>
                    <Checkmark checkedState={isChecked} />
                  </div>
                ) : isChecked ? (
                  <div className='flex items-start justify-end py-2 ml-auto'>
                    <Checkmark checkedState={true} />
                  </div>
                ) : null}

                {/* Submenu arrow */}
                {option.hasSubmenu && !multiSelect && (
                  <div className='flex items-center text-text-secondary ml-auto'>
                    <ChevronRight />
                  </div>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuFooter>
          {multiSelect ? (
            <>
              <span className='flex items-center gap-4'>
                <KbdGroup><Kbd>↵</Kbd></KbdGroup>
                to select
              </span>
              <span className='flex items-center gap-4'>
                <KbdGroup><Kbd>⌘</Kbd><Kbd>↑</Kbd><Kbd>↓</Kbd></KbdGroup>
                to multi-select
              </span>
            </>
          ) : (
            <>
              <span className='flex items-center gap-4'>
                <KbdGroup>
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd>
                </KbdGroup>
                to navigate
              </span>
              <span className='flex items-center gap-4'>
                <KbdGroup><Kbd>↵</Kbd></KbdGroup>
                to select
              </span>
            </>
          )}
        </DropdownMenuFooter>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

QueryBarValueMenu.displayName = 'QueryBarValueMenu';
