import type { FC } from 'react';
import { cn } from '../../../utils/cn';
import type { FieldMetadata } from '../types';

export interface FilterMainMenuProps {
  /**
   * Array of available fields to display
   */
  fields: FieldMetadata[];
  /**
   * Callback when a field is selected
   */
  onSelect: (field: FieldMetadata) => void;
  /**
   * Whether the menu is open
   */
  open?: boolean;
  /**
   * Callback when open state should change
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Optional custom class name
   */
  className?: string;
}

/**
 * FilterMainMenu component
 * Displays a dropdown menu with available filter fields
 */
export const FilterMainMenu: FC<FilterMainMenuProps> = ({
  fields,
  onSelect,
  open = false,
  onOpenChange,
  className,
}) => {
  if (!open) {
    return null;
  }

  const handleSelect = (field: FieldMetadata) => {
    onSelect(field);
    onOpenChange?.(false);
  };

  return (
    <div
      className={cn(
        'w-80', // 320px width
        'bg-white border border-border-primary rounded-xl',
        'shadow-md',
        'flex flex-col gap-px p-2',
        className,
      )}
      data-slot='filter-main-menu'
      role='menu'
      aria-label='Filter fields'
      aria-expanded={open}
    >
      {/* Scrollable field list */}
      <div className='flex flex-col gap-px max-h-80 overflow-y-auto'>
        {fields.map(field => (
          <button
            key={field.name}
            type='button'
            onClick={() => handleSelect(field)}
            className={cn(
              'flex items-start gap-1 px-2 py-1.5',
              'rounded-md overflow-clip',
              'text-sm font-normal text-text-primary text-left',
              'bg-transparent',
              'hover:bg-gray-100',
              'transition-colors',
            )}
            role='menuitem'
          >
            <div className='flex flex-1 gap-2 items-start min-h-[1px] min-w-[1px]'>
              <div className='flex flex-1 flex-col items-start min-h-[1px] min-w-[1px]'>
                <span className='leading-5'>{field.label}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

FilterMainMenu.displayName = 'FilterMainMenu';
