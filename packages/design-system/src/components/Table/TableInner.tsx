import type { FC, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { tableContainerVariants } from './classes';
import { TableActionBarAnchor, TableActionBarProvider } from './TableActionBar';
import { TableBody } from './TableBody';
import { useTableContext } from './TableContext';
import { TableHead } from './TableHead';
import { TableSettingsMenu } from './TableSettingsMenu';

interface TableInnerProps {
  isEmpty: boolean;
  virtualized: boolean;
  showSettings: boolean;
  ariaLabel?: string;
  children?: ReactNode;
}

export const TableInner: FC<TableInnerProps> = ({
  isEmpty,
  virtualized,
  showSettings,
  ariaLabel,
  children,
}) => {
  const { containerRef } = useTableContext();

  return (
    <TableActionBarProvider>
      <TableActionBarAnchor>
        <div
          ref={containerRef}
          className={tableContainerVariants({ virtualized })}
          data-table-scroll-container
          tabIndex={-1}
        >
          <table className={cn('table-fixed w-full border-collapse')} aria-label={ariaLabel}>
            <TableHead />
            {!isEmpty && <TableBody />}
          </table>

          {children}
        </div>

        {showSettings && <TableSettingsMenu />}
      </TableActionBarAnchor>
    </TableActionBarProvider>
  );
};

TableInner.displayName = 'TableInner';
