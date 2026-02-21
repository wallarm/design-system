import type { FC, ReactNode } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react/popover';
import { Portal as ArkUiPortal } from '@ark-ui/react/portal';
import { cn } from '../../../utils/cn';
import { HStack } from '../../Stack';
import { TableActionBarSelection } from './TableActionBarSelection';

export interface TableActionBarProps {
  children?: ReactNode;
}

export const TableActionBar: FC<TableActionBarProps> = ({ children }) => (
  <ArkUiPortal>
    <ArkUiPopover.Positioner>
      <ArkUiPopover.Content
        className={cn(
          'bg-component-toast-bg rounded-16 shadow-lg',
          'pl-12 pr-8 py-8',

          // Animation opened
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom',
          // Animation closed
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom',
        )}
      >
        <HStack spacing={40} align='center'>
          <TableActionBarSelection />

          <HStack spacing={8} align='center'>
            {children}
          </HStack>
        </HStack>
      </ArkUiPopover.Content>
    </ArkUiPopover.Positioner>
  </ArkUiPortal>
);

TableActionBar.displayName = 'TableActionBar';
