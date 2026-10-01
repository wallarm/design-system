import { getDocumentOffsetTop } from '../TableBody/lib/getDocumentOffsetTop';

export type ScrollRoot = HTMLElement | Window;

const SCROLLABLE_OVERFLOW = /(auto|scroll|overlay)/;

export const isWindowScrollRoot = (root: ScrollRoot): root is Window => root === window;

/**
 * What a `virtualized='window'` table actually scrolls with: the nearest
 * ancestor that scrolls vertically, else the window. An app shell that scrolls
 * its content pane instead of the document (e.g. a micro-frontend host) keeps
 * `window.scrollY` at 0 forever, so tracking the window there never virtualizes
 * past the first screen and never reaches the end.
 *
 * `overflow-y` alone is not enough: a non-`visible` `overflow-x` (a plain
 * `overflow-x-hidden` layout wrapper) computes `overflow-y: visible` to `auto`
 * on a box that grows with its content and never scrolls. Only a box whose
 * content overflows it counts — so a pane that does not overflow yet resolves
 * to the window (`useWindowScrollRoot` re-resolves as the table grows).
 */
export const getScrollRoot = (el: Element | null): ScrollRoot => {
  // `body` is walked too: a shell with `html { overflow: hidden }` scrolls it.
  // The 1px slack keeps sub-pixel or stray overflow from making a
  // grow-with-content box the root.
  for (
    let node = el?.parentElement;
    node && node !== document.documentElement;
    node = node.parentElement
  ) {
    if (
      SCROLLABLE_OVERFLOW.test(getComputedStyle(node).overflowY) &&
      node.scrollHeight - node.clientHeight > 1
    ) {
      return node;
    }
  }
  return window;
};

export const getScrollMetrics = (root: ScrollRoot) =>
  isWindowScrollRoot(root)
    ? {
        scrollTop: root.scrollY,
        clientHeight: root.innerHeight,
        scrollHeight: document.documentElement.scrollHeight,
      }
    : {
        scrollTop: root.scrollTop,
        clientHeight: root.clientHeight,
        scrollHeight: root.scrollHeight,
      };

export const scrollRootBy = (root: ScrollRoot, delta: number) => {
  if (isWindowScrollRoot(root)) root.scrollBy(0, delta);
  else root.scrollTop += delta;
};

/** `el`'s top in the root's scroll-content coordinates (the virtualizer's `scrollMargin`). */
export const getOffsetTopInScrollRoot = (el: HTMLElement, root: ScrollRoot) =>
  isWindowScrollRoot(root)
    ? getDocumentOffsetTop(el)
    : // Scroll coordinates start inside the root's border; the rect includes it.
      el.getBoundingClientRect().top -
      root.getBoundingClientRect().top -
      root.clientTop +
      root.scrollTop;
