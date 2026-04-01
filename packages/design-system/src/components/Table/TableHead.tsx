import type { FC } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { THead, Tr } from './primitives';
import { useTableContext } from './TableContext';
import { TableHeadCell } from './TableHeadCell';

export const TableHead: FC = () => {
  const { table } = useTableContext();
  const testId = useTestId('head');

  const hasTextDescription = table
    .getAllLeafColumns()
    .some(col => col.columnDef.meta?.description?.type === 'text');

  return (
    <THead
      className={cn('sticky top-0 z-30', hasTextDescription ? 'h-48' : 'h-32')}
      data-testid={testId}
    >
      {table.getHeaderGroups().map(headerGroup => (
        <Tr key={headerGroup.id}>
          {headerGroup.headers.map(header => (
            <TableHeadCell
              key={header.id}
              header={header}
              hasTextDescription={hasTextDescription}
            />
          ))}
        </Tr>
      ))}
    </THead>
  );
};

TableHead.displayName = 'TableHead';
