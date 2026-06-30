import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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

if (!('PointerEvent' in window)) {
  (window as any).PointerEvent = class extends Event {
    clientX = 0;
    pointerId = 0;
    constructor(type: string, params: any = {}) {
      super(type, params);
      Object.assign(this, params);
    }
  };
}

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

describe('TableLayout column engine — pinning', () => {
  const Pinned = () => {
    const { columns, controller } = useTableLayoutColumns([
      { columnId: 'a', width: 100, pin: 'left' },
      { columnId: 'b', width: 60, pin: 'left' },
      { columnId: 'c', width: 200 },
    ]);
    return (
      <TableLayout aria-label='Pinned' controller={controller}>
        <TableLayoutColumnGroup>
          {columns.map(c => (
            <TableLayoutColumn key={c.columnId} {...c} />
          ))}
        </TableLayoutColumnGroup>
        <TableLayoutBody>
          <TableLayoutRow rowId='r1'>
            <TableLayoutCell columnId='a'>A</TableLayoutCell>
            <TableLayoutCell columnId='b'>B</TableLayoutCell>
            <TableLayoutCell columnId='c'>C</TableLayoutCell>
          </TableLayoutRow>
        </TableLayoutBody>
      </TableLayout>
    );
  };

  it('applies cumulative sticky offsets and the last-pinned-left boundary class', () => {
    render(<Pinned />);
    const a = screen.getByRole('cell', { name: 'A' });
    const b = screen.getByRole('cell', { name: 'B' });
    expect(a).toHaveStyle({ position: 'sticky', left: '0px' });
    expect(b).toHaveStyle({ position: 'sticky', left: '100px' });
    expect(b.className).toContain('shadow-');
    expect(screen.getByRole('cell', { name: 'C' })).not.toHaveStyle({ position: 'sticky' });
  });
});

describe('TableLayout column engine — resize', () => {
  const Resizable = ({ onSizing }: { onSizing: (s: Record<string, number>) => void }) => {
    const { columns, controller } = useTableLayoutColumns(
      [{ columnId: 'a', width: 120, resizable: true, minWidth: 80 }],
      { onColumnSizingChange: onSizing },
    );
    return (
      <TableLayout aria-label='Resize' controller={controller}>
        <TableLayoutColumnGroup>
          {columns.map(c => (
            <TableLayoutColumn key={c.columnId} {...c} />
          ))}
        </TableLayoutColumnGroup>
        <TableLayoutHead>
          <TableLayoutRow>
            <TableLayoutHeaderCell columnId='a'>A</TableLayoutHeaderCell>
          </TableLayoutRow>
        </TableLayoutHead>
        <TableLayoutBody>
          <TableLayoutRow rowId='r1'>
            <TableLayoutCell columnId='a'>x</TableLayoutCell>
          </TableLayoutRow>
        </TableLayoutBody>
      </TableLayout>
    );
  };

  it('fires onColumnSizingChange with the clamped width on pointer drag (onEnd)', () => {
    const onSizing = vi.fn();
    render(<Resizable onSizing={onSizing} />);
    const handle = document.querySelector('[data-slot="resize-handle"]') as HTMLElement;
    expect(handle).not.toBeNull();
    // biome-ignore lint/suspicious/noEmptyBlockStatements: jsdom setPointerCapture mock
    handle.setPointerCapture = () => {};
    fireEvent.pointerDown(handle, { clientX: 200, pointerId: 1 });
    fireEvent(window, new (window as any).PointerEvent('pointermove', { clientX: 260 }));
    fireEvent(window, new (window as any).PointerEvent('pointerup', { clientX: 260 }));
    expect(onSizing).toHaveBeenCalledWith({ a: 180 }); // 120 + (260-200) = 180 ≥ minWidth
  });

  it('fires onColumnSizingChange on pointermove in onChange mode', () => {
    const onSizing = vi.fn();
    const OnChangeResizable = () => {
      const { columns, controller } = useTableLayoutColumns(
        [{ columnId: 'a', width: 120, resizable: true }],
        { columnResizeMode: 'onChange', onColumnSizingChange: onSizing },
      );
      return (
        <TableLayout aria-label='Resize onChange' controller={controller}>
          <TableLayoutColumnGroup>
            {columns.map(c => (
              <TableLayoutColumn key={c.columnId} {...c} />
            ))}
          </TableLayoutColumnGroup>
          <TableLayoutHead>
            <TableLayoutRow>
              <TableLayoutHeaderCell columnId='a'>A</TableLayoutHeaderCell>
            </TableLayoutRow>
          </TableLayoutHead>
          <TableLayoutBody>
            <TableLayoutRow rowId='r1'>
              <TableLayoutCell columnId='a'>x</TableLayoutCell>
            </TableLayoutRow>
          </TableLayoutBody>
        </TableLayout>
      );
    };
    render(<OnChangeResizable />);
    const handle = document.querySelector('[data-slot="resize-handle"]') as HTMLElement;
    expect(handle).not.toBeNull();
    // biome-ignore lint/suspicious/noEmptyBlockStatements: jsdom setPointerCapture mock
    handle.setPointerCapture = () => {};
    fireEvent.pointerDown(handle, { clientX: 200, pointerId: 1 });
    fireEvent(window, new (window as any).PointerEvent('pointermove', { clientX: 240 }));
    expect(onSizing).toHaveBeenCalledWith({ a: 160 }); // 120 + (240-200) = 160
  });
});
