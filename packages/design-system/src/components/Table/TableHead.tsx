import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { THead, Tr } from './primitives';
import { useTableContext } from './TableContext';
import { TableHeadCell } from './TableHeadCell';

export const TableHead: FC = () => {
  const { table } = useTableContext();
  const testId = useTestId('head');

  return (
    <THead className='sticky top-0 z-30 h-32' data-testid={testId}>
      {table.getHeaderGroups().map(headerGroup => (
        <Tr key={headerGroup.id}>
          {headerGroup.headers.map(header => (
            <TableHeadCell key={header.id} header={header} />
          ))}
        </Tr>
      ))}
    </THead>
  );
};

TableHead.displayName = 'TableHead';
