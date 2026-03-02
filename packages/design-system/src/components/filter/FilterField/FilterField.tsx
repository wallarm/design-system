import type { FC, FocusEvent, HTMLAttributes, ReactNode } from 'react';
import { cloneElement, isValidElement } from 'react';
import { X } from '../../../icons/X';
import { cn } from '../../../utils/cn';

export interface FilterFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Array of filter chip data to display
   */
  chips?: Array<{ id: string; content: ReactNode }>;
  /**
   * Placeholder text to display when field is empty
   * @default "Search [object]..."
   */
  placeholder?: string;
  /**
   * Whether the field has a validation error
   */
  error?: boolean;
  /**
   * Optional icon to display on the left side
   */
  leftIcon?: ReactNode;
  /**
   * Whether to show the keyboard hint (⌘K or Ctrl+K)
   */
  showKeyboardHint?: boolean;
  /**
   * Callback when a chip is removed
   */
  onChipRemove?: (chipId: string) => void;
  /**
   * Callback when the clear button is clicked
   */
  onClear?: () => void;
  /**
   * Callback when the field receives focus
   */
  onFocus?: (event: FocusEvent<HTMLDivElement>) => void;
  /**
   * Callback when the field loses focus
   */
  onBlur?: (event: FocusEvent<HTMLDivElement>) => void;
}

export const FilterField: FC<FilterFieldProps> = ({
  chips = [],
  placeholder = 'Search [object]...',
  error = false,
  leftIcon,
  showKeyboardHint = false,
  onChipRemove,
  onClear,
  onFocus,
  onBlur,
  className,
  ...props
}) => {
  const hasChips = chips.length > 0;
  const visibleChips = chips.slice(0, 3);
  const hasMoreChips = chips.length > 3;

  // Function to inject error prop into chip content if error state is active
  const injectErrorProp = (chipContent: ReactNode): ReactNode => {
    if (!error || !isValidElement(chipContent)) {
      return chipContent;
    }
    // Clone the element and inject the error prop
    return cloneElement(chipContent, { error: true } as any);
  };

  return (
    <div
      className={cn(
        // Base styles
        'relative flex h-10 w-full max-w-[800px] items-center overflow-clip rounded-lg',
        'border border-border-primary bg-component-input-bg shadow-xs',
        // Hover styles
        !error && 'hover:border-component-border-input-hover',
        error && 'hover:shadow-[0px_0px_0px_3px_rgba(231,0,11,0.3)]',
        // Focus styles
        !error &&
          'focus-within:border-border-strong-primary focus-within:shadow-focus-ring-primary',
        // Error styles
        error && 'border-border-strong-danger',
        error &&
          'focus-within:border-border-strong-danger focus-within:shadow-[0px_0px_0px_3px_rgba(231,0,11,0.2)]',
        className,
      )}
      role='textbox'
      tabIndex={0}
      aria-invalid={error}
      onFocus={onFocus}
      onBlur={onBlur}
      data-slot='filter-field'
      {...props}
    >
      {/* Left side: icon and chips/placeholder */}
      <div className='flex flex-1 items-center gap-2 px-3'>
        {leftIcon && <div className='shrink-0'>{leftIcon}</div>}

        {hasChips ? (
          <div className='flex items-center gap-1'>
            {visibleChips.map(chip => (
              <div key={chip.id} className='shrink-0'>
                {injectErrorProp(chip.content)}
              </div>
            ))}
            {hasMoreChips && (
              <p className='pl-1 text-sm leading-5 text-text-secondary'>{placeholder}</p>
            )}
          </div>
        ) : (
          <p className='text-sm leading-5 text-text-secondary'>{placeholder}</p>
        )}
      </div>

      {/* Right side: keyboard hint and clear button */}
      <div className='flex shrink-0 items-center gap-2 pr-3'>
        {showKeyboardHint && (
          <div className='flex items-center gap-0.5'>
            <kbd className='inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-component-border-hotkey bg-bg-surface-2 px-1 text-xs'>
              ⌘
            </kbd>
            <kbd className='inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-component-border-hotkey bg-bg-surface-2 px-1 text-xs'>
              K
            </kbd>
          </div>
        )}
        {hasChips && onClear && (
          <button
            type='button'
            onClick={onClear}
            className='flex h-6 w-6 items-center justify-center rounded-full hover:bg-bg-neutral-subtle'
            aria-label='Clear all filters'
          >
            <X className='h-4 w-4 text-text-secondary' />
          </button>
        )}
      </div>
    </div>
  );
};

FilterField.displayName = 'FilterField';
