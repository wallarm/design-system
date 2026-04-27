import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { Checkbox, CheckboxIndicator } from '../Checkbox';
import { useSelectionContext } from './useSelectionContext';

export interface SelectionAllProps {
  'data-testid'?: string;
}

export const SelectionAll: FC<SelectionAllProps> = ({ 'data-testid': testIdProp }) => {
  const { isAllSelected, isIndeterminate, enabledItemIds, selectAll, clear } =
    useSelectionContext();
  const fallbackTestId = useTestId('all');
  const testId = testIdProp ?? fallbackTestId;

  return (
    <Checkbox
      data-testid={testId}
      data-slot='selection-all'
      checked={isIndeterminate ? 'indeterminate' : isAllSelected}
      disabled={enabledItemIds.length === 0}
      onCheckedChange={() => (isAllSelected ? clear() : selectAll())}
    >
      <CheckboxIndicator />
    </Checkbox>
  );
};

SelectionAll.displayName = 'SelectionAll';
