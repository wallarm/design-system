import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { Skeleton } from '../Skeleton';
import { Td, Tr } from './primitives';
import { useTableContext } from './TableContext';

interface TableLoadingStateProps {
  /**
   * Which edge of the table the skeletons represent. 'end' (default) is the
   * classic bottom loader; 'start' marks the prepend loader rendered above the
   * rows while a previous page loads — it gets its own test id and a data
   * attribute the scroll-shift compensation measures.
   */
  position?: 'start' | 'end';
  /** Number of skeleton rows; defaults to the table-level skeletonCount. */
  count?: number;
}

export const TableLoadingState: FC<TableLoadingStateProps> = ({ position = 'end', count }) => {
  const { table, skeletonCount } = useTableContext();
  const testId = useTestId(position === 'start' ? 'loading-start' : 'loading');
  const columns = table.getVisibleLeafColumns();

  return (
    <>
      {Array.from({ length: count ?? skeletonCount }, (_, rowIdx) => {
        const key = `skeleton-${rowIdx}`;

        return (
          <Tr
            key={key}
            data-testid={rowIdx === 0 ? testId : undefined}
            data-loading-position={position}
          >
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
