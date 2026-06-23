import type { FC, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useTableContext } from './TableContext';

interface TableEmptyStateProps {
  children?: ReactNode;
}

export const TableEmptyState: FC<TableEmptyStateProps> = ({ children }) => {
  const testId = useTestId('empty-state');
  const { table, isLoading } = useTableContext();

  const { rows } = table.getRowModel();

  const tableIsEmpty = !rows.length && !isLoading;

  if (!tableIsEmpty) return null;

  return (
    <div data-testid={testId} className={cn('py-128')}>
      {children}
    </div>
  );
};

TableEmptyState.displayName = 'TableEmptyState';
