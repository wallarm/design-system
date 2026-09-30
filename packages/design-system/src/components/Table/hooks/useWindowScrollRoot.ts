import { createContext, type RefObject, useLayoutEffect, useRef, useState } from 'react';
import { getScrollRoot, isWindowScrollRoot, type ScrollRoot } from '../lib';

/** The `virtualized='window'` scroll root, shared from the table shell to its body. */
export const WindowScrollRootContext = createContext<ScrollRoot | null>(null);

/**
 * Resolves the scroll root of a `virtualized='window'` table once, for the
 * virtualizer, the edge detection and the prepend compensation alike.
 *
 * Starts on the window. Before the body is laid out with rows (loading, a
 * hidden tab or drawer) a pane that will scroll does not overflow and reads as
 * the window. While the root is the window, it re-resolves whenever the table
 * resizes (rows, spacers, being shown) or an ancestor scrolls vertically. An
 * element root is final.
 *
 * `scrollRoot` is for the virtualizer, from the first render. Edge detection,
 * prepend compensation and the initial anchor wait for `isSettled`: an element
 * root, or the window once the table is laid out with rows and still nothing
 * above it overflows. Earlier, a pane host still reads as the window, whose
 * edges both look reached — firing them would load a page at each end in one
 * commit (which the prepend compensation cannot tell from a data swap) and
 * spend the anchor on the window.
 */
export const useWindowScrollRoot = (
  containerRef: RefObject<HTMLElement | null>,
  hasRows: boolean,
) => {
  // The window from the first render, as before scroll roots existed: the
  // first virtualizer pass must not wait a commit for the resolution below.
  const [scrollRoot, setScrollRoot] = useState<ScrollRoot | null>(() =>
    typeof window === 'undefined' ? null : window,
  );
  const scrollRootRef = useRef<ScrollRoot | null>(scrollRoot);
  const [isSettled, setIsSettled] = useState(false);
  const hasRowsRef = useRef(hasRows);
  hasRowsRef.current = hasRows;
  const trySettleRef = useRef<(() => void) | null>(null);

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
        trySettle();
      }
    };
    // Fires on every size change — rows or spacers rendering, a hidden
    // container being shown — and once initially, even at 0×0.
    const resizeObserver = new ResizeObserver(() => trySettle());

    const detach = () => {
      document.removeEventListener('scroll', onScroll, { capture: true });
      resizeObserver.disconnect();
    };

    function resolve() {
      // An element root is final — a later pass may catch the pane between
      // layouts (rows not rendered yet) and must not demote it to the window.
      if (scrollRootRef.current && !isWindowScrollRoot(scrollRootRef.current)) return;
      const next = getScrollRoot(container);
      if (next === scrollRootRef.current) return;
      scrollRootRef.current = next;
      setScrollRoot(next);
      if (!isWindowScrollRoot(next)) {
        detach();
        setIsSettled(true);
      }
    }

    function trySettle() {
      resolve();
      if (hasRowsRef.current && container.clientHeight > 0) setIsSettled(true);
    }
    trySettleRef.current = trySettle;

    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    resizeObserver.observe(container);
    trySettle();

    return detach;
  }, [containerRef]);

  // Rows can land without the container changing size (skeletons of the same
  // height), so their arrival is a settle point of its own.
  useLayoutEffect(() => {
    if (hasRows) trySettleRef.current?.();
  }, [hasRows]);

  return { scrollRoot, isSettled };
};
