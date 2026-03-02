import type { FC, FocusEvent, HTMLAttributes, ReactNode } from 'react';
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

  return (
    <div
      className={cn(
        // Base styles
        'relative flex h-10 w-full max-w-[800px] items-center overflow-clip rounded-lg',
        'border border-border-primary bg-component-input-bg shadow-xs',
        // Focus styles
        'focus-within:border-border-strong-primary focus-within:shadow-focus-ring-primary',
        // Error styles
        error && 'border-border-strong-danger',
        error &&
          'focus-within:border-border-strong-danger focus-within:shadow-focus-ring-destructive',
        className,
      )}
      role="textbox"
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
            {chips.map(chip => (
              <div key={chip.id} className='shrink-0'>
                {chip.content}
              </div>
            ))}
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
      </div>
    </div>
  );
};

FilterField.displayName = 'FilterField';
