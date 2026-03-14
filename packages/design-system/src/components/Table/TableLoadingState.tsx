import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { Skeleton } from '../Skeleton';
import { Td, Tr } from './primitives';
import { useTableContext } from './TableContext';

export const TableLoadingState: FC = () => {
  const { table, skeletonCount } = useTableContext();
  const testId = useTestId('loading');
  const columns = table.getVisibleLeafColumns();

  return (
    <>
      {Array.from({ length: skeletonCount }, (_, rowIdx) => {
        const key = `skeleton-${rowIdx}`;

        return (
          <Tr key={key} data-testid={rowIdx === 0 ? testId : undefined}>
            {columns.map(column => (
              <Td
                key={column.id}
                className='px-16 py-8 border-b border-r border-border-primary-light'
                style={{ width: column.getSize() }}
              >
                <Skeleton width='100%' height='20px' />
              </Td>
            ))}
          </Tr>
        );
      })}
    </>
  );
};

TableLoadingState.displayName = 'TableLoadingState';
