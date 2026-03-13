import type { FC, InputHTMLAttributes, Ref } from 'react';
import { Search } from '../../icons';
import { InputGroup } from '../InputGroup/InputGroup';
import { InputGroupAddon } from '../InputGroup/InputGroupAddon';
import { InputGroupInput } from '../InputGroup/InputGroupInput';

interface DropdownMenuInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  ref?: Ref<HTMLInputElement>;
}

export const DropdownMenuInput: FC<DropdownMenuInputProps> = (props) => (
  <div className='mb-4'>
    <InputGroup>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput type='text' {...props} />
    </InputGroup>
  </div>
);

DropdownMenuInput.displayName = 'DropdownMenuInput';
