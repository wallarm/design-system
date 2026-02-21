import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { Menu } from '@ark-ui/react/menu';
import type { DropdownMenuItemVariantsProps } from './DropdownMenuItem';

interface DropdownMenuContextTriggerProps
  extends HTMLAttributes<HTMLButtonElement>,
    DropdownMenuItemVariantsProps {
  children: ReactNode;
  asChild?: boolean;
  inset?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export const DropdownMenuContextTrigger: FC<DropdownMenuContextTriggerProps> = ({
  variant = 'default',
  inset = false,
  children,
  ...props
}) => {
  return <Menu.ContextTrigger {...props}>{children}</Menu.ContextTrigger>;
};

DropdownMenuContextTrigger.displayName = 'DropdownMenuContextTrigger';
