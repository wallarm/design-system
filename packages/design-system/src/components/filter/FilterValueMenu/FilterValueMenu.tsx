import type { FC, ReactNode } from 'react';
import { cn } from '../../../utils/cn';
import { ChevronRight } from '../../../icons/ChevronRight';
import { FilterDropdownBase } from '../base';
import type { FilterDropdownItem, FilterDropdownSection } from '../base/types';

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

export interface FilterValueMenuProps {
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
  /** Custom width (defaults to 300px for standard, 172px for date pickers) */
  width?: 'standard' | 'compact' | number;
  /** Optional custom class name */
  className?: string;
}

/**
 * Checkbox component for multi-select mode
 */
const Checkbox: FC<{ checked?: boolean }> = ({ checked }) => (
  <div className={cn(
    'size-4 rounded border border-border-primary bg-white',
    'shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]',
    'flex items-center justify-center',
    checked && 'bg-primary border-primary',
  )}>
    {checked && (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M10 3L4.5 8.5L2 6"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </div>
);

/**
 * FilterValueMenu component
 * Dropdown menu for selecting filter values
 * Supports enum values, dates, checkboxes, badges, and submenus
 */
export const FilterValueMenu: FC<FilterValueMenuProps> = ({
  values,
  onSelect,
  open = false,
  onOpenChange,
  multiSelect = false,
  selectedValues = [],
  width = 'standard',
  className,
}) => {
  // Convert values to dropdown items
  const items: FilterDropdownItem[] = values.map(option => ({
    id: String(option.value),
    label: option.label,
    value: option.value,
    badge: option.badge,
    hasSubmenu: option.hasSubmenu,
    // Custom render for items with checkboxes or badges
    renderContent: (item) => {
      const isChecked = selectedValues.includes(option.value);

      return (
        <div className='flex flex-1 gap-2 items-start min-w-0'>
          {/* Badge */}
          {option.badge && (
            <div
              className='flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium max-w-[320px] min-h-[20px] overflow-clip'
              style={{ backgroundColor: option.badge.color }}
            >
              <div className='size-1.5 rounded-full bg-current' />
              <span className='leading-4 overflow-hidden text-ellipsis'>{option.badge.text}</span>
            </div>
          )}

          {/* Text label (only if no badge) */}
          {!option.badge && (
            <div className='flex flex-1 flex-col items-start min-w-0'>
              <div className='flex flex-col justify-center leading-none text-sm font-normal text-text-primary w-full'>
                <p className='leading-5 whitespace-pre-wrap overflow-hidden text-ellipsis'>
                  {item.label}
                </p>
              </div>
            </div>
          )}

          {/* Checkbox for multi-select */}
          {multiSelect && (
            <div className='flex items-start justify-end py-0.5'>
              <Checkbox checked={isChecked} />
            </div>
          )}

          {/* Submenu arrow */}
          {option.hasSubmenu && !multiSelect && (
            <div className='flex items-center text-text-secondary pt-0.5'>
              <ChevronRight className='size-4' />
            </div>
          )}
        </div>
      );
    },
  }));

  const sections: FilterDropdownSection[] = [
    {
      id: 'values',
      items,
    },
  ];

  const handleSelect = (item: { value: ValueOption['value'] }) => {
    onSelect(item.value);
    if (!multiSelect) {
      onOpenChange?.(false);
    }
  };

  // Determine footer hint based on mode
  const footerHint = multiSelect ? 'to select    to select more' : 'to select';

  // Determine width class
  let widthClass = 'w-[300px]';
  if (width === 'compact') {
    widthClass = 'w-[172px]';
  } else if (typeof width === 'number') {
    widthClass = `w-[${width}px]`;
  }

  return (
    <FilterDropdownBase
      sections={sections}
      onSelect={handleSelect}
      open={open}
      onOpenChange={onOpenChange}
      footerHint={footerHint}
      className={cn(widthClass, className)}
    />
  );
};

FilterValueMenu.displayName = 'FilterValueMenu';
