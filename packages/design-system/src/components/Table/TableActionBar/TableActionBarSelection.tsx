import type { FC } from 'react';
import { Link } from '../../Link';
import { HStack } from '../../Stack';
import { Text } from '../../Text';
import { useTableContext } from '../TableContext';

export const TableActionBarSelection: FC = () => {
  const { table } = useTableContext();
  const count = Object.keys(table.getState().rowSelection).length;
  const allSelected = table.getIsAllRowsSelected();

  const handleSelectAll = () => {
    table.toggleAllRowsSelected(true);
  };

  const handleClear = () => {
    table.resetRowSelection();
  };

  return (
    <div className='flex items-center gap-16 p-8'>
      <Text size='sm' color='primary-alt' weight='medium'>
        {count} selected
      </Text>

      <HStack gap={6}>
        <Link
          type={allSelected ? 'muted' : 'alt'}
          size='md'
          onClick={handleSelectAll}
          disabled={allSelected}
        >
          Select all
        </Link>

        <Text size='sm' color='tertiary-alt' weight='medium'>
          ·
        </Text>

        <Link type='alt' size='md' onClick={handleClear}>
          Clear
        </Link>
      </HStack>
    </div>
  );
};

TableActionBarSelection.displayName = 'TableActionBarSelection';
