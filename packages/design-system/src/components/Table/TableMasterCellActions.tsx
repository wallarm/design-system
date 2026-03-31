import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface TableMasterCellActionsProps {
  children: ReactNode;
}

export const TableMasterCellActions = ({ children }: TableMasterCellActionsProps) => {
  return (
    <div
      className={cn(
        'shrink-0 flex items-center gap-2 overflow-hidden',
        'max-w-0 group-hover/row:max-w-[200px] group-hover/row:pl-4',
        'opacity-0 group-hover/row:opacity-100',
        'transition-[max-width,opacity] duration-150',
      )}
    >
      {children}
    </div>
  );
};

TableMasterCellActions.displayName = 'TableMasterCellActions';
