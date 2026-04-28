import type { FC } from 'react';
import { useTestId } from '../../../utils/testId';
import { Link } from '../../Link';
import { HStack } from '../../Stack';
import { Text } from '../../Text';
import { useSelectionContext } from '../useSelectionContext';

export const SelectionBulkBarSummary: FC = () => {
  const { isAllSelected, selectedIds, selectAll, clear } = useSelectionContext();
  const testId = useTestId('bulk-bar-summary');
  const count = selectedIds.size;

  return (
    <div
      data-testid={testId}
      className='flex flex-nowrap items-center gap-16 p-8 whitespace-nowrap'
    >
      <Text size='sm' color='primary-alt' weight='medium' truncate>
        {count} selected
      </Text>

      <HStack gap={6}>
        <Link
          type={isAllSelected ? 'muted' : 'alt'}
          size='md'
          onClick={selectAll}
          disabled={isAllSelected}
          className='whitespace-nowrap'
        >
          Select all
        </Link>

        <Text size='sm' color='tertiary-alt' weight='medium'>
          ·
        </Text>

        <Link type='alt' size='md' onClick={clear}>
          Clear
        </Link>
      </HStack>
    </div>
  );
};

SelectionBulkBarSummary.displayName = 'SelectionBulkBarSummary';
