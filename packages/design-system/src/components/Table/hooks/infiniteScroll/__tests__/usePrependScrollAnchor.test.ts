import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePrependScrollAnchor } from '../usePrependScrollAnchor';

const el = { scrollTop: 0, scrollHeight: 1000 } as HTMLElement;

describe('usePrependScrollAnchor', () => {
  it('compensates scrollTop by the height delta when rows are prepended', () => {
    el.scrollTop = 0;
    el.scrollHeight = 1000;
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
    el.scrollTop = 0;
    el.scrollHeight = 1000;
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
});
