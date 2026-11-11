import type { FC, InputHTMLAttributes, Ref } from 'react';

import { Search, X } from '../../icons';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';
import { useTestId } from '../../utils/testId';
import { Kbd } from '../Kbd';
import { Loader } from '../Loader';
import { searchModalInputVariants } from './classes';
import { useSearchModalContext } from './SearchModalContext';

export interface SearchModalInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> {
  ref?: Ref<HTMLInputElement>;
  /** Show a loading spinner replacing the search icon */
  loading?: boolean;
}

export const SearchModalInput: FC<SearchModalInputProps> = ({
  ref,
  loading = false,
  className,
  ...props
}) => {
  const testId = useTestId('input');
  const { query, setQuery, inputRef, close } = useSearchModalContext();

  return (
    <div data-slot='search-modal-input' data-testid={testId} className={searchModalInputVariants()}>
      {loading ? (
        <span className='shrink-0'>
          <Loader size='sm' />
        </span>
      ) : (
        <Search className='!icon-md shrink-0 text-text-secondary' />
      )}
      <input
        {...props}
        ref={mergeRefs(inputRef, ref)}
        value={query}
        onChange={e => setQuery(e.target.value)}
        className={cn(
          'h-48 flex-1 bg-transparent text-base text-text-primary',
          'outline-none placeholder:text-text-hint',
          className,
        )}
        autoComplete='off'
      />
      {query && (
        <button
          type='button'
          tabIndex={-1}
          onClick={() => {
            setQuery('');
            inputRef.current?.focus();
          }}
          className='shrink-0 cursor-pointer text-text-secondary transition-colors hover:text-text-primary'
          aria-label='Clear search'
        >
          <X className='!icon-md' />
        </button>
      )}
      <button
        type='button'
        tabIndex={-1}
        onClick={close}
        className='flex shrink-0 cursor-pointer'
        aria-label='Close'
      >
        <Kbd size='small'>ESC</Kbd>
      </button>
    </div>
  );
};

SearchModalInput.displayName = 'SearchModalInput';
