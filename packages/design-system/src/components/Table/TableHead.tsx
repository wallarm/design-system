import type { FC } from 'react';
import { THead, Tr } from './primitives';
import { useTableContext } from './TableContext';
import { TableHeadCell } from './TableHeadCell';

export const TableHead: FC = () => {
  const { table, theadRef } = useTableContext();

  const hasTextDescription = table
    .getAllLeafColumns()
    .some(col => col.columnDef.meta?.description?.type === 'text');

  return (
    <THead ref={theadRef} className='sticky top-0 z-30 h-32'>
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
