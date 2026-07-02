import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePrependScrollAnchor } from '../usePrependScrollAnchor';

const makeEl = (scrollHeight: number) => ({ scrollTop: 0, scrollHeight }) as HTMLElement;

describe('usePrependScrollAnchor', () => {
  it('compensates scrollTop by the height delta when rows are prepended during a previous-page fetch', () => {
    const el = makeEl(1000);
    const scrollRef = { current: el };

    const { rerender } = renderHook(
      ({ rows, isLoadingPrevious }: { rows: { id: string }[]; isLoadingPrevious: boolean }) =>
        usePrependScrollAnchor({ mode: 'container', scrollRef, rows, isLoadingPrevious }),
      { initialProps: { rows: [{ id: 'b' }, { id: 'c' }], isLoadingPrevious: false } },
    );

    // the fetch starts (loading commit)…
    rerender({ rows: [{ id: 'b' }, { id: 'c' }], isLoadingPrevious: true });

    // …and the page lands in the commit that also clears the flag
    el.scrollHeight = 1100;
    rerender({ rows: [{ id: 'a' }, { id: 'b' }, { id: 'c' }], isLoadingPrevious: false });

    expect(el.scrollTop).toBe(100);
  });

  it('does not compensate a prepend-shaped swap outside a previous-page fetch (filter reset)', () => {
    const el = makeEl(1000);
    const scrollRef = { current: el };

    const { rerender } = renderHook(
      ({ rows }: { rows: { id: string }[] }) =>
        usePrependScrollAnchor({ mode: 'container', scrollRef, rows, isLoadingPrevious: false }),
      { initialProps: { rows: [{ id: 'b' }, { id: 'c' }] } },
    );

    // Removing a filter restores a superset where the old window is a suffix —
    // id-wise identical to a prepend, but the viewport must stay put (AS-1208).
    el.scrollHeight = 1100;
    rerender({ rows: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] });

    expect(el.scrollTop).toBe(0);
  });

  it('does not touch scrollTop on a full replacement', () => {
    const el = makeEl(1000);
    const scrollRef = { current: el };

    const { rerender } = renderHook(
      ({ rows }: { rows: { id: string }[] }) =>
        usePrependScrollAnchor({ mode: 'container', scrollRef, rows, isLoadingPrevious: true }),
      { initialProps: { rows: [{ id: 'b' }, { id: 'c' }] } },
    );

    el.scrollHeight = 1100;
    rerender({ rows: [{ id: 'x' }, { id: 'y' }] });

    expect(el.scrollTop).toBe(0);
  });

  it('does not compensate on the initial (seeding) render', () => {
    const el = makeEl(1000);
    const scrollRef = { current: el };

    renderHook(() =>
      usePrependScrollAnchor({
        mode: 'container',
        scrollRef,
        rows: [{ id: 'a' }, { id: 'b' }],
        isLoadingPrevious: true,
      }),
    );

    // First run only seeds the baseline — no scroll adjustment.
    expect(el.scrollTop).toBe(0);
  });

  it('compensates the window scroll position on prepend in window mode', () => {
    const scrollBySpy = vi.spyOn(window, 'scrollBy').mockImplementation(() => undefined);
    let docScrollHeight = 1000;
    const original = Object.getOwnPropertyDescriptor(document.documentElement, 'scrollHeight');
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      get: () => docScrollHeight,
    });

    try {
      const { rerender } = renderHook(
        ({ rows, isLoadingPrevious }: { rows: { id: string }[]; isLoadingPrevious: boolean }) =>
          usePrependScrollAnchor({ mode: 'window', rows, isLoadingPrevious }),
        { initialProps: { rows: [{ id: 'b' }, { id: 'c' }], isLoadingPrevious: true } },
      );

      docScrollHeight = 1100;
      rerender({ rows: [{ id: 'a' }, { id: 'b' }, { id: 'c' }], isLoadingPrevious: false });

      expect(scrollBySpy).toHaveBeenCalledWith(0, 100);
    } finally {
      if (original) Object.defineProperty(document.documentElement, 'scrollHeight', original);
      scrollBySpy.mockRestore();
    }
  });
});
