import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollEdge } from '../useScrollEdge';

interface FakeEl {
  scrollTop: number;
  clientHeight: number;
  scrollHeight: number;
  addEventListener: (t: string, cb: (e: Event) => void) => void;
  removeEventListener: () => void;
  fire: () => void;
}

const makeEl = (init: Partial<FakeEl> = {}): FakeEl => {
  let handler: ((e: Event) => void) | null = null;
  return {
    scrollTop: 0,
    clientHeight: 100,
    scrollHeight: 1000,
    ...init,
    addEventListener: (_t, cb) => {
      handler = cb;
    },
    removeEventListener: () => {
      handler = null;
    },
    fire: () => handler?.(new Event('scroll')),
  };
};

describe('useScrollEdge', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(10_000);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fires onReached for the end edge when near the bottom', () => {
    const el = makeEl({ scrollTop: 850 });
    const onReached = vi.fn();
    renderHook(() =>
      useScrollEdge({
        edge: 'end',
        mode: 'container',
        scrollRef: { current: el as unknown as HTMLElement },
        onReached,
        threshold: 200,
      }),
    );
    expect(onReached).toHaveBeenCalledTimes(1);
  });

  it('fires onReached for the start edge when near the top', () => {
    const el = makeEl({ scrollTop: 50 });
    const onReached = vi.fn();
    renderHook(() =>
      useScrollEdge({
        edge: 'start',
        mode: 'container',
        scrollRef: { current: el as unknown as HTMLElement },
        onReached,
        threshold: 200,
      }),
    );
    expect(onReached).toHaveBeenCalledTimes(1);
  });

  it('re-arms only after scrolling past the threshold', () => {
    const el = makeEl({ scrollTop: 0 });
    const onReached = vi.fn();
    renderHook(() =>
      useScrollEdge({
        edge: 'start',
        mode: 'container',
        scrollRef: { current: el as unknown as HTMLElement },
        onReached,
        threshold: 200,
      }),
    );
    expect(onReached).toHaveBeenCalledTimes(1);

    el.scrollTop = 50;
    el.fire();
    expect(onReached).toHaveBeenCalledTimes(1);

    el.scrollTop = 500;
    el.fire();
    el.scrollTop = 0;
    vi.spyOn(Date, 'now').mockReturnValue(10_500);
    el.fire();
    expect(onReached).toHaveBeenCalledTimes(2);
  });

  it('does not fire while disabled', () => {
    const el = makeEl({ scrollTop: 0 });
    const onReached = vi.fn();
    renderHook(() =>
      useScrollEdge({
        edge: 'start',
        mode: 'container',
        scrollRef: { current: el as unknown as HTMLElement },
        onReached,
        threshold: 200,
        enabled: false,
      }),
    );
    el.fire();
    expect(onReached).not.toHaveBeenCalled();
  });

  it('respects the cooldown between fires', () => {
    const el = makeEl({ scrollTop: 0 });
    const onReached = vi.fn();
    renderHook(() =>
      useScrollEdge({
        edge: 'start',
        mode: 'container',
        scrollRef: { current: el as unknown as HTMLElement },
        onReached,
        threshold: 200,
      }),
    );
    expect(onReached).toHaveBeenCalledTimes(1);

    el.scrollTop = 500;
    el.fire();
    el.scrollTop = 0;
    el.fire();
    expect(onReached).toHaveBeenCalledTimes(1);
  });
});
