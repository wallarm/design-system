import type { FC, HTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';
import { inputVariants } from '../../Input/classes';
import { useQueryBarContext } from '../QueryBarContext';
import { QueryBarChipList } from '../QueryBarChip';
import { QueryBarInputActions } from './QueryBarInputActions';

type QueryBarInputProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

export const QueryBarInput: FC<QueryBarInputProps> = ({ className, ...props }) => {
  const {
    chips,
    buildingChipData,
    inputText,
    inputRef,
    placeholder,
    error,
    menuOpen,
    onInputChange,
    onInputKeyDown,
    onInputClick,
  } = useQueryBarContext();

  const hasContent = chips.length > 0 || buildingChipData != null;

  return (
    <div
      className={cn(
        'relative flex min-h-40 w-full items-center overflow-hidden',
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
      data-slot='query-bar'
      {...props}
    >
      <div className={cn('flex flex-1 flex-wrap items-center gap-4 py-4 pr-4', hasContent ? 'pl-8' : 'pl-12')}>
        <QueryBarChipList>
          <input
            ref={inputRef}
            type='text'
            value={inputText}
            onChange={onInputChange}
            onKeyDown={onInputKeyDown}
            onClick={onInputClick}
            placeholder={hasContent ? '' : placeholder}
            className={cn('h-auto min-w-0 border-none bg-transparent p-0 text-sm shadow-none outline-none ring-0', hasContent ? 'w-0 flex-[1_1_0]' : 'flex-1')}
          />
        </QueryBarChipList>
      </div>

      <QueryBarInputActions />
    </div>
  );
};

QueryBarInput.displayName = 'QueryBarInput';
