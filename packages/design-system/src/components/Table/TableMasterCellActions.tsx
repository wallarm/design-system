import { type ReactNode, useState } from 'react';
import type { Row } from '@tanstack/react-table';
import { Ellipsis } from '../../icons';
import { cn } from '../../utils/cn';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../DropdownMenu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';

interface TableMasterCellActionsProps<T> {
  row: Row<T>;
  renderActions?: (row: Row<T>) => ReactNode;
  renderMenuForMoreAction?: (row: Row<T>) => ReactNode;
}

export const TableMasterCellActions = <T,>({
  row,
  renderActions,
  renderMenuForMoreAction,
}: TableMasterCellActionsProps<T>) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const actions = renderActions?.(row);
  const menuContent = renderMenuForMoreAction?.(row);

  if (!actions && !menuContent) return null;

  return (
    <div className={cn('absolute top-0 right-0 h-full', 'flex items-start pt-6 pr-6 pl-4 gap-2')}>
      {actions}
      {menuContent && (
        <Tooltip disabled={menuOpen}>
          <TooltipTrigger asChild>
            <span className='inline-flex'>
              <DropdownMenu onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    type='button'
                    className={cn(
                      'h-24 w-24 shrink-0 rounded-8',
                      'hover:bg-states-primary-hover',
                      'transition-colors cursor-pointer',
                      'inline-flex items-center justify-center bg-transparent border-0 p-0',
                    )}
                    aria-label='More'
                  >
                    <Ellipsis size='sm' />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>{menuContent}</DropdownMenuContent>
              </DropdownMenu>
            </span>
          </TooltipTrigger>
          <TooltipContent>More</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

TableMasterCellActions.displayName = 'TableMasterCellActions';
