import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';
import { inputVariants } from '../../Input/classes';
import { useFilterContext } from '../FilterContext';
import { ChipList } from '../primitives';
import { FilterInputBarActions } from './FilterInputBarActions';

type FilterInputBarProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

export const FilterInputBar: FC<FilterInputBarProps> = ({ className, ...props }) => {
  const {
    chips,
    buildingChipData,
    hasMoreChips,
    inputText,
    inputRef,
    placeholder,
    error,
    menuOpen,
    onInputChange,
    onInputKeyDown,
  } = useFilterContext();

  const hasChips = chips.length > 0;
  const hasContent = hasChips || buildingChipData != null;

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
        {hasContent && <ChipList />}

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

      <FilterInputBarActions />
    </div>
  );
};

FilterInputBar.displayName = 'FilterInputBar';
