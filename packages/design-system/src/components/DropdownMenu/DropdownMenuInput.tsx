import type { FC, InputHTMLAttributes, Ref } from 'react';
import { Search } from '../../icons';
import { cn } from '../../utils/cn';
import { Input } from '../Input';

interface DropdownMenuInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  ref?: Ref<HTMLInputElement>;
}

// Ring space: p-3/-m-3 creates room for the Input's focus-visible:ring-3
// without being clipped by DropdownMenuContent's overflow.
// Icon left-15 = Input's px-12 + wrapper's p-3 offset.
export const DropdownMenuInput: FC<DropdownMenuInputProps> = ({ className, ...props }) => (
  <div className='relative mb-4 p-3 -m-3'>
    <Search className='absolute left-15 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none' />
    <Input type='text' {...props} className={cn('pl-32', className)} />
  </div>
);

DropdownMenuInput.displayName = 'DropdownMenuInput';
