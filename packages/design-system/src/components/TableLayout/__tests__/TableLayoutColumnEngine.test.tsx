import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  TableLayout,
  TableLayoutBody,
  TableLayoutCell,
  TableLayoutColumn,
  TableLayoutColumnGroup,
  TableLayoutHead,
  TableLayoutHeaderCell,
  TableLayoutRow,
  useTableLayoutColumns,
} from '..';

const HookTable = ({ visibility }: { visibility?: Record<string, boolean> }) => {
  const { columns, controller } = useTableLayoutColumns(
    [
      { columnId: 'name', width: 120, align: 'left' },
      { columnId: 'count', width: 80, align: 'right' },
      { columnId: 'gone', width: 40 },
    ],
    { columnVisibility: visibility },
  );
  return (
    <TableLayout aria-label='Engine' controller={controller}>
      <TableLayoutColumnGroup>
        {columns.map(c => (
          <TableLayoutColumn key={c.columnId} {...c} />
        ))}
      </TableLayoutColumnGroup>
      <TableLayoutHead>
        <TableLayoutRow>
          <TableLayoutHeaderCell columnId='name'>Name</TableLayoutHeaderCell>
          <TableLayoutHeaderCell columnId='count'>Count</TableLayoutHeaderCell>
          <TableLayoutHeaderCell columnId='gone'>Gone</TableLayoutHeaderCell>
        </TableLayoutRow>
      </TableLayoutHead>
      <TableLayoutBody>
        <TableLayoutRow rowId='r1'>
          <TableLayoutCell columnId='name'>Alpha</TableLayoutCell>
          <TableLayoutCell columnId='count'>7</TableLayoutCell>
          <TableLayoutCell columnId='gone'>x</TableLayoutCell>
        </TableLayoutRow>
      </TableLayoutBody>
    </TableLayout>
  );
};

describe('TableLayout column engine — controller wiring', () => {
  it('inherits align via the controller resolved map', () => {
    render(<HookTable />);
    expect(screen.getByRole('cell', { name: '7' })).toHaveClass('text-right');
    expect(screen.getByRole('cell', { name: 'Alpha' })).not.toHaveClass('text-right');
  });

  it('renders one <col> per visible column', () => {
    const { container } = render(<HookTable />);
    expect(container.querySelectorAll('colgroup > col')).toHaveLength(3);
  });
});
