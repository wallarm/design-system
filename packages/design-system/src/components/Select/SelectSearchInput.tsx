import type { FC, InputHTMLAttributes, KeyboardEvent, Ref } from 'react';
import { type TestableProps, useTestId } from '../../utils/testId';
import { SearchInput } from '../SearchInput';

export interface SelectSearchInputProps
  extends Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'children' | 'onChange' | 'color' | 'size' | 'type' | 'value'
    >,
    TestableProps {
  value: string;
  onChange: (value: string) => void;
  /** Called when the built-in clear button empties the field, before `onChange('')`. */
  onClear?: () => void;
  ref?: Ref<HTMLInputElement>;
}

/**
 * Keys that the Select content's keymap claims (Space picks the highlighted item, Home/End move
 * the highlight) but that belong to the text field while the caret is in it. Stopping them here,
 * at keydown only, lets a space be typed and the caret move; arrows, Enter, Escape and Tab still
 * bubble to the content so list navigation keeps working from the search.
 */
const INPUT_OWNED_KEYS = new Set([' ', 'Home', 'End']);

export const SelectSearchInput: FC<SelectSearchInputProps> = ({
  value,
  onChange,
  onKeyDown,
  'data-testid': testIdProp,
  ...rest
}) => {
  const testId = useTestId('search-input', testIdProp);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (INPUT_OWNED_KEYS.has(event.key)) event.stopPropagation();
  };

  return (
    <SearchInput
      {...rest}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      data-testid={testId}
    />
  );
};

SelectSearchInput.displayName = 'SelectSearchInput';
