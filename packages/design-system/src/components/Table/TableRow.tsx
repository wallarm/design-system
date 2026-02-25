import { memo, type Ref } from 'react';
import type { Row } from '@tanstack/react-table';
import { cn } from '../../utils/cn';
import { TABLE_EXPAND_COLUMN_ID, TABLE_SELECT_COLUMN_ID } from './lib';
import { Td, Tr } from './primitives';
import { TableBodyCell } from './TableBody';
import { useTableContext } from './TableContext';
import { TableRowExpanded } from './TableRowExpanded';

const SYSTEM_COLUMN_IDS = new Set([TABLE_EXPAND_COLUMN_ID, TABLE_SELECT_COLUMN_ID]);

interface TableRowProps<T> {
  row: Row<T>;
  ref?: Ref<HTMLTableRowElement>;
  'data-index'?: number;
}

const TableRowInner = <T,>({ row, ref, 'data-index': dataIndex }: TableRowProps<T>) => {
  const { expandingEnabled } = useTableContext<T>();
  const isGroupParent = row.subRows.length > 0;
  const isSelected = isGroupParent ? row.getIsAllSubRowsSelected() : row.getIsSelected();

  if (isGroupParent) {
    const cells = row.getVisibleCells();
    const systemCells = cells.filter(c => SYSTEM_COLUMN_IDS.has(c.column.id));
    const dataCells = cells.filter(c => !SYSTEM_COLUMN_IDS.has(c.column.id));
    const firstDataCell = dataCells[0];

    return (
      <>
        <Tr
          ref={ref}
          data-index={dataIndex}
          className='group/row'
          data-selected={isSelected || undefined}
          aria-selected={isSelected || undefined}
        >
          {systemCells.map(cell => (
            <TableBodyCell key={cell.id} cell={cell} disablePinnedShadow />
          ))}
          {firstDataCell && (
            <TableBodyCell cell={firstDataCell} className='border-r-0' disablePinnedShadow />
          )}
          {dataCells.slice(1).map(cell => (
            <Td
              key={cell.id}
              className={cn(
                'border-b border-border-primary-light bg-bg-surface-2 overlay',
                'group-hover/row:overlay-states-primary-hover group-data-selected/row:overlay-states-primary-active',
              )}
              style={{ width: cell.column.getSize() }}
              aria-hidden='true'
            />
          ))}
        </Tr>
        {expandingEnabled && <TableRowExpanded row={row} />}
      </>
    );
  }

  return (
    <>
      <Tr
        ref={ref}
        data-index={dataIndex}
        className='group/row'
        data-selected={isSelected || undefined}
        aria-selected={isSelected || undefined}
      >
        {row.getVisibleCells().map(cell => (
          <TableBodyCell key={cell.id} cell={cell} />
        ))}
      </Tr>
      {expandingEnabled && <TableRowExpanded row={row} />}
    </>
  );
};

TableRowInner.displayName = 'TableRow';

export const TableRow = memo(TableRowInner) as typeof TableRowInner;
