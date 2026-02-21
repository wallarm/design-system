import type { FC, HTMLAttributes, Ref } from 'react';
import { Menu } from '@ark-ui/react/menu';
import { cn } from '../../utils/cn';

export type DropdownMenuSeparatorProps = HTMLAttributes<HTMLHRElement> & {
  ref?: Ref<HTMLHRElement>;
};

export const DropdownMenuSeparator: FC<DropdownMenuSeparatorProps> = ({ className, ...props }) => (
  <Menu.Separator
    className={cn('mx-8 my-4 h-px bg-border-primary border-none', className)}
    {...props}
  />
);

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';
