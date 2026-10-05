import { type FC, useCallback, useContext, useEffect, useLayoutEffect, useRef } from 'react';
import {
  elementScroll,
  observeElementOffset,
  observeElementRect,
  observeWindowOffset,
  observeWindowRect,
  useVirtualizer,
  type Virtualizer,
} from '@tanstack/react-virtual';
import { WindowScrollRootContext } from '../hooks/useWindowScrollRoot';
import {
  getOffsetTopInScrollRoot,
  getRowKey,
  getScrollMetrics,
  isWindowScrollRoot,
  type ScrollRoot,
  TABLE_VIRTUALIZATION_OVERSCAN,
} from '../lib';
import { useTableContext } from '../TableContext';
import { measureRowElement } from './lib/measureRowElement';
import { TableBodyVirtualizedCore } from './TableBodyVirtualizedCore';
import { useResetVirtualizerOnDataChange } from './useResetVirtualizerOnDataChange';
import { useSmoothScrollOnSort } from './useSmoothScrollOnSort';

// `useVirtualizer` types its scroll element as an `Element` and
// `useWindowVirtualizer` pins it to the window; the root here is either, so the
// window rides in behind an `Element` type and these observers pick the window
// or the element flavor from the actual instance. `elementScroll` already
// handles both (it only calls `scrollTo`).
type RootVirtualizer = Virtualizer<Element, Element>;

const isWindowRoot = (instance: RootVirtualizer) =>
  (instance.scrollElement as ScrollRoot | null) === window;

const observeRootRect = (
  instance: RootVirtualizer,
  cb: Parameters<typeof observeElementRect>[1],
) =>
  isWindowRoot(instance)
    ? observeWindowRect(instance as unknown as Virtualizer<Window, Element>, cb)
    : observeElementRect(instance, cb);

const observeRootOffset = (
  instance: RootVirtualizer,
  cb: Parameters<typeof observeElementOffset>[1],
) =>
  isWindowRoot(instance)
    ? observeWindowOffset(instance as unknown as Virtualizer<Window, Element>, cb)
    : observeElementOffset(instance, cb);

export const TableBodyVirtualizedWindow: FC = () => {
  const { table, estimateRowHeight, overscan, tbodyRef, virtualizerRef } = useTableContext();

  const scrollRoot = useContext(WindowScrollRootContext);
  const scrollRootRef = useRef(scrollRoot);
  scrollRootRef.current = scrollRoot;
  const getScrollElement = useCallback(() => scrollRootRef.current, []);

  // Runs before the virtualizer's own layout effect (hook order), which adopts
  // a new root by scrolling it to the cached offset. That offset was read
  // lazily during render — before a root, from the window — so a scrolled pane
  // would jump to it. Dropping it makes `initialOffset` read the real root.
  useLayoutEffect(() => {
    const instance = virtualizerRef.current;
    if (instance && instance.scrollElement !== scrollRoot) instance.scrollOffset = null;
  });

  const virtualizer = useVirtualizer<Element, Element>({
    count: table.getRowModel().rows.length,
    getScrollElement: getScrollElement as () => Element | null,
    observeElementRect: observeRootRect,
    observeElementOffset: observeRootOffset,
    scrollToFn: elementScroll,
    // `useWindowVirtualizer`'s starting size: rows render in the very first
    // commit, so the shell sees a laid-out table when it settles the root.
    initialRect:
      scrollRoot && isWindowScrollRoot(scrollRoot)
        ? { width: scrollRoot.innerWidth, height: scrollRoot.innerHeight }
        : undefined,
    initialOffset: () => {
      const root = getScrollElement() ?? (typeof window === 'undefined' ? null : window);
      return root ? getScrollMetrics(root).scrollTop : 0;
    },
    estimateSize: estimateRowHeight ?? (() => 40),
    overscan: overscan ?? TABLE_VIRTUALIZATION_OVERSCAN,
    scrollMargin:
      tbodyRef.current && scrollRoot ? getOffsetTopInScrollRoot(tbodyRef.current, scrollRoot) : 0,
    getItemKey: useCallback((index: number) => getRowKey(table.getRowModel().rows, index), [table]),
    measureElement: measureRowElement,
  });

  // Publish to the table-level handle. Render-time assignment is safe — refs
  // don't trigger re-renders and the value is idempotent across renders.
  virtualizerRef.current = virtualizer;

  // Clear on unmount so any `scrollToRow` call landing between this body's
  // unmount and a successor body's first render doesn't act on a dead
  // virtualizer instance.
  useEffect(() => {
    return () => {
      virtualizerRef.current = null;
    };
  }, [virtualizerRef]);

  useResetVirtualizerOnDataChange(table, virtualizer);

  useSmoothScrollOnSort(table, getScrollElement);

  return (
    <TableBodyVirtualizedCore
      tbodyRef={tbodyRef}
      virtualRows={virtualizer.getVirtualItems()}
      totalSize={virtualizer.getTotalSize()}
      scrollMargin={virtualizer.options.scrollMargin}
      measureElement={virtualizer.measureElement}
    />
  );
};

TableBodyVirtualizedWindow.displayName = 'TableBodyVirtualizedWindow';
