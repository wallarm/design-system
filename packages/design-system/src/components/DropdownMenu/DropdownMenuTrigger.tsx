import type { ButtonHTMLAttributes, FC, ReactNode, Ref } from 'react';
import { cloneElement, isValidElement } from 'react';
import { Menu, useMenuContext } from '@ark-ui/react/menu';
import { type TestableProps, useTestId } from '../../utils/testId';

export interface DropdownMenuTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color'>,
    TestableProps {
  children: ReactNode;
  asChild?: boolean;
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
  asChild,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('trigger', testIdProp);

  return (
    <Menu.Trigger {...props} asChild={asChild} data-testid={testId}>
      {asChild ? children : <TriggerStateInjector>{children}</TriggerStateInjector>}
    </Menu.Trigger>
  );
};

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';
