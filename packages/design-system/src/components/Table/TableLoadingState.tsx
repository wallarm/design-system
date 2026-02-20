import type { FC } from 'react';
import { Skeleton } from '../Skeleton';
import { TABLE_SKELETON_ROWS, TABLE_SKELETON_ROWS_APPEND } from './lib';
import { Td, Tr } from './primitives';
import { useTableContext } from './TableContext';

export const TableLoadingState: FC = () => {
  const { table } = useTableContext();
  const columns = table.getVisibleLeafColumns();
  const rows = table.getRowModel().rows;
  const skeletonCount = rows.length > 0 ? TABLE_SKELETON_ROWS_APPEND : TABLE_SKELETON_ROWS;

  return (
    <>
      {Array.from({ length: skeletonCount }, (_, rowIdx) => {
        const key = `skeleton-${rowIdx}`;

        return (
          <Tr key={key}>
            {columns.map(column => (
              <Td
                key={column.id}
                className='px-16 py-8 border-b border-r border-border-primary-light'
                style={{ width: column.getSize() }}
              >
                <Skeleton className='h-36 w-full' />
              </Td>
            ))}
          </Tr>
        );
      })}
    </>
  );
};

TableLoadingState.displayName = 'TableLoadingState';
