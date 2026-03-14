import type { FC, PropsWithChildren } from 'react';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';

export const DropdownMenuItemDescription: FC<PropsWithChildren> = ({ children }) => {
  const testId = useTestId('item-description');

  return (
    <Text
      size='sm'
      color='secondary'
      data-slot='dropdown-menu-item-description'
      data-testid={testId}
    >
      {children}
    </Text>
  );
};
