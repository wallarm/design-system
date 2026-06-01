import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cloneElement, isValidElement } from 'react';
import { Menu, useMenuContext } from '@ark-ui/react/menu';
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

/**
 * Injects `data-state="open"|"closed"` into the direct child when
 * the trigger is used **without** `asChild`.
 *
 * With `asChild`, Ark-UI's Slot already merges `data-state` into the child,
 * so no extra work is needed.
 */
const TriggerStateInjector: FC<{ children: ReactNode }> = ({ children }) => {
  const menu = useMenuContext();
  const state = menu.open ? 'open' : 'closed';

  if (isValidElement(children)) {
    return cloneElement(children, { 'data-state': state } as Record<string, string>);
  }

  return children;
};

export const DropdownMenuTrigger: FC<DropdownMenuTriggerProps> = ({
  variant = 'default',
  inset = false,
  asChild,
  children,
  ...props
}) => {
  const testId = useTestId('trigger');

  return (
    <Menu.Trigger {...props} asChild={asChild} data-testid={testId}>
      {asChild ? children : <TriggerStateInjector>{children}</TriggerStateInjector>}
    </Menu.Trigger>
  );
};

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';
