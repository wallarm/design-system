import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import { act, renderHook } from '@testing-library/react';
import { useWindowScrollRoot } from '../useWindowScrollRoot';

const setHeights = (el: HTMLElement, client: number, scroll: number) =>
  Object.defineProperties(el, {
    clientHeight: { value: client, configurable: true },
    scrollHeight: { value: scroll, configurable: true },
  });

const mountInPane = () => {
  const pane = document.createElement('div');
  pane.style.overflowY = 'auto';
  const container = document.createElement('div');
  // A laid-out table body; 0 stands for a hidden or empty one.
  setHeights(container, 400, 400);
  pane.appendChild(container);
  document.body.appendChild(pane);
  return { pane, container };
};

const scrollBy = (el: HTMLElement, top: number) =>
  act(() => {
    el.scrollTop = top;
    el.dispatchEvent(new Event('scroll'));
  });

let resizeCallbacks: (() => void)[] = [];

describe('useWindowScrollRoot', () => {
  beforeEach(() => {
    resizeCallbacks = [];
    rs.stubGlobal(
      'ResizeObserver',
      class {
        constructor(cb: () => void) {
          resizeCallbacks.push(cb);
        }
        observe = rs.fn();
        disconnect = rs.fn();
      },
    );
  });
  afterEach(() => {
    rs.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('starts on the window while the pane does not overflow, then adopts it once the table grows', () => {
    const { pane, container } = mountInPane();
    setHeights(pane, 600, 600);
    const { result } = renderHook(() => useWindowScrollRoot({ current: container }, true));
    expect(result.current.scrollRoot).toBe(window);

    // Rows rendered: the table grew, nobody scrolled yet.
    setHeights(pane, 600, 3000);
    act(() => resizeCallbacks.forEach(cb => cb()));
    expect(result.current.scrollRoot).toBe(pane);
  });

  it('settles on the window once laid out with rows', () => {
    const { container } = mountInPane();
    const { result } = renderHook(() => useWindowScrollRoot({ current: container }, true));
    expect(result.current).toEqual({ scrollRoot: window, isSettled: true });
  });

  it('does not settle on the window before rows arrive, then settles when they do', () => {
    const { container } = mountInPane();
    const { result, rerender } = renderHook(
      ({ hasRows }: { hasRows: boolean }) => useWindowScrollRoot({ current: container }, hasRows),
      { initialProps: { hasRows: false } },
    );
    act(() => resizeCallbacks.forEach(cb => cb()));
    expect(result.current.isSettled).toBe(false);

    rerender({ hasRows: true });
    expect(result.current.isSettled).toBe(true);
  });

  it('does not settle while hidden, and settles on the pane once shown', () => {
    const { pane, container } = mountInPane();
    setHeights(container, 0, 0);
    setHeights(pane, 0, 0);
    const { result } = renderHook(() => useWindowScrollRoot({ current: container }, true));
    act(() => resizeCallbacks.forEach(cb => cb()));
    expect(result.current.isSettled).toBe(false);

    // Shown: the table lays out and overflows the pane.
    setHeights(container, 3000, 3000);
    setHeights(pane, 600, 3000);
    act(() => resizeCallbacks.forEach(cb => cb()));
    expect(result.current).toEqual({ scrollRoot: pane, isSettled: true });
  });

  it('keeps an element root when the pane briefly stops overflowing', () => {
    // Skeletons overflow the pane at mount; when the rows land, the body is
    // empty for a moment before the virtualizer renders them.
    const { pane, container } = mountInPane();
    setHeights(pane, 480, 500);
    const { result, rerender } = renderHook(
      ({ hasRows }: { hasRows: boolean }) => useWindowScrollRoot({ current: container }, hasRows),
      { initialProps: { hasRows: false } },
    );
    expect(result.current).toEqual({ scrollRoot: pane, isSettled: true });

    setHeights(pane, 480, 480);
    rerender({ hasRows: true });
    act(() => resizeCallbacks.forEach(cb => cb()));
    expect(result.current).toEqual({ scrollRoot: pane, isSettled: true });
  });

  it('adopts the pane when it scrolls vertically', () => {
    const { pane, container } = mountInPane();
    setHeights(pane, 600, 600);
    const { result } = renderHook(() => useWindowScrollRoot({ current: container }, true));

    setHeights(pane, 600, 3000);
    scrollBy(pane, 200);
    expect(result.current.scrollRoot).toBe(pane);
  });

  it("ignores the table's own horizontal scroller", () => {
    const { pane, container } = mountInPane();
    setHeights(pane, 600, 600);
    const { result } = renderHook(() => useWindowScrollRoot({ current: container }, true));

    setHeights(pane, 600, 3000);
    scrollBy(container, 200);
    expect(result.current.scrollRoot).toBe(window);
  });

  it('keeps the window for an ancestor that grows with its content', () => {
    // An `overflow-x` wrapper: `overflow-y` computes to `auto`, yet the box
    // never scrolls vertically — the document around it does.
    const { pane, container } = mountInPane();
    setHeights(pane, 3000, 3000);
    const { result } = renderHook(() => useWindowScrollRoot({ current: container }, true));
    act(() => resizeCallbacks.forEach(cb => cb()));
    expect(result.current.scrollRoot).toBe(window);
  });
});
