import type { ChangeEvent, FC, InputHTMLAttributes, Ref } from 'react';
import { Search, X } from '../../icons';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
import { Input } from '../Input';
import { InputGroup } from '../InputGroup/InputGroup';
import { InputGroupAddon } from '../InputGroup/InputGroupAddon';

type SearchInputSize = 'default' | 'medium' | 'small';

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'onChange'>,
    TestableProps {
  /** Current search value (controlled). */
  value: string;
  /** Called when the value changes (typing or clearing). */
  onChange: (value: string) => void;
  /** Called when the clear button is clicked. Fires before onChange(''). */
  onClear?: () => void;
  /** Input size variant. @default 'default' */
  size?: SearchInputSize;
  /** @default false */
  disabled?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export const SearchInput: FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  size = 'default',
  disabled = false,
  placeholder = 'Search',
  className,
  ref,
  'data-testid': testId,
  ...rest
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const handleClear = () => {
    onClear?.();
    onChange('');
  };

  const showClear = value.length > 0 && !disabled;

  return (
    <InputGroup size={size} className={className} data-slot='search-input' data-testid={testId}>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <Input
        {...rest}
        type='text'
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        size={size}
        ref={ref}
      />
      <InputGroupAddon align='inline-end'>
        <button
          type='button'
          tabIndex={showClear ? -1 : undefined}
          disabled={!showClear}
          onClick={handleClear}
          aria-label='Clear'
          aria-hidden={!showClear}
          className={cn('flex text-icon-secondary', showClear ? 'cursor-pointer' : 'invisible')}
        >
          <X size='md' />
        </button>
      </InputGroupAddon>
    </InputGroup>
  );
};

SearchInput.displayName = 'SearchInput';
