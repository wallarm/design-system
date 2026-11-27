import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import { act, fireEvent, renderHook } from '@testing-library/react';
import { type UseScrollSpyOptions, useScrollSpy } from '../useScrollSpy';

// jsdom has no layout: each section's top is stubbed through getBoundingClientRect,
// and requestAnimationFrame runs its callback synchronously so a scroll event measures at once.

const rect = (top: number) => ({ top }) as DOMRect;

const mountSections = (tops: Record<string, number>) => {
  for (const [id, top] of Object.entries(tops)) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('section');
      el.id = id;
      document.body.appendChild(el);
    }
    el.getBoundingClientRect = () => rect(top);
  }
};

const setWindowScroll = (scrollY: number, innerHeight: number, scrollHeight: number) => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: scrollY });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: innerHeight });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  });
};

const scrollWindow = () =>
  act(() => {
    fireEvent.scroll(window);
  });

const render = (options: UseScrollSpyOptions) =>
  renderHook((props: UseScrollSpyOptions) => useScrollSpy(props), { initialProps: options });

beforeEach(() => {
  rs.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
    cb(0);
    return 1;
  });
  window.scrollTo = rs.fn() as unknown as typeof window.scrollTo;
  setWindowScroll(0, 500, 5000);
});

afterEach(() => {
  rs.useRealTimers();
  rs.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('useScrollSpy', () => {
  it('returns the first id before any section passes the line', () => {
    mountSections({ a: 100, b: 400, c: 800 });
    const { result } = render({ ids: ['a', 'b', 'c'] });
    expect(result.current.activeId).toBe('a');
  });

  it('returns the last section whose top is at or above offset', () => {
    mountSections({ a: 0, b: 0, c: 0 });
    const { result } = render({ ids: ['a', 'b', 'c'], offset: 80 });
    mountSections({ a: -200, b: 40, c: 300 });
    scrollWindow();
    expect(result.current.activeId).toBe('b');
  });

  it('returns the last id when scrolled to the bottom', () => {
    mountSections({ a: -900, b: -300, c: 400 });
    const { result } = render({ ids: ['a', 'b', 'c'] });
    setWindowScroll(4500, 500, 5000);
    scrollWindow();
    expect(result.current.activeId).toBe('c');
  });

  it('skips ids with no element', () => {
    mountSections({ b: 200, c: 600 });
    const { result } = render({ ids: ['a', 'b', 'c'] });
    expect(result.current.activeId).toBe('b');
    mountSections({ b: -10, c: 600 });
    scrollWindow();
    expect(result.current.activeId).toBe('b');
  });

  it('scrollTo sets activeId immediately and ignores scroll until settled', () => {
    mountSections({ a: -500, b: 0, c: 900 });
    const { result } = render({ ids: ['a', 'b', 'c'] });
    expect(result.current.activeId).toBe('b');

    act(() => result.current.scrollTo('c'));
    expect(result.current.activeId).toBe('c');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 900, behavior: 'smooth' });

    // Mid-flight: geometry still points at 'b'.
    scrollWindow();
    expect(result.current.activeId).toBe('c');

    act(() => {
      fireEvent(window, new Event('scrollend'));
    });
    expect(result.current.activeId).toBe('b');
  });

  it('unlocks after scroll stays quiet for 100ms', () => {
    rs.useFakeTimers();
    mountSections({ a: -500, b: 0, c: 900 });
    const { result } = render({ ids: ['a', 'b', 'c'] });
    act(() => result.current.scrollTo('c'));
    scrollWindow();
    act(() => {
      rs.advanceTimersByTime(50);
    });
    scrollWindow();
    expect(result.current.activeId).toBe('c');
    act(() => {
      rs.advanceTimersByTime(100);
    });
    expect(result.current.activeId).toBe('b');
  });

  it('user wheel cancels the scrollTo lock', () => {
    mountSections({ a: -500, b: 0, c: 900 });
    const { result } = render({ ids: ['a', 'b', 'c'] });
    act(() => result.current.scrollTo('c'));
    act(() => {
      fireEvent.wheel(window);
    });
    scrollWindow();
    expect(result.current.activeId).toBe('b');
  });

  it('only scrolling keys cancel the scrollTo lock', () => {
    mountSections({ a: -500, b: 0, c: 900 });
    const { result } = render({ ids: ['a', 'b', 'c'] });
    act(() => result.current.scrollTo('c'));
    for (const key of ['a', 'Tab', 'Shift', 'Enter']) {
      act(() => {
        fireEvent.keyDown(window, { key });
      });
      scrollWindow();
      expect(result.current.activeId).toBe('c');
    }
    act(() => {
      fireEvent.keyDown(window, { key: 'PageDown' });
    });
    scrollWindow();
    expect(result.current.activeId).toBe('b');
  });

  it('scroll keys typed into an editable field keep the lock', () => {
    mountSections({ a: -500, b: 0, c: 900 });
    const input = document.createElement('input');
    document.body.appendChild(input);
    const { result } = render({ ids: ['a', 'b', 'c'] });
    act(() => result.current.scrollTo('c'));
    act(() => {
      fireEvent.keyDown(input, { key: ' ' });
    });
    scrollWindow();
    expect(result.current.activeId).toBe('c');
    input.remove();
  });

  it.each(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '])(
    '%j cancels the scrollTo lock',
    key => {
      mountSections({ a: -500, b: 0, c: 900 });
      const { result } = render({ ids: ['a', 'b', 'c'] });
      act(() => result.current.scrollTo('c'));
      act(() => {
        fireEvent.keyDown(window, { key });
      });
      scrollWindow();
      expect(result.current.activeId).toBe('b');
    },
  );

  it('keeps the scrollTo lock across an effect re-run', () => {
    rs.useFakeTimers();
    mountSections({ a: -500, b: 0, c: 900 });
    const { result, rerender } = render({ ids: ['a', 'b', 'c'] });
    act(() => result.current.scrollTo('c'));
    // New ids re-run the effect mid-flight.
    mountSections({ a: -500, b: 0, c: 900, d: 1400 });
    rerender({ ids: ['a', 'b', 'c', 'd'] });
    scrollWindow();
    expect(result.current.activeId).toBe('c');
    act(() => {
      rs.advanceTimersByTime(100);
    });
    expect(result.current.activeId).toBe('b');
  });

  it('settles a lock re-armed before the effect re-ran', () => {
    rs.useFakeTimers();
    mountSections({ a: -500, b: 0, c: 900 });
    const { result, rerender } = render({ ids: ['a', 'b', 'c'], offset: 0 });
    act(() => result.current.scrollTo('c'));
    rerender({ ids: ['a', 'b', 'c'], offset: 10 });
    // No scroll event after the re-run: the lock still settles on its own.
    act(() => {
      rs.advanceTimersByTime(100);
    });
    expect(result.current.activeId).toBe('b');
  });

  it('measures against a custom root element', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    root.getBoundingClientRect = () => rect(100);
    Object.defineProperty(root, 'scrollTop', { configurable: true, value: 50, writable: true });
    root.scrollTo = rs.fn() as unknown as typeof root.scrollTo;
    const addSpy = rs.spyOn(root, 'addEventListener');

    // Absolute viewport tops; relative to the root top (100): a=-100, b=20, c=400.
    mountSections({ a: 0, b: 120, c: 500 });
    const { result } = render({ ids: ['a', 'b', 'c'], root, offset: 40 });
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
    expect(result.current.activeId).toBe('b');

    mountSections({ a: -400, b: -100, c: 130 });
    act(() => {
      fireEvent.scroll(root);
    });
    expect(result.current.activeId).toBe('c');

    act(() => result.current.scrollTo('a'));
    // top = elTop (-400) - containerTop (100) + scrollTop (50) - offset (40)
    expect(root.scrollTo).toHaveBeenCalledWith({ top: -490, behavior: 'smooth' });
  });

  it('stays idle while root is null', () => {
    const addSpy = rs.spyOn(window, 'addEventListener');
    mountSections({ a: -500, b: -100, c: 900 });
    const { result, rerender } = render({ ids: ['a', 'b', 'c'], root: null });
    expect(addSpy.mock.calls.some(([type]) => type === 'scroll')).toBe(false);
    expect(result.current.activeId).toBe('a');

    const root = document.createElement('div');
    document.body.appendChild(root);
    root.getBoundingClientRect = () => rect(0);
    const rootSpy = rs.spyOn(root, 'addEventListener');
    rerender({ ids: ['a', 'b', 'c'], root });
    expect(rootSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
    expect(result.current.activeId).toBe('b');
  });

  it('drops removed ids', () => {
    mountSections({ a: -500, b: -100, c: -50 });
    const { result, rerender } = render({ ids: ['a', 'b', 'c'] });
    expect(result.current.activeId).toBe('c');
    document.getElementById('c')?.remove();
    rerender({ ids: ['a', 'b'] });
    expect(result.current.activeId).toBe('b');
  });

  it('removes listeners on unmount', () => {
    const removeSpy = rs.spyOn(window, 'removeEventListener');
    mountSections({ a: 0 });
    const { unmount } = render({ ids: ['a'] });
    unmount();
    const removed = removeSpy.mock.calls.map(([type]) => type);
    expect(removed).toEqual(expect.arrayContaining(['scroll', 'resize', 'scrollend', 'wheel']));
  });
});
