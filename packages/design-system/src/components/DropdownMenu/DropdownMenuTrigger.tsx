import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { Menu } from '@ark-ui/react/menu';
import { useTestId } from '../../utils/testId';
import type { DropdownMenuItemVariantsProps } from './DropdownMenuItem';

interface DropdownMenuTriggerProps
  extends HTMLAttributes<HTMLButtonElement>,
    DropdownMenuItemVariantsProps {
  children: ReactNode;
  asChild?: boolean;
  inset?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export const DropdownMenuTrigger: FC<DropdownMenuTriggerProps> = ({
  variant = 'default',
  inset = false,
  children,
  ...props
}) => {
  const testId = useTestId('trigger');

  return (
    <Menu.Trigger {...props} data-testid={testId}>
      {children}
    </Menu.Trigger>
  );
};

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';
