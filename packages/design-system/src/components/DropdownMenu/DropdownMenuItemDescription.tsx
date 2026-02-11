import type { FC, PropsWithChildren } from 'react';
import { Text } from '../Text';

export const DropdownMenuItemDescription: FC<PropsWithChildren> = ({ children }) => (
  <Text size='sm' color='secondary' data-slot='dropdown-menu-item-description'>
    {children}
  </Text>
);
