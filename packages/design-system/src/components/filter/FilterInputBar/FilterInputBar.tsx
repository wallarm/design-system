import type { ChangeEvent, FC, HTMLAttributes, KeyboardEvent, MouseEvent as ReactMouseEvent, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { inputVariants } from '../../Input/classes';
import { FilterChip } from '../FilterChip';
import type { FilterChipData } from '../types';
import { FilterInputBarActions } from './FilterInputBarActions';

interface FilterInputBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /** Visible chips to render (already sliced) */
  chips: FilterChipData[];
  /** Building chip data (in-progress filter) */
  buildingChipData?: {
    variant: 'chip';
    attribute: string;
    operator?: string;
    value?: string;
  } | null;
  /** Ref for the building chip wrapper */
  buildingChipRef?: Ref<HTMLDivElement>;
  /** Input text value */
  inputText: string;
  /** Callback when input text changes */
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Callback when key is pressed in input */
  onInputKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  /** Ref for the input element */
  inputRef?: Ref<HTMLInputElement>;
  /** Placeholder text */
  placeholder: string;
  /** Whether the field has a validation error */
  error?: boolean;
  /** Whether to show the keyboard hint */
  showKeyboardHint?: boolean;
  /** Whether the menu is open */
  menuOpen?: boolean;
  /** Callback when a chip is clicked */
  onChipClick: (chipId: string, e: ReactMouseEvent) => void;
  /** Callback when a chip is removed */
  onChipRemove: (chipId: string) => void;
  /** Callback to clear all filters */
  onClear: () => void;
  /** Whether there are more chips than visible */
  hasMoreChips?: boolean;
  /** Whether there is any content (chips or building chip) */
  hasContent?: boolean;
  /** Whether there are any completed chips */
  hasChips?: boolean;
}

export const FilterInputBar: FC<FilterInputBarProps> = ({
  chips,
  buildingChipData,
  buildingChipRef,
  inputText,
  onInputChange,
  onInputKeyDown,
  inputRef,
  placeholder,
  error = false,
  showKeyboardHint = false,
  menuOpen = false,
  onChipClick,
  onChipRemove,
  onClear,
  hasMoreChips = false,
  hasContent: hasContentProp,
  hasChips: hasChipsProp,
  className,
  ...props
}) => {
  const hasChips = hasChipsProp ?? chips.length > 0;
  const hasContent = hasContentProp ?? (hasChips || buildingChipData != null);

  return (
    <div
      className={cn(
        'relative flex h-40 w-full items-center overflow-clip',
        inputVariants({ error }),
        'px-0',
        'focus-within:outline-none focus-within:ring-3',
        !error && 'focus-within:not-disabled:border-border-strong-primary focus-within:ring-focus-primary',
        error && 'focus-within:ring-focus-destructive',
        className,
      )}
      role='combobox'
      aria-expanded={menuOpen}
      aria-invalid={error}
      data-slot='filter-field'
      {...props}
    >
      <div className={cn('flex flex-1 items-center pr-4', hasContent ? 'gap-4 pl-8' : 'pl-12')}>
        {hasContent && (
          <div className='flex items-center gap-1'>
            {chips.map(chip => {
              const isConnector = chip.variant === 'and' || chip.variant === 'or';
              return (
                <div
                  key={chip.id}
                  className='shrink-0 cursor-pointer hover:z-10'
                  onClick={(e) => onChipClick(chip.id, e)}
                >
                  <FilterChip
                    {...chip}
                    onRemove={isConnector ? undefined : () => onChipRemove(chip.id)}
                  />
                </div>
              );
            })}
            {hasMoreChips && (
              <p className='pl-4 text-sm text-text-secondary'>{placeholder}</p>
            )}
            {buildingChipData && (
              <div ref={buildingChipRef} className='shrink-0'>
                <FilterChip {...buildingChipData} />
              </div>
            )}
          </div>
        )}

        {!hasMoreChips && (
          <input
            ref={inputRef}
            type='text'
            value={inputText}
            onChange={onInputChange}
            onKeyDown={onInputKeyDown}
            placeholder={hasContent ? '' : placeholder}
            className='flex-1 h-auto border-none bg-transparent p-0 text-sm shadow-none outline-none ring-0'
          />
        )}
      </div>

      <FilterInputBarActions
        showKeyboardHint={showKeyboardHint}
        hasContent={hasContent}
        hasChips={hasChips}
        onClear={onClear}
      />
    </div>
  );
};

FilterInputBar.displayName = 'FilterInputBar';
