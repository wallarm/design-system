import type { FC, ReactNode } from 'react';
import { DropdownMenu } from '../../DropdownMenu';

interface TableContextMenuProps {
  children: ReactNode;
}

export const TableContextMenu: FC<TableContextMenuProps> = ({ children }) => (
  <DropdownMenu>{children}</DropdownMenu>
);

TableContextMenu.displayName = 'TableContextMenu';
