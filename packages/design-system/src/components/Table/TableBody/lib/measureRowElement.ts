import { measureElement, type Virtualizer } from '@tanstack/react-virtual';

/**
 * Row-measurement for the table virtualizers. TanStack's default reads
 * `offsetHeight` when called without a ResizeObserver entry — i.e. on row
 * mount mid-commit, forcing a reflow per new row while scrolling. That read is
 * redundant: `observe()` delivers an initial `borderBoxSize` entry the same
 * frame, post-layout. So entry-less we return the assumed size (cache/estimate)
 * — a no-op — and let the observer entry supply the real one.
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
