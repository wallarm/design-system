import type { ButtonHTMLAttributes, FC, ReactNode, Ref } from 'react';
import { Menu } from '@ark-ui/react/menu';
import { type TestableProps, useTestId } from '../../utils/testId';

export interface DropdownMenuContextTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color'>,
    TestableProps {
  children: ReactNode;
  asChild?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export const DropdownMenuContextTrigger: FC<DropdownMenuContextTriggerProps> = ({
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('context-trigger', testIdProp);

  return (
    <Menu.ContextTrigger {...props} data-testid={testId}>
      {children}
    </Menu.ContextTrigger>
  );
};

DropdownMenuContextTrigger.displayName = 'DropdownMenuContextTrigger';
