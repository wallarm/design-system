import type { FC } from 'react';
import { Skeleton } from '../Skeleton';
import { Td, Tr } from './primitives';
import { useTableContext } from './TableContext';

export const TableLoadingState: FC = () => {
  const { table, skeletonCount } = useTableContext();
  const columns = table.getVisibleLeafColumns();

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
                <Skeleton className='h-20 w-full' />
              </Td>
            ))}
          </Tr>
        );
      })}
    </>
  );
};

TableLoadingState.displayName = 'TableLoadingState';
