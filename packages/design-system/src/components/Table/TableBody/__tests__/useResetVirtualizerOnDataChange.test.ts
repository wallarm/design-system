import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useResetVirtualizerOnDataChange } from '../useResetVirtualizerOnDataChange';

const makeTable = (ids: string[]) =>
  ({ getRowModel: () => ({ rows: ids.map(id => ({ id })) }) }) as never;

const setup = (initialIds: string[]) => {
  const measure = vi.fn();
  const virtualizer = { measure } as never;
  const { rerender } = renderHook(
    ({ ids }: { ids: string[] }) => useResetVirtualizerOnDataChange(makeTable(ids), virtualizer),
    { initialProps: { ids: initialIds } },
  );
  return { measure, rerender };
};

describe('useResetVirtualizerOnDataChange', () => {
  it('does not measure when data is unchanged', () => {
    const { measure, rerender } = setup(['a', 'b', 'c']);
    rerender({ ids: ['a', 'b', 'c'] });
    expect(measure).not.toHaveBeenCalled();
  });

  it('does not measure on a prepend (older rows added on top)', () => {
    const { measure, rerender } = setup(['b', 'c']);
    rerender({ ids: ['a', 'b', 'c'] });
    expect(measure).not.toHaveBeenCalled();
  });

  it('measures on a full replacement', () => {
    const { measure, rerender } = setup(['a', 'b']);
    rerender({ ids: ['x', 'y'] });
    expect(measure).toHaveBeenCalledTimes(1);
  });
});
