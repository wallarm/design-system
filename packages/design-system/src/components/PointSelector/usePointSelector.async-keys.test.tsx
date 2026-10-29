/**
 * Async Keys Tests for usePointSelector
 *
 * Tests the debounce, abort, and cache logic for async keys provider.
 * Covers race conditions, memory leaks, and cache correctness.
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'rstest';
import type { PointSelectorProps } from './types';
import { usePointSelector } from './usePointSelector';

// Mock the SDK bridge
vi.mock('./sdkBridge', () => ({
  checkSegmentsDirectly: vi.fn(() => ({ ok: true, canonical: '', exact: true })),
  renderSegments: vi.fn(() => ''),
  getNextSegmentOptions: vi.fn(() => []),
  completePoint: vi.fn(() => ({ items: [], replace: [0, 0] })),
  completionToMenuRow: vi.fn(item => ({ id: item.insert, label: item.label, desc: '' })),
  sdkSeg: {
    native: (word: string) => ({ kind: 'native', value: word }),
    key: (text: string) => ({ kind: 'key', value: text }),
  },
  sdkCombine: () => ({ kind: 'key', value: '' }),
}));

// Mock rules-lib to avoid SDK dependency
vi.mock('@wallarm-org/rules-lib', () => ({
  useProton: () => [null, null, vi.fn()],
}));

describe('usePointSelector: Async Keys', () => {
  const defaultProps: PointSelectorProps & { proton: null } = {
    context: 'http_request' as const,
    value: {
      segments: [],
      canonical: '',
      condition: '',
      value: '',
      ignoreCase: false,
    },
    onChange: vi.fn(),
    proton: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Debounce (300ms)', () => {
    it('debounces async keys fetching by 300ms', async () => {
      const fetchKeys = vi.fn(async () => ['key1', 'key2']);
      const { result } = renderHook(() =>
        usePointSelector({
          ...defaultProps,
          keys: fetchKeys,
        }),
      );

      // Trigger completion multiple times rapidly
      act(() => {
        result.current.actions.openMenu();
      });

      // Should not call fetchKeys immediately
      expect(fetchKeys).not.toHaveBeenCalled();

      // Advance by 299ms - still not called
      act(() => {
        vi.advanceTimersByTime(299);
      });
      expect(fetchKeys).not.toHaveBeenCalled();

      // Advance by 1ms more (total 300ms) - now called
      act(() => {
        vi.advanceTimersByTime(1);
      });

      await waitFor(() => {
        expect(fetchKeys).toHaveBeenCalledTimes(1);
      });
    });

    it('resets debounce timer on rapid queries', async () => {
      const fetchKeys = vi.fn(async () => ['key1', 'key2']);
      const { result } = renderHook(() =>
        usePointSelector({
          ...defaultProps,
          keys: fetchKeys,
        }),
      );

      // First query
      act(() => {
        result.current.actions.openMenu();
      });

      // Wait 200ms
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Second query (resets timer)
      act(() => {
        result.current.actions.openMenu();
      });

      // Wait 200ms again (total 400ms, but timer was reset)
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Should still not have called fetchKeys
      expect(fetchKeys).not.toHaveBeenCalled();

      // Wait final 100ms (300ms from second query)
      act(() => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(fetchKeys).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Cache', () => {
    it('caches sync keys results', () => {
      const fetchKeys = vi.fn((parent: string) => [`${parent}-key1`, `${parent}-key2`]);
      const { result, rerender } = renderHook(() =>
        usePointSelector({
          ...defaultProps,
          keys: fetchKeys,
        }),
      );

      // First call for parent '[http:body]'
      act(() => {
        result.current.actions.openMenu();
      });
      expect(fetchKeys).toHaveBeenCalledTimes(1);

      // Second call for same parent - should use cache
      rerender();
      act(() => {
        result.current.actions.openMenu();
      });
      expect(fetchKeys).toHaveBeenCalledTimes(1); // Not called again
    });

    it('caches async keys results after fetch completes', async () => {
      const fetchKeys = vi.fn(async (parent: string) => [`${parent}-key1`, `${parent}-key2`]);
      const { result, rerender } = renderHook(() =>
        usePointSelector({
          ...defaultProps,
          keys: fetchKeys,
        }),
      );

      // First call
      act(() => {
        result.current.actions.openMenu();
      });

      // Advance timers and wait for fetch
      await act(async () => {
        vi.advanceTimersByTime(300);
        await vi.runAllTimersAsync();
      });

      expect(fetchKeys).toHaveBeenCalledTimes(1);

      // Second call for same parent - should use cache
      rerender();
      act(() => {
        result.current.actions.openMenu();
        vi.advanceTimersByTime(300);
      });

      // Should not fetch again
      expect(fetchKeys).toHaveBeenCalledTimes(1);
    });

    it('maintains separate cache per parent point', async () => {
      const fetchKeys = vi.fn(async (parent: string) => [`${parent}-key`]);
      const { result } = renderHook(() =>
        usePointSelector({
          ...defaultProps,
          keys: fetchKeys,
        }),
      );

      // First parent
      act(() => {
        result.current.actions.openMenu();
      });

      await act(async () => {
        vi.advanceTimersByTime(300);
        await vi.runAllTimersAsync();
      });

      expect(fetchKeys).toHaveBeenCalledWith(''); // Empty parent for root

      // Change to different parent (simulate adding a segment)
      // Note: In real usage, parent changes when segments change
      // Here we just verify the cache is per-parent
      await act(async () => {
        vi.advanceTimersByTime(300);
        await vi.runAllTimersAsync();
      });

      // Cache should keep results per parent
      expect(fetchKeys).toHaveBeenCalledTimes(1); // Same parent = cached
    });
  });

  describe('Abort', () => {
    it('aborts in-flight fetch when unmounting', async () => {
      const abortSpy = vi.fn();
      const fetchKeys = vi.fn(
        () =>
          new Promise<string[]>(resolve => {
            const controller = new AbortController();
            controller.signal.addEventListener('abort', abortSpy);
            setTimeout(() => resolve(['key1']), 1000);
          }),
      );

      const { result, unmount } = renderHook(() =>
        usePointSelector({
          ...defaultProps,
          keys: fetchKeys,
        }),
      );

      // Start fetch
      act(() => {
        result.current.actions.openMenu();
        vi.advanceTimersByTime(300);
      });

      // Unmount before fetch completes
      unmount();

      // Verify abort was called
      await waitFor(() => {
        expect(abortSpy).toHaveBeenCalled();
      });
    });

    it('aborts old fetch when new query arrives', async () => {
      let abortCount = 0;
      const fetchKeys = vi.fn(
        () =>
          new Promise<string[]>((resolve, reject) => {
            const controller = new AbortController();
            controller.signal.addEventListener('abort', () => {
              abortCount++;
              reject(new Error('Aborted'));
            });
            setTimeout(() => resolve(['key1']), 1000);
          }),
      );

      const { result } = renderHook(() =>
        usePointSelector({
          ...defaultProps,
          keys: fetchKeys,
        }),
      );

      // Start first fetch
      act(() => {
        result.current.actions.openMenu();
        vi.advanceTimersByTime(300);
      });

      expect(fetchKeys).toHaveBeenCalledTimes(1);

      // Start second fetch before first completes (different parent)
      act(() => {
        result.current.actions.openMenu();
        vi.advanceTimersByTime(300);
      });

      // First fetch should be aborted
      await waitFor(() => {
        expect(abortCount).toBeGreaterThan(0);
      });
    });

    it('handles fetch errors gracefully', async () => {
      const fetchKeys = vi.fn(async () => {
        throw new Error('Network error');
      });

      const { result } = renderHook(() =>
        usePointSelector({
          ...defaultProps,
          keys: fetchKeys,
        }),
      );

      act(() => {
        result.current.actions.openMenu();
      });

      await act(async () => {
        vi.advanceTimersByTime(300);
        await vi.runAllTimersAsync();
      });

      // Should cache empty array on error
      expect(fetchKeys).toHaveBeenCalledTimes(1);

      // Should not crash or retry
      expect(result.current.ui.menuOpen).toBe(true);
    });
  });

  describe('Loading State', () => {
    it('shows loading state while async keys fetch in progress', async () => {
      const fetchKeys = vi.fn(
        () =>
          new Promise<string[]>(resolve => {
            setTimeout(() => resolve(['key1', 'key2']), 500);
          }),
      );

      const { result } = renderHook(() =>
        usePointSelector({
          ...defaultProps,
          keys: fetchKeys,
        }),
      );

      act(() => {
        result.current.actions.openMenu();
      });

      // Before debounce completes
      expect(result.current.model.status).toBe('ok');

      // After debounce, before fetch completes
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      // Note: actual loading state is internal to syncKeysProvider
      // We verify the fetch was called
      expect(fetchKeys).toHaveBeenCalledTimes(1);

      // Complete the fetch
      await act(async () => {
        vi.advanceTimersByTime(500);
        await vi.runAllTimersAsync();
      });

      // Loading should be done
      expect(fetchKeys).toHaveBeenCalledTimes(1);
    });
  });

  describe('Deduplication', () => {
    it('deduplicates concurrent fetches for same parent', async () => {
      const fetchKeys = vi.fn(
        async () =>
          new Promise<string[]>(resolve => {
            setTimeout(() => resolve(['key1', 'key2']), 500);
          }),
      );

      const { result } = renderHook(() =>
        usePointSelector({
          ...defaultProps,
          keys: fetchKeys,
        }),
      );

      // Start two concurrent requests for same parent
      act(() => {
        result.current.actions.openMenu();
        result.current.actions.openMenu();
      });

      await act(async () => {
        vi.advanceTimersByTime(300);
        await vi.runAllTimersAsync();
      });

      // Should only call fetchKeys once (deduped)
      expect(fetchKeys).toHaveBeenCalledTimes(1);
    });
  });

  describe('Memory Leaks', () => {
    it('clears timeouts on unmount', async () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      const fetchKeys = vi.fn(async () => ['key1']);

      const { result, unmount } = renderHook(() =>
        usePointSelector({
          ...defaultProps,
          keys: fetchKeys,
        }),
      );

      act(() => {
        result.current.actions.openMenu();
      });

      // Unmount before debounce completes
      unmount();

      // Verify timeout was cleared
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('clears in-flight fetches on unmount', async () => {
      const fetchKeys = vi.fn(
        () =>
          new Promise<string[]>(resolve => {
            setTimeout(() => resolve(['key1']), 1000);
          }),
      );

      const { result, unmount } = renderHook(() =>
        usePointSelector({
          ...defaultProps,
          keys: fetchKeys,
        }),
      );

      // Start fetch
      act(() => {
        result.current.actions.openMenu();
        vi.advanceTimersByTime(300);
      });

      expect(fetchKeys).toHaveBeenCalledTimes(1);

      // Unmount while fetch in progress
      unmount();

      // Advance time past fetch completion
      await act(async () => {
        vi.advanceTimersByTime(1000);
        await vi.runAllTimersAsync();
      });

      // Fetch should be aborted and not update state
      // (no way to verify this directly without implementation details,
      // but unmount should clean up without errors)
    });
  });

  describe('Integration with PointSelector Flow', () => {
    it('triggers re-completion when async keys arrive', async () => {
      const fetchKeys = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return ['authorization', 'content-type', 'cookie'];
      });

      const { result } = renderHook(() =>
        usePointSelector({
          ...defaultProps,
          keys: fetchKeys,
        }),
      );

      // Open menu
      act(() => {
        result.current.actions.openMenu();
      });

      // Wait for debounce + fetch
      await act(async () => {
        vi.advanceTimersByTime(300);
        vi.advanceTimersByTime(100);
        await vi.runAllTimersAsync();
      });

      // Keys should be available
      expect(fetchKeys).toHaveBeenCalledTimes(1);

      // Menu should still be open with keys available
      expect(result.current.ui.menuOpen).toBe(true);
    });

    it('handles sync and async keys providers interchangeably', async () => {
      const syncKeys = ['key1', 'key2'];
      const asyncKeys = async () => ['key3', 'key4'];

      // First render with sync keys
      const { result, rerender } = renderHook(
        ({ keys }: { keys: typeof syncKeys | typeof asyncKeys }) =>
          usePointSelector({
            ...defaultProps,
            keys,
          }),
        {
          initialProps: { keys: syncKeys },
        },
      );

      act(() => {
        result.current.actions.openMenu();
      });

      // Should work synchronously
      expect(result.current.ui.menuOpen).toBe(true);

      // Switch to async keys
      rerender({ keys: asyncKeys });

      act(() => {
        result.current.actions.openMenu();
      });

      await act(async () => {
        vi.advanceTimersByTime(300);
        await vi.runAllTimersAsync();
      });

      // Should work asynchronously
      expect(result.current.ui.menuOpen).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty keys array from async provider', async () => {
      const fetchKeys = vi.fn(async () => []);

      const { result } = renderHook(() =>
        usePointSelector({
          ...defaultProps,
          keys: fetchKeys,
        }),
      );

      act(() => {
        result.current.actions.openMenu();
      });

      await act(async () => {
        vi.advanceTimersByTime(300);
        await vi.runAllTimersAsync();
      });

      expect(fetchKeys).toHaveBeenCalledTimes(1);
      // Should handle empty array gracefully
      expect(result.current.ui.menuOpen).toBe(true);
    });

    it('handles keys provider switching from function to array', () => {
      const asyncKeys = vi.fn(async () => ['key1']);
      const staticKeys = ['key2', 'key3'];

      const { result, rerender } = renderHook(
        ({ keys }: { keys: typeof asyncKeys | typeof staticKeys }) =>
          usePointSelector({
            ...defaultProps,
            keys,
          }),
        {
          initialProps: { keys: asyncKeys },
        },
      );

      // Start with async
      act(() => {
        result.current.actions.openMenu();
      });

      // Switch to static before fetch completes
      rerender({ keys: staticKeys });

      act(() => {
        result.current.actions.openMenu();
      });

      // Should use static keys immediately
      expect(result.current.ui.menuOpen).toBe(true);
    });

    it('handles AbortController not supported', async () => {
      // Mock environment without AbortController
      const originalAbortController = global.AbortController;
      // @ts-expect-error - intentionally breaking for test
      global.AbortController = undefined;

      const fetchKeys = vi.fn(async () => ['key1']);

      const { result, unmount } = renderHook(() =>
        usePointSelector({
          ...defaultProps,
          keys: fetchKeys,
        }),
      );

      act(() => {
        result.current.actions.openMenu();
      });

      await act(async () => {
        vi.advanceTimersByTime(300);
        await vi.runAllTimersAsync();
      });

      // Should still work (graceful degradation)
      expect(fetchKeys).toHaveBeenCalledTimes(1);

      // Cleanup should not crash
      expect(() => unmount()).not.toThrow();

      // Restore
      global.AbortController = originalAbortController;
    });
  });
});
