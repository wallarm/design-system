import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePrependScrollAnchor } from '../usePrependScrollAnchor';

const makeEl = (scrollHeight: number) => ({ scrollTop: 0, scrollHeight }) as HTMLElement;

describe('usePrependScrollAnchor', () => {
  it('compensates scrollTop by the height delta when rows are prepended', () => {
    const el = makeEl(1000);
    const scrollRef = { current: el };

    const { rerender } = renderHook(
      ({ rows }: { rows: { id: string }[] }) =>
        usePrependScrollAnchor({ mode: 'container', scrollRef, rows }),
      { initialProps: { rows: [{ id: 'b' }, { id: 'c' }] } },
    );

    el.scrollHeight = 1100;
    rerender({ rows: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] });

    expect(el.scrollTop).toBe(100);
  });

  it('does not touch scrollTop on a full replacement', () => {
    const el = makeEl(1000);
    const scrollRef = { current: el };

    const { rerender } = renderHook(
      ({ rows }: { rows: { id: string }[] }) =>
        usePrependScrollAnchor({ mode: 'container', scrollRef, rows }),
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
      usePrependScrollAnchor({ mode: 'container', scrollRef, rows: [{ id: 'a' }, { id: 'b' }] }),
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
        ({ rows }: { rows: { id: string }[] }) => usePrependScrollAnchor({ mode: 'window', rows }),
        { initialProps: { rows: [{ id: 'b' }, { id: 'c' }] } },
      );

      docScrollHeight = 1100;
      rerender({ rows: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] });

      expect(scrollBySpy).toHaveBeenCalledWith(0, 100);
    } finally {
      if (original) Object.defineProperty(document.documentElement, 'scrollHeight', original);
      scrollBySpy.mockRestore();
    }
  });
});
