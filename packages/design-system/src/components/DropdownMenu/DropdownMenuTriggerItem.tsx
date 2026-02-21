import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { Menu } from '@ark-ui/react/menu';
import { ChevronRight } from '../../icons';
import { cn } from '../../utils/cn';
import { dropdownMenuItemVariants } from './classes';
import type { DropdownMenuItemVariantsProps } from './DropdownMenuItem';

interface DropdownMenuTriggerProps
  extends HTMLAttributes<HTMLButtonElement>,
    DropdownMenuItemVariantsProps {
  children: ReactNode;
  asChild?: boolean;
  inset?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export const DropdownMenuTriggerItem: FC<DropdownMenuTriggerProps> = ({
  variant = 'default',
  inset = false,
  children,
}) => (
  <Menu.TriggerItem className={cn(dropdownMenuItemVariants({ variant, inset }))}>
    {children}

    <div className='ml-auto before:content-[""] before:flex before:w-8 before:shrink-0'>
      <ChevronRight />
    </div>
  </Menu.TriggerItem>
);

DropdownMenuTriggerItem.displayName = 'DropdownMenuTriggerItem';
