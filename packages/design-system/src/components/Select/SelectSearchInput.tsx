import type { ChangeEvent, FC, HTMLAttributes } from 'react';
import { Search } from '../../icons';
import { type TestableProps, useTestId } from '../../utils/testId';
import { Input } from '../Input';
import { InputGroup, InputGroupAddon } from '../InputGroup';

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

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <InputGroup {...rest} data-testid={testId}>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <Input placeholder='Search' value={value} onChange={handleChange} />
    </InputGroup>
  );
};

SelectSearchInput.displayName = 'SelectSearchInput';
