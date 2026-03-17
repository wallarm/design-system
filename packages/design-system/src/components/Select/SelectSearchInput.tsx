import type { ChangeEvent, FC } from 'react';
import { Search } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Input } from '../Input';
import { InputGroup, InputGroupAddon } from '../InputGroup';

export interface SelectSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SelectSearchInput: FC<SelectSearchInputProps> = ({ value, onChange }) => {
  const testId = useTestId('search-input');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <InputGroup data-testid={testId}>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <Input placeholder='Search' value={value} onChange={handleChange} />
    </InputGroup>
  );
};

SelectSearchInput.displayName = 'SelectSearchInput';
