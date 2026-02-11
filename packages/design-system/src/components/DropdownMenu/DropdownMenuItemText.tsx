import type { FC, PropsWithChildren } from 'react';
import { Text } from '../Text';

export const DropdownMenuItemText: FC<PropsWithChildren> = ({ children }) => (
  <Text size='sm'>{children}</Text>
);
