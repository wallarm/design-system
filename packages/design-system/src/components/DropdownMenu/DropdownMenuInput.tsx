import type { FC, InputHTMLAttributes, Ref } from 'react';
import { Search } from '../../icons';
import { cn } from '../../utils/cn';
import { Input } from '../Input';

interface DropdownMenuInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  ref?: Ref<HTMLInputElement>;
}

export const DropdownMenuInput: FC<DropdownMenuInputProps> = ({
  className,
  ...props
}) => (
  <div className='relative mb-4 p-3 -m-3'>
    <Search className='absolute left-15 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none' />
    <Input
      type='text'
      {...props}
      className={cn('pl-32', className)}
    />
  </div>
);

DropdownMenuInput.displayName = 'DropdownMenuInput';
