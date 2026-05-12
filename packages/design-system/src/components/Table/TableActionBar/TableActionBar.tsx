import type { FC, ReactNode } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react/popover';
import { Portal as ArkUiPortal } from '@ark-ui/react/portal';
import { useTestId } from '../../../utils/testId';
import { bulkBarSurfaceClasses } from '../../BulkBar/classes';
import { HStack } from '../../Stack';
import { TableActionBarSelection } from './TableActionBarSelection';

export interface TableActionBarProps {
  children?: ReactNode;
}

export const TableActionBar: FC<TableActionBarProps> = ({ children }) => {
  const testId = useTestId('action-bar');

  return (
    <ArkUiPortal>
      <ArkUiPopover.Positioner style={{ zIndex: 50 }}>
        <ArkUiPopover.Content data-testid={testId} className={bulkBarSurfaceClasses}>
          <HStack gap={40} align='center'>
            <TableActionBarSelection />

            <HStack gap={8} align='center'>
              {children}
            </HStack>
          </HStack>
        </ArkUiPopover.Content>
      </ArkUiPopover.Positioner>
    </ArkUiPortal>
  );
};

TableActionBar.displayName = 'TableActionBar';
