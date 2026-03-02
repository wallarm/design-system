import { type FC, useState } from 'react';
import { Search } from '../../../icons/Search';
import { cn } from '../../../utils/cn';
import { Input } from '../../Input/Input';
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
   * Optional array of recently used fields (max 3)
   */
  recentFields?: FieldMetadata[];
  /**
   * Optional array of suggested commonly used fields
   */
  suggestedFields?: FieldMetadata[];
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
  recentFields = [],
  suggestedFields = [],
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!open) {
    return null;
  }

  const handleSelect = (field: FieldMetadata) => {
    onSelect(field);
    onOpenChange?.(false);
    setSearchQuery(''); // Reset search on selection
  };

  // Limit recent fields to max 3
  const limitedRecentFields = recentFields.slice(0, 3);

  // Filter fields based on search query (case-insensitive, match label and name)
  const filteredFields = searchQuery.trim()
    ? fields.filter(
        field =>
          field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          field.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : fields;

  // Filter recent/suggested fields based on search too
  const filteredRecentFields = searchQuery.trim()
    ? limitedRecentFields.filter(
        field =>
          field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          field.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : limitedRecentFields;

  const filteredSuggestedFields = searchQuery.trim()
    ? suggestedFields.filter(
        field =>
          field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          field.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : suggestedFields;

  const showRecent = filteredRecentFields.length > 0;
  const showSuggestions = filteredSuggestedFields.length > 0;

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
      {/* Search input */}
      <div className='px-2 py-1.5 mb-1'>
        <div className='relative'>
          <div className='absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none'>
            <Search className='h-4 w-4 text-text-secondary' />
          </div>
          <Input
            type='text'
            placeholder='Search fields...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='pl-8 pr-2 h-8 text-sm w-full'
            autoFocus
          />
        </div>
      </div>

      {/* Scrollable field list with sections */}
      <div className='flex flex-col gap-px max-h-80 overflow-y-auto'>
        {/* Recent fields section */}
        {showRecent && (
          <div className='flex flex-col gap-px'>
            <div className='px-2 py-1.5 text-xs font-medium text-text-secondary'>Recent</div>
            {filteredRecentFields.map(field => (
              <button
                key={`recent-${field.name}`}
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
            {/* Separator after recent */}
            <div className='h-px bg-border-primary my-1' />
          </div>
        )}

        {/* Suggestions section */}
        {showSuggestions && (
          <div className='flex flex-col gap-px'>
            <div className='px-2 py-1.5 text-xs font-medium text-text-secondary'>Suggestions</div>
            {filteredSuggestedFields.map(field => (
              <button
                key={`suggested-${field.name}`}
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
            {/* Separator after suggestions */}
            <div className='h-px bg-border-primary my-1' />
          </div>
        )}

        {/* All fields section */}
        {filteredFields.length > 0 ? (
          filteredFields.map(field => (
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
          ))
        ) : (
          <div className='px-2 py-4 text-center text-sm text-text-secondary'>No fields found</div>
        )}
      </div>

      {/* Keyboard navigation hints */}
      <div className='border-t border-border-primary pt-2 mt-1'>
        <div className='flex items-center gap-4 px-2'>
          <div className='flex items-center gap-1'>
            <kbd className='inline-flex items-center justify-center h-5 min-w-[20px] px-1 bg-white border border-border-secondary rounded text-xs text-text-secondary'>
              ↑
            </kbd>
            <kbd className='inline-flex items-center justify-center h-5 min-w-[20px] px-1 bg-white border border-border-secondary rounded text-xs text-text-secondary'>
              ↓
            </kbd>
            <span className='text-xs font-medium text-text-secondary ml-1'>to navigate</span>
          </div>
          <div className='flex items-center gap-1'>
            <kbd className='inline-flex items-center justify-center h-5 min-w-[20px] px-1 bg-white border border-border-secondary rounded text-xs text-text-secondary'>
              ↵
            </kbd>
            <span className='text-xs font-medium text-text-secondary ml-1'>to select</span>
          </div>
        </div>
      </div>
    </div>
  );
};

FilterMainMenu.displayName = 'FilterMainMenu';
