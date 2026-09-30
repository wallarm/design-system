import { createContext, type RefObject, useLayoutEffect, useRef, useState } from 'react';
import { getScrollRoot, isWindowScrollRoot, type ScrollRoot } from '../lib';

/** The `virtualized='window'` scroll root, shared from the table shell to its body. */
export const WindowScrollRootContext = createContext<ScrollRoot | null>(null);

/**
 * Resolves the scroll root of a `virtualized='window'` table once, for the
 * virtualizer, the edge detection and the prepend compensation alike.
 *
 * Starts on the window. At mount the body has no rows yet, so a pane that will
 * scroll does not overflow and stays on the window. While the root is the
 * window, it re-resolves whenever the table grows (rows, spacers) or an
 * ancestor scrolls vertically — a pane overflows by then, before the user has
 * to touch it. An element root is final.
 *
 * `scrollRoot` is for the virtualizer, from the first render; edge detection
 * and prepend compensation wait for `isSettled`.
 */
export const useWindowScrollRoot = (containerRef: RefObject<HTMLElement | null>) => {
  // The window from the first render, as before scroll roots existed: the
  // initial anchor scroll and the first virtualizer pass must not wait a
  // commit for the resolution below.
  const [scrollRoot, setScrollRoot] = useState<ScrollRoot | null>(() =>
    typeof window === 'undefined' ? null : window,
  );
  const scrollRootRef = useRef<ScrollRoot | null>(scrollRoot);
  // False until the table has laid out its rows once (the first resize
  // notification). Before that a pane host still reads as the window, whose
  // edges both look reached — firing them would load a page at each end in
  // one commit, which the prepend compensation cannot tell from a data swap.
  const [isSettled, setIsSettled] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || (scrollRootRef.current && !isWindowScrollRoot(scrollRootRef.current))) {
      return;
    }

    // Scroll events do not bubble, so ancestors are only heard in the capture
    // phase. The table's own horizontal scroller is the container, and a
    // sideways scroll of an ancestor leaves its `scrollTop` at 0 — both skipped.
    const onScroll = (event: Event) => {
      const { target } = event;
      if (
        target instanceof Element &&
        target !== container &&
        target.scrollTop > 0 &&
        target.contains(container)
      ) {
        resolve();
      }
    };
    const resizeObserver = new ResizeObserver(() => {
      resolve();
      setIsSettled(true);
    });

    const detach = () => {
      document.removeEventListener('scroll', onScroll, { capture: true });
      resizeObserver.disconnect();
    };

    function resolve() {
      const next = getScrollRoot(container);
      if (next === scrollRootRef.current) return;
      scrollRootRef.current = next;
      setScrollRoot(next);
      if (!isWindowScrollRoot(next)) {
        detach();
        setIsSettled(true);
      }
    }

    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    resizeObserver.observe(container);
    resolve();

    return detach;
  }, [containerRef]);

  return { scrollRoot, isSettled };
};
