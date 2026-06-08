import type { FC } from 'react';
import {
  BulkBarSummary,
  BulkBarSummaryClear,
  BulkBarSummaryCount,
  BulkBarSummarySelectAll,
  BulkBarSummarySeparator,
} from '../../BulkBar';
import { useTableContext } from '../TableContext';

export const TableActionBarSelection: FC = () => {
  const { table } = useTableContext();

  const count = Object.keys(table.getState().rowSelection).length;
  const isAllSelected = table.getIsAllRowsSelected();

  return (
    <BulkBarSummary>
      <BulkBarSummaryCount count={count} />
      <BulkBarSummarySelectAll
        onClick={() => table.toggleAllRowsSelected(true)}
        disabled={isAllSelected}
      />
      <BulkBarSummarySeparator />
      <BulkBarSummaryClear onClick={() => table.resetRowSelection()} />
    </BulkBarSummary>
  );
};

TableActionBarSelection.displayName = 'TableActionBarSelection';
