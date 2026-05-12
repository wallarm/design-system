import type { FC } from 'react';
import { useTestId } from '../../../utils/testId';
import { BulkBarSummary } from '../../BulkBar/BulkBarSummary';
import { useSelectionContext } from '../useSelectionContext';

export const SelectionBulkBarSummary: FC = () => {
  const { isAllSelected, selectedIds, selectAll, clear } = useSelectionContext();
  const testId = useTestId('bulk-bar-summary');

  return (
    <BulkBarSummary
      data-testid={testId}
      count={selectedIds.size}
      isAllSelected={isAllSelected}
      onSelectAll={selectAll}
      onClear={clear}
      nowrap
    />
  );
};

SelectionBulkBarSummary.displayName = 'SelectionBulkBarSummary';
