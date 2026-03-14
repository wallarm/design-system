import type { FC, PropsWithChildren } from 'react';
import { useTestId } from '../../utils/testId';
import { VStack } from '../Stack';

export const DropdownMenuItemContent: FC<PropsWithChildren> = ({ children }) => {
  const testId = useTestId('item-content');

  return (
    <VStack gap={0} align='start' data-testid={testId}>
      {children}
    </VStack>
  );
};
