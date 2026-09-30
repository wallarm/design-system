import { getDocumentOffsetTop } from '../TableBody/lib/getDocumentOffsetTop';

export type ScrollRoot = HTMLElement | Window;

const SCROLLABLE_OVERFLOW = /(auto|scroll|overlay)/;

export const isWindowScrollRoot = (root: ScrollRoot): root is Window => root === window;

/**
 * What a `virtualized='window'` table actually scrolls with: the nearest
 * vertically scrollable ancestor, else the window. An app shell that scrolls
 * its content pane instead of the document (e.g. a micro-frontend host) keeps
 * `window.scrollY` at 0 forever, so tracking the window there never virtualizes
 * past the first screen and never reaches the end.
 */
export const getScrollRoot = (el: Element | null): ScrollRoot => {
  for (let node = el?.parentElement; node && node !== document.body; node = node.parentElement) {
    if (SCROLLABLE_OVERFLOW.test(getComputedStyle(node).overflowY)) return node;
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
    : el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop;
