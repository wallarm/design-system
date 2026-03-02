import type { FC } from 'react';
import { CirclePlus } from '../../../icons/CirclePlus';
import { CircleSlash } from '../../../icons/CircleSlash';
import { cn } from '../../../utils/cn';
import type { Condition, FieldMetadata, OPERATOR_LABELS } from '../types';

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
   * Optional array of recently used conditions (max 3)
   * Displayed as "Attribute operator Value" format
   */
  recentConditions?: Condition[];
  /**
   * Optional array of suggested commonly used fields
   */
  suggestedFields?: FieldMetadata[];
  /**
   * Callback when AND operator is selected
   */
  onSelectAnd?: () => void;
  /**
   * Callback when OR operator is selected
   */
  onSelectOr?: () => void;
  /**
   * Optional custom class name
   */
  className?: string;
}

/**
 * FilterMainMenu component
 * Displays a dropdown menu with available filter fields, recent conditions, and AND/OR operators
 */
export const FilterMainMenu: FC<FilterMainMenuProps> = ({
  fields,
  onSelect,
  open = false,
  onOpenChange,
  recentConditions = [],
  suggestedFields = [],
  onSelectAnd,
  onSelectOr,
  className,
}) => {
  if (!open) {
    return null;
  }

  const handleSelect = (field: FieldMetadata) => {
    onSelect(field);
    onOpenChange?.(false);
  };

  const handleSelectAnd = () => {
    onSelectAnd?.();
    onOpenChange?.(false);
  };

  const handleSelectOr = () => {
    onSelectOr?.();
    onOpenChange?.(false);
  };

  // Limit recent conditions to max 3
  const limitedRecentConditions = recentConditions.slice(0, 3);

  const showRecent = limitedRecentConditions.length > 0;
  const showSuggestions = suggestedFields.length > 0;

  return (
    <div
      className={cn(
        'w-[300px]', // 300px width (Figma spec)
        'bg-white border border-border-primary-light rounded-xl',
        'shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.1)]',
        'flex flex-col gap-px p-2',
        className,
      )}
      data-slot='filter-main-menu'
      role='menu'
      aria-label='Filter fields'
      aria-expanded={open}
    >

      {/* Header: Recent or Suggestions */}
      {(showRecent || showSuggestions) && (
        <div className='flex items-center justify-center overflow-clip px-2 py-2 pb-0.5'>
          <div className='flex flex-1 gap-0.5 items-center'>
            <div className='flex flex-1 flex-col justify-center leading-none text-xs font-medium text-text-secondary'>
              <p className='leading-4 whitespace-pre-wrap'>{showRecent ? 'Recent' : 'Suggestions'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div className='flex flex-col gap-px max-h-80 overflow-y-auto'>
        {/* Recent conditions section - show "Attribute operator Value" */}
        {showRecent && (
          <>
            {limitedRecentConditions.map((condition, index) => {
              // Find field metadata to get label
              const fieldMeta = fields.find(f => f.name === condition.field);
              const attribute = fieldMeta?.label || condition.field;
              const operator = String(condition.operator); // Will show raw operator for now
              const value = String(condition.value);

              return (
                <button
                  key={`recent-${index}`}
                  type='button'
                  onClick={() => fieldMeta && handleSelect(fieldMeta)}
                  className={cn(
                    'flex items-start gap-1 px-2 py-1.5',
                    'rounded-md overflow-clip',
                    'text-left bg-transparent',
                    'hover:bg-gray-100',
                    'transition-colors',
                  )}
                  role='menuitem'
                >
                  <div className='flex flex-1 gap-2 items-start'>
                    <div className='flex flex-1 flex-col items-start'>
                      {/* Attribute operator Value format */}
                      <div className='flex gap-0.5 items-center p-0'>
                        {/* Attribute */}
                        <div className='flex items-center justify-center p-0'>
                          <div className='flex flex-col justify-center leading-none overflow-hidden text-ellipsis whitespace-nowrap text-sm font-normal text-text-primary'>
                            <p className='leading-5 overflow-hidden text-ellipsis'>{attribute}</p>
                          </div>
                        </div>
                        {/* Operator */}
                        <div className='flex items-center justify-center p-0'>
                          <div className='flex flex-col justify-center leading-none overflow-hidden text-ellipsis whitespace-nowrap text-sm font-normal text-text-secondary'>
                            <p className='leading-5 overflow-hidden text-ellipsis'>{operator}</p>
                          </div>
                        </div>
                        {/* Value */}
                        <div className='flex items-center justify-center p-0'>
                          <div className='flex flex-col justify-center leading-none overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-text-info'>
                            <p className='leading-5 overflow-hidden text-ellipsis'>{value}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            {/* Separator */}
            <div className='flex flex-col gap-2 items-center justify-center overflow-clip px-2 py-1'>
              <div className='border-t border-border-primary h-px w-full' />
            </div>
          </>
        )}

        {/* Suggestions section */}
        {showSuggestions && !showRecent && (
          <>
            {suggestedFields.map((field, index) => {
              // Show as "Attribute operator Value" format for suggestions too
              return (
                <button
                  key={`suggested-${index}`}
                  type='button'
                  onClick={() => handleSelect(field)}
                  className={cn(
                    'flex items-start gap-1 px-2 py-1.5',
                    'rounded-md overflow-clip',
                    'text-left bg-transparent',
                    'hover:bg-gray-100',
                    'transition-colors',
                  )}
                  role='menuitem'
                >
                  <div className='flex flex-1 gap-2 items-start'>
                    <div className='flex flex-1 flex-col items-start'>
                      {/* Attribute operator Value format */}
                      <div className='flex gap-0.5 items-center p-0'>
                        {/* Attribute */}
                        <div className='flex items-center justify-center p-0'>
                          <div className='flex flex-col justify-center leading-none overflow-hidden text-ellipsis whitespace-nowrap text-sm font-normal text-text-primary'>
                            <p className='leading-5 overflow-hidden text-ellipsis'>{field.label}</p>
                          </div>
                        </div>
                        {/* Operator */}
                        <div className='flex items-center justify-center p-0'>
                          <div className='flex flex-col justify-center leading-none overflow-hidden text-ellipsis whitespace-nowrap text-sm font-normal text-text-secondary'>
                            <p className='leading-5 overflow-hidden text-ellipsis'>operator</p>
                          </div>
                        </div>
                        {/* Value */}
                        <div className='flex items-center justify-center p-0'>
                          <div className='flex flex-col justify-center leading-none overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-text-info'>
                            <p className='leading-5 overflow-hidden text-ellipsis'>Value</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            {/* Separator */}
            <div className='flex flex-col gap-2 items-center justify-center overflow-clip px-2 py-1'>
              <div className='border-t border-border-primary h-px w-full' />
            </div>
          </>
        )}

        {/* All fields section */}
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
            <div className='flex flex-1 gap-2 items-start'>
              <div className='flex flex-1 flex-col items-start'>
                <div className='flex flex-col justify-center leading-none text-sm font-normal text-text-primary w-full'>
                  <p className='leading-5 whitespace-pre-wrap'>{field.label}</p>
                </div>
              </div>
            </div>
          </button>
        ))}

        {/* Separator before AND/OR */}
        <div className='flex flex-col gap-2 items-center justify-center overflow-clip px-2 py-1'>
          <div className='border-t border-border-primary h-px w-full' />
        </div>

        {/* AND operator */}
        {onSelectAnd && (
          <button
            type='button'
            onClick={handleSelectAnd}
            className={cn(
              'flex items-start gap-1 px-2 py-1.5',
              'rounded-md overflow-clip',
              'text-left bg-transparent',
              'hover:bg-gray-100',
              'transition-colors',
            )}
            role='menuitem'
          >
            <div className='flex flex-1 gap-2 items-start'>
              <div className='flex items-center pt-0.5 w-4'>
                <CirclePlus className='h-4 w-4 text-text-primary' />
              </div>
              <div className='flex flex-1 flex-col items-start'>
                <div className='flex flex-col justify-center leading-none text-sm font-normal text-text-primary w-full'>
                  <p className='leading-5 whitespace-pre-wrap'>AND</p>
                </div>
              </div>
            </div>
          </button>
        )}

        {/* OR operator */}
        {onSelectOr && (
          <button
            type='button'
            onClick={handleSelectOr}
            className={cn(
              'flex items-start gap-1 px-2 py-1.5',
              'rounded-md overflow-clip',
              'text-left bg-transparent',
              'hover:bg-gray-100',
              'transition-colors',
            )}
            role='menuitem'
          >
            <div className='flex flex-1 gap-2 items-start'>
              <div className='flex items-center pt-0.5 w-4'>
                <CircleSlash className='h-4 w-4 text-text-primary' />
              </div>
              <div className='flex flex-1 flex-col items-start'>
                <div className='flex flex-col justify-center leading-none text-sm font-normal text-text-primary w-full'>
                  <p className='leading-5 whitespace-pre-wrap'>OR</p>
                </div>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Keyboard navigation hints footer */}
      <div className='relative h-8 w-full'>
        {/* Top border */}
        <div className='absolute h-px left-0 right-0 top-[5px] border-t border-border-primary' />

        {/* Navigation hints */}
        <div className='absolute flex gap-1 items-center left-0 top-[12px]'>
          <div className='flex gap-0.5 items-center'>
            {/* Arrow keys placeholders - using text for now */}
            <span className='text-xs font-medium text-text-secondary'>↑ ↓</span>
          </div>
          <div className='flex flex-col justify-center leading-none text-xs font-medium text-text-secondary text-right whitespace-nowrap'>
            <p className='leading-4'>to navigate</p>
          </div>
        </div>

        {/* Select hint */}
        <div className='absolute flex gap-1 items-center left-32 top-[12px]'>
          <div className='flex gap-0.5 items-center'>
            {/* Enter key placeholder */}
            <span className='text-xs font-medium text-text-secondary'>↵</span>
          </div>
          <div className='flex flex-col justify-center leading-none text-xs font-medium text-text-secondary text-right whitespace-nowrap'>
            <p className='leading-4'>to select</p>
          </div>
        </div>
      </div>
    </div>
  );
};

FilterMainMenu.displayName = 'FilterMainMenu';
