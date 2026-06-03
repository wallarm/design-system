import { measureElement, type Virtualizer } from '@tanstack/react-virtual';

/**
 * Row-measurement function for the table virtualizers.
 *
 * TanStack's default reads `offsetHeight` when called without a
 * ResizeObserver entry — which is exactly the initial measurement on row
 * mount, in the middle of React's commit, right after fresh DOM mutations.
 * Every such read forces a full-document reflow, and a chunk of new rows
 * pays it per row while scrolling.
 *
 * The synchronous read is redundant: `observe()` is guaranteed to deliver an
 * initial entry with `borderBoxSize` in the same frame, post-layout — a free
 * measurement. So without an entry we return the size the virtualizer
 * already assumes for the item (cached measurement or estimate), making the
 * mount-time call a no-op, and let the observer entry supply the real size.
 * With an entry we defer to the default, which uses `borderBoxSize` and
 * never touches layout.
 */
export const measureRowElement = <TScrollElement extends Element | Window>(
  element: Element,
  entry: ResizeObserverEntry | undefined,
  instance: Virtualizer<TScrollElement, Element>,
): number => {
  if (entry) {
    return measureElement(element, entry, instance);
  }

  const index = instance.indexFromElement(element);
  return instance.measurementsCache[index]?.size ?? instance.options.estimateSize(index);
};
