import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(cb: () => void) {
          resizeCallbacks.push(cb);
        }
        observe = vi.fn();
        disconnect = vi.fn();
      },
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('starts on the window while the pane does not overflow, then adopts it once the table grows', () => {
    const { pane, container } = mountInPane();
    setHeights(pane, 600, 600);
    const { result } = renderHook(() => useWindowScrollRoot({ current: container }));
    expect(result.current.scrollRoot).toBe(window);

    // Rows rendered: the table grew, nobody scrolled yet.
    setHeights(pane, 600, 3000);
    act(() => resizeCallbacks.forEach(cb => cb()));
    expect(result.current.scrollRoot).toBe(pane);
  });

  it('settles on the first resize notification, not at mount', () => {
    const { container } = mountInPane();
    const { result } = renderHook(() => useWindowScrollRoot({ current: container }));
    expect(result.current.isSettled).toBe(false);

    act(() => resizeCallbacks.forEach(cb => cb()));
    expect(result.current.isSettled).toBe(true);
  });

  it('adopts the pane when it scrolls vertically', () => {
    const { pane, container } = mountInPane();
    setHeights(pane, 600, 600);
    const { result } = renderHook(() => useWindowScrollRoot({ current: container }));

    setHeights(pane, 600, 3000);
    scrollBy(pane, 200);
    expect(result.current.scrollRoot).toBe(pane);
  });

  it("ignores the table's own horizontal scroller", () => {
    const { pane, container } = mountInPane();
    setHeights(pane, 600, 600);
    const { result } = renderHook(() => useWindowScrollRoot({ current: container }));

    setHeights(pane, 600, 3000);
    scrollBy(container, 200);
    expect(result.current.scrollRoot).toBe(window);
  });

  it('keeps the window for an ancestor that grows with its content', () => {
    // An `overflow-x` wrapper: `overflow-y` computes to `auto`, yet the box
    // never scrolls vertically — the document around it does.
    const { pane, container } = mountInPane();
    setHeights(pane, 3000, 3000);
    const { result } = renderHook(() => useWindowScrollRoot({ current: container }));
    act(() => resizeCallbacks.forEach(cb => cb()));
    expect(result.current.scrollRoot).toBe(window);
  });
});
