import type { FC, HTMLAttributes } from 'react';
import { type TestableProps, useTestId } from '../../utils/testId';
import { SearchInput } from '../SearchInput';

export interface SelectSearchInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange' | 'color'>,
    TestableProps {
  value: string;
  onChange: (value: string) => void;
}

export const SelectSearchInput: FC<SelectSearchInputProps> = ({
  value,
  onChange,
  'data-testid': testIdProp,
  ...rest
}) => {
  const testId = useTestId('search-input', testIdProp);

  return <SearchInput {...rest} value={value} onChange={onChange} data-testid={testId} />;
};

SelectSearchInput.displayName = 'SelectSearchInput';
