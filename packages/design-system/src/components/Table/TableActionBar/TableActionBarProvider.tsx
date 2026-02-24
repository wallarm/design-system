import type { FC, ReactNode } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react/popover';
import { useTableContext } from '../TableContext';

interface TableActionBarProviderProps {
  children: ReactNode;
}

const TABLE_ACTION_BAR_HEIGHT = 52;

const TABLE_ACTION_BAR_OFFSET = 32;

const TABLE_ACTION_BAR_POSITIONING: ArkUiPopover.RootProps['positioning'] = Object.freeze({
  strategy: 'absolute',
  placement: 'bottom',
  gutter: 32,
  overlap: true,
  flip: false,
  offset: {
    mainAxis: -(TABLE_ACTION_BAR_HEIGHT + TABLE_ACTION_BAR_OFFSET),
  },
});

export const TableActionBarProvider: FC<TableActionBarProviderProps> = ({ children }) => {
  const { table, selectionEnabled } = useTableContext();

  const selectedCount = selectionEnabled ? Object.keys(table.getState().rowSelection).length : 0;

  return (
    <ArkUiPopover.Root
      open={selectedCount > 0}
      closeOnInteractOutside={false}
      portalled={false}
      positioning={TABLE_ACTION_BAR_POSITIONING}
    >
      {children}
    </ArkUiPopover.Root>
  );
};
