import type { FC, PropsWithChildren } from 'react';
import { Menu } from '@ark-ui/react/menu';
import { useTestId } from '../../utils/testId';
import { dropdownMenuItemIndicatorClassName } from './classes';

export const DropdownMenuItemIndicator: FC<PropsWithChildren> = ({ children }) => {
  const testId = useTestId('item-indicator');

  return (
    <Menu.ItemIndicator data-testid={testId} className={dropdownMenuItemIndicatorClassName}>
      {children}
    </Menu.ItemIndicator>
  );
};

DropdownMenuItemIndicator.displayName = 'DropdownMenuItemIndicator';
