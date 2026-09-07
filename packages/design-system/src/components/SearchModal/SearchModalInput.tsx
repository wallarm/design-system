import type { FC, InputHTMLAttributes, Ref } from 'react';
import { Search } from '../../icons';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';
import { useTestId } from '../../utils/testId';
import { Kbd } from '../Kbd';
import { Loader } from '../Loader';
import { searchModalInputVariants } from './classes';
import { useSearchModalContext } from './SearchModalContext';

export interface SearchModalInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
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
        <Search className='text-text-secondary shrink-0 !icon-md' />
      )}
      <input
        {...props}
        ref={mergeRefs(inputRef, ref)}
        value={query}
        onChange={e => setQuery(e.target.value)}
        className={cn(
          'flex-1 h-48 bg-transparent text-text-primary text-base',
          'placeholder:text-text-hint outline-none',
          className,
        )}
        autoComplete='off'
      />
      <button
        type='button'
        tabIndex={-1}
        onClick={close}
        className='shrink-0 cursor-pointer'
        aria-label='Close'
      >
        <Kbd size='xsmall'>ESC</Kbd>
      </button>
    </div>
  );
};

SearchModalInput.displayName = 'SearchModalInput';
