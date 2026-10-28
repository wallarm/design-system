import type { ReactNode } from 'react';

import { cn } from '../../utils/cn';

interface TableMasterCellActionsProps {
  children: ReactNode;
}

export const TableMasterCellActions = ({ children }: TableMasterCellActionsProps) => {
  return (
    <div
      data-master-cell-action=''
      className={cn(
        'flex shrink-0 items-center gap-2 pr-4 pl-4',
        'pointer-events-none opacity-0',
        'group-hover/row:pointer-events-auto group-hover/row:opacity-100',
        'group-data-[preview-active]/row:pointer-events-auto group-data-[preview-active]/row:opacity-100',
        'has-[[data-state=open]]:pointer-events-auto has-[[data-state=open]]:opacity-100',
        '[&_[data-state=open]]:overlay [&_[data-state=open]]:overlay-states-primary-hover',
      )}
    >
      {children}
    </div>
  );
};

TableMasterCellActions.displayName = 'TableMasterCellActions';
