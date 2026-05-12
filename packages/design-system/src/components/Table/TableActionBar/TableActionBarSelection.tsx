import type { FC } from 'react';
import { useTestId } from '../../../utils/testId';
import { BulkBarSummary } from '../../BulkBar/BulkBarSummary';
import { useTableContext } from '../TableContext';

export const TableActionBarSelection: FC = () => {
  const { table } = useTableContext();
  const testId = useTestId('action-bar-selection');

  return (
    <BulkBarSummary
      data-testid={testId}
      count={Object.keys(table.getState().rowSelection).length}
      isAllSelected={table.getIsAllRowsSelected()}
      onSelectAll={() => table.toggleAllRowsSelected(true)}
      onClear={() => table.resetRowSelection()}
    />
  );
};

TableActionBarSelection.displayName = 'TableActionBarSelection';
