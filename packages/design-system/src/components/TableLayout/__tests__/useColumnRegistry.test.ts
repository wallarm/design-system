import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useColumnRegistry } from '../useColumnRegistry';

describe('useColumnRegistry', () => {
  it('registers a column and returns its presentation by id', () => {
    const { result } = renderHook(() => useColumnRegistry());
    act(() => result.current.registerColumn('status', { align: 'right', width: 120 }));
    expect(result.current.getColumn('status')).toEqual({ align: 'right', width: 120 });
  });

  it('removes a column on unregister', () => {
    const { result } = renderHook(() => useColumnRegistry());
    act(() => result.current.registerColumn('status', { align: 'right' }));
    act(() => result.current.unregisterColumn('status'));
    expect(result.current.getColumn('status')).toBeUndefined();
  });
});
