import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useInitialAnchor } from '../useInitialAnchor';

const rows = (...ids: string[]) => ids.map(id => ({ id }));

describe('useInitialAnchor', () => {
  it('is ready immediately when no anchor is requested', () => {
    const virtualizerRef = { current: null };
    const { result } = renderHook(() => useInitialAnchor({ rows: rows('a', 'b'), virtualizerRef }));
    expect(result.current).toBe(true);
  });

  it('scrolls to the anchor index and becomes ready after the frame', async () => {
    const scrollToIndex = vi.fn();
    const virtualizerRef = { current: { scrollToIndex } as never };
    const { result } = renderHook(() =>
      useInitialAnchor({ initialScrollToRowId: 'b', rows: rows('a', 'b', 'c'), virtualizerRef }),
    );

    expect(scrollToIndex).toHaveBeenCalledWith(1, { align: 'center' });
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('arms immediately when there is no virtualizer (non-virtualized)', () => {
    const virtualizerRef = { current: null };
    const { result } = renderHook(() =>
      useInitialAnchor({ initialScrollToRowId: 'b', rows: rows('a', 'b'), virtualizerRef }),
    );
    expect(result.current).toBe(true);
  });
});
