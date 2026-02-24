import type { FC, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useTableContext } from './TableContext';

interface TableEmptyStateProps {
  children?: ReactNode;
}

export const TableEmptyState: FC<TableEmptyStateProps> = ({ children }) => {
  const { table } = useTableContext();

  const { rows } = table.getRowModel();

  const tableIsEmpty = !rows.length;

  if (!tableIsEmpty) return null;

  return <div className={cn('py-128')}>{children}</div>;
};

TableEmptyState.displayName = 'TableEmptyState';
