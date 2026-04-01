import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface TableMasterCellActionsProps {
  children: ReactNode;
}

export const TableMasterCellActions = ({ children }: TableMasterCellActionsProps) => {
  return (
    <div
      className={cn(
        'shrink-0 grid grid-cols-[0fr] opacity-0 pr-4',
        'group-hover/row:grid-cols-[1fr] group-hover/row:opacity-100 group-hover/row:pl-4',
        'group-data-[selected]/row:grid-cols-[1fr] group-data-[selected]/row:opacity-100 group-data-[selected]/row:pl-4',
        'group-data-[preview-active]/row:grid-cols-[1fr] group-data-[preview-active]/row:opacity-100 group-data-[preview-active]/row:pl-4',
      )}
    >
      <div className='overflow-hidden flex items-center gap-2'>{children}</div>
    </div>
  );
};

TableMasterCellActions.displayName = 'TableMasterCellActions';
