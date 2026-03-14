import type { FC, PropsWithChildren } from 'react';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';

export const DropdownMenuItemText: FC<PropsWithChildren> = ({ children }) => {
  const testId = useTestId('item-text');

  return (
    <Text size='sm' data-testid={testId}>
      {children}
    </Text>
  );
};
