import type { FC } from 'react';
import { TBody } from '../primitives';
import { useTableContext } from '../TableContext';
import { TableLoadingState } from '../TableLoadingState';
import { TableRow } from '../TableRow';
import { TableBodyVirtualizedContainer } from './TableBodyVirtualizedContainer';
import { TableBodyVirtualizedWindow } from './TableBodyVirtualizedWindow';

export const TableBody: FC = () => {
  const { table, isLoading, virtualized } = useTableContext();
  const rows = table.getRowModel().rows;
  const hasData = rows.length > 0;

  if (virtualized && hasData) {
    if (virtualized === 'window') {
      return <TableBodyVirtualizedWindow />;
    }

    return <TableBodyVirtualizedContainer />;
  }

  return (
    <TBody>
      {rows.map(row => {
        return <TableRow key={row.id} row={row} />;
      })}
      {isLoading && <TableLoadingState />}
    </TBody>
  );
};

TableBody.displayName = 'TableBody';
