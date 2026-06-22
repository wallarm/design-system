import { Children, type FC, isValidElement, type ReactNode } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react/popover';
import { Portal as ArkUiPortal } from '@ark-ui/react/portal';
import { useTestId } from '../../../utils/testId';
import { bulkBarSurfaceClasses } from '../../BulkBar/classes';
import { HStack } from '../../Stack';
import { TableActionBarSelection } from './TableActionBarSelection';

export interface TableActionBarProps {
  /**
   * Action controls rendered on the right (consumer-owned `<Button>`s, etc.).
   * A single direct `<TableActionBarSelection>` child is recognized and used to
   * override the default selection summary on the left; everything else is
   * treated as an action control.
   */
  children?: ReactNode;
}

export const TableActionBar: FC<TableActionBarProps> = ({ children }) => {
  const testId = useTestId('action-bar');

  // Pull an optional consumer-supplied selection override out of the children;
  // the remaining nodes are action controls.
  const items = Children.toArray(children);
  const selectionOverride = items.find(
    child => isValidElement(child) && child.type === TableActionBarSelection,
  );
  const actions = items.filter(child => child !== selectionOverride);

  return (
    <ArkUiPortal>
      <ArkUiPopover.Positioner style={{ zIndex: 50 }}>
        <ArkUiPopover.Content data-testid={testId} className={bulkBarSurfaceClasses}>
          <HStack gap={40} align='center'>
            {selectionOverride ?? <TableActionBarSelection />}

            <HStack gap={8} align='center'>
              {actions}
            </HStack>
          </HStack>
        </ArkUiPopover.Content>
      </ArkUiPopover.Positioner>
    </ArkUiPortal>
  );
};

TableActionBar.displayName = 'TableActionBar';
