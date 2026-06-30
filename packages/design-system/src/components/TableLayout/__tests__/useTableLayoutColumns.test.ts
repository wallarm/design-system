import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTableLayoutColumns } from '../useTableLayoutColumns';

const defs = [
  { columnId: 'a', pin: 'left' as const, width: 100, resizable: true, minWidth: 80 },
  { columnId: 'b', width: 50 },
  { columnId: 'c', width: 50, hidden: true },
];

describe('useTableLayoutColumns', () => {
  it('returns visible columns in order and a full resolved map', () => {
    const { result } = renderHook(() => useTableLayoutColumns(defs));
    expect(result.current.columns.map(c => c.columnId)).toEqual(['a', 'b']); // c hidden
    expect(result.current.controller.resolved.a.stickyStyle).toEqual({
      position: 'sticky',
      left: '0px',
    });
    expect(result.current.controller.resolved.c.hidden).toBe(true); // present for self-hide
  });

  it('setColumnSize (uncontrolled) updates width and fires onColumnSizingChange', () => {
    const onSizing = vi.fn();
    const { result } = renderHook(() =>
      useTableLayoutColumns(defs, { onColumnSizingChange: onSizing }),
    );
    act(() => result.current.controller.setColumnSize('a', 140));
    expect(onSizing).toHaveBeenCalledWith({ a: 140 });
    expect(result.current.controller.resolved.a.width).toBe(140);
  });

  it('is controlled when columnSizing is provided (internal state does not change)', () => {
    const onSizing = vi.fn();
    const { result } = renderHook(() =>
      useTableLayoutColumns(defs, { columnSizing: { a: 200 }, onColumnSizingChange: onSizing }),
    );
    expect(result.current.controller.resolved.a.width).toBe(200);
    act(() => result.current.controller.setColumnSize('a', 140));
    expect(onSizing).toHaveBeenCalledWith({ a: 140 });
    expect(result.current.controller.resolved.a.width).toBe(200); // controlled → unchanged
  });
});
