import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface TableMasterCellActionsProps {
  children: ReactNode;
}

export const TableMasterCellActions = ({ children }: TableMasterCellActionsProps) => {
  return (
    <div
      className={cn(
        'shrink-0 grid grid-cols-[0fr] group-hover/row:grid-cols-[1fr]',
        'opacity-0 group-hover/row:opacity-100',
        'transition-[grid-template-columns,opacity] duration-150',
      )}
    >
      <div className='overflow-hidden flex items-center gap-2'>{children}</div>
    </div>
  );
};

TableMasterCellActions.displayName = 'TableMasterCellActions';
