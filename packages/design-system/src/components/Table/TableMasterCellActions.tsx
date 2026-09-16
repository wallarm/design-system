import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface TableMasterCellActionsProps {
  children: ReactNode;
}

export const TableMasterCellActions = ({ children }: TableMasterCellActionsProps) => {
  return (
    <div
      className={cn(
        'shrink-0 pl-4 pr-4 flex items-center gap-2',
        'opacity-0 pointer-events-none',
        'group-hover/row:opacity-100 group-hover/row:pointer-events-auto',
        'group-data-[selected]/row:opacity-100 group-data-[selected]/row:pointer-events-auto',
        'group-data-[preview-active]/row:opacity-100 group-data-[preview-active]/row:pointer-events-auto',
      )}
    >
      {children}
    </div>
  );
};

TableMasterCellActions.displayName = 'TableMasterCellActions';
