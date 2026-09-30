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
 * window, a scroll of any ancestor of the table re-resolves it: a pane the user
 * scrolls overflows by then. An element root is final.
 */
export const useWindowScrollRoot = (containerRef: RefObject<HTMLElement | null>) => {
  // The window from the first render, as before scroll roots existed: the
  // initial anchor scroll and the first virtualizer pass must not wait a
  // commit for the resolution below.
  const [scrollRoot, setScrollRoot] = useState<ScrollRoot | null>(() =>
    typeof window === 'undefined' ? null : window,
  );
  const scrollRootRef = useRef<ScrollRoot | null>(scrollRoot);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resolve = () => {
      const next = getScrollRoot(container);
      if (next === scrollRootRef.current) return;
      scrollRootRef.current = next;
      setScrollRoot(next);
    };
    resolve();

    // Scroll events do not bubble, so ancestors are only heard in the capture
    // phase. The table's own horizontal scroller is the container — skipped.
    const onScroll = (event: Event) => {
      const { target } = event;
      if (scrollRootRef.current && !isWindowScrollRoot(scrollRootRef.current)) return;
      if (!(target instanceof Element) || target === container || !target.contains(container)) {
        return;
      }
      resolve();
    };

    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => document.removeEventListener('scroll', onScroll, { capture: true });
  }, [containerRef]);

  return scrollRoot;
};
