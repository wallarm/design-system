import type { FC } from 'react';
import { TBody } from './primitives';
import { TableBodyVirtualized } from './TableBodyVirtualized';
import { useTableContext } from './TableContext';
import { TableLoadingState } from './TableLoadingState';
import { TableRow } from './TableRow';

export const TableBody: FC = () => {
  const ctx = useTableContext();
  const { table, isLoading, virtualized } = ctx;
  const rows = table.getRowModel().rows;
  const hasData = rows.length > 0;

  if (virtualized && hasData) {
    return <TableBodyVirtualized />;
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
