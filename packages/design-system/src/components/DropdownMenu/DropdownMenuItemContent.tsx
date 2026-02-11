import type { FC, PropsWithChildren } from 'react';
import { VStack } from '../Stack';

export const DropdownMenuItemContent: FC<PropsWithChildren> = ({ children }) => (
  <VStack spacing={0} align='start'>
    {children}
  </VStack>
);
