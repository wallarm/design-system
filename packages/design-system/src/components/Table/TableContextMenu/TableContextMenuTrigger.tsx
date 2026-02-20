import type { FC, ReactNode } from 'react';
import { DropdownMenuContextTrigger } from '../../DropdownMenu';

interface TableContextMenuTriggerProps {
  children: ReactNode;
}

export const TableContextMenuTrigger: FC<TableContextMenuTriggerProps> = ({ children }) => (
  <DropdownMenuContextTrigger asChild>
    <div className='-mx-16 -my-8 px-16 py-8'>{children}</div>
  </DropdownMenuContextTrigger>
);

TableContextMenuTrigger.displayName = 'TableContextMenuTrigger';
