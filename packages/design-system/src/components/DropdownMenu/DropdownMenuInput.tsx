import type { FC, InputHTMLAttributes, Ref } from 'react';
import { Search } from '../../icons';
import { Input } from '../Input';
import { InputGroup, InputGroupAddon } from '../InputGroup';

interface DropdownMenuInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  ref?: Ref<HTMLInputElement>;
}

export const DropdownMenuInput: FC<DropdownMenuInputProps> = props => (
  <div className='mb-4'>
    <InputGroup>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <Input type='text' {...props} />
    </InputGroup>
  </div>
);

DropdownMenuInput.displayName = 'DropdownMenuInput';
