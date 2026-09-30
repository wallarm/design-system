import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
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

describe('useWindowScrollRoot', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('starts on the window while the pane does not overflow, then adopts it once it scrolls', () => {
    const { pane, container } = mountInPane();
    setHeights(pane, 600, 600);
    const { result } = renderHook(() => useWindowScrollRoot({ current: container }));
    expect(result.current).toBe(window);

    // Rows arrived and the user scrolls the pane.
    setHeights(pane, 600, 3000);
    act(() => {
      pane.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(pane);
  });

  it("ignores the table's own horizontal scroller", () => {
    const { pane, container } = mountInPane();
    setHeights(pane, 600, 600);
    const { result } = renderHook(() => useWindowScrollRoot({ current: container }));

    setHeights(pane, 600, 3000);
    act(() => {
      container.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(window);
  });

  it('keeps the window when a scrolling ancestor never scrolls vertically', () => {
    // An `overflow-x` wrapper scrolled sideways: `overflow-y` computes to
    // `auto`, yet the box grows with its content.
    const { pane, container } = mountInPane();
    setHeights(pane, 3000, 3000);
    const { result } = renderHook(() => useWindowScrollRoot({ current: container }));
    act(() => {
      pane.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(window);
  });
});
