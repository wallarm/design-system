import type { FC, ReactNode } from 'react';
import { cn } from '../../../utils/cn';
import { DropdownMenuContextTrigger } from '../../DropdownMenu';

interface TableContextMenuTriggerProps {
  children: ReactNode;
}

export const TableContextMenuTrigger: FC<TableContextMenuTriggerProps> = ({ children }) => (
  <DropdownMenuContextTrigger className={cn('w-full outline-none')}>
    {children}
  </DropdownMenuContextTrigger>
);

TableContextMenuTrigger.displayName = 'TableContextMenuTrigger';
