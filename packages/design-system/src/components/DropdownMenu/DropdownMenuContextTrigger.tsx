import type { ButtonHTMLAttributes, FC, ReactNode, Ref } from 'react';
import { Menu } from '@ark-ui/react/menu';
import { cn } from '../../utils/cn';
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
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('context-trigger', testIdProp);

  return (
    <Menu.ContextTrigger
      {...props}
      // Zag.js forces `user-select: none` (inline style) on the context-trigger so a
      // touch long-press reliably opens the menu instead of the OS text-selection
      // callout. Restore selection for mouse/trackpad only (`pointer: fine`) — touch
      // keeps the library default so long-press-to-open still wins there.
      className={cn('[@media(pointer:fine)]:select-text!', className)}
      data-testid={testId}
    >
      {children}
    </Menu.ContextTrigger>
  );
};

DropdownMenuContextTrigger.displayName = 'DropdownMenuContextTrigger';
