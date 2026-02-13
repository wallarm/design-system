import type { ChangeEvent, FC } from 'react';
import { Search } from '../../icons';
import { Input } from '../Input';
import { InputGroup, InputGroupAddon } from '../InputGroup';

interface SelectSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SelectSearchInput: FC<SelectSearchInputProps> = ({ value, onChange }) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <InputGroup>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <Input placeholder='Search' value={value} onChange={handleChange} />
    </InputGroup>
  );
};

SelectSearchInput.displayName = 'SelectSearchInput';
