import { type FC, useCallback, useEffect, useRef } from 'react';
import {
  elementScroll,
  observeElementOffset,
  observeElementRect,
  observeWindowOffset,
  observeWindowRect,
  useVirtualizer,
  type Virtualizer,
} from '@tanstack/react-virtual';
import {
  getOffsetTopInScrollRoot,
  getRowKey,
  getScrollMetrics,
  getScrollRoot,
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
  const { table, estimateRowHeight, overscan, tbodyRef, virtualizerRef, containerRef } =
    useTableContext();

  // On a fresh mount the tbody (this body's own child) is the first ref
  // attached — the scroll container's comes after the first layout effect. On
  // a body remount the container is already there, so the root is known at
  // render time and `initialOffset` reads the real offset. Cached: the walk
  // reads computed styles.
  const scrollRootRef = useRef<ScrollRoot | null>(null);
  const getScrollElement = useCallback(() => {
    const anchor = tbodyRef.current ?? containerRef.current;
    if (!scrollRootRef.current && anchor) scrollRootRef.current = getScrollRoot(anchor);
    return scrollRootRef.current;
  }, [tbodyRef, containerRef]);

  const scrollRoot = getScrollElement();

  const virtualizer = useVirtualizer<Element, Element>({
    count: table.getRowModel().rows.length,
    getScrollElement: getScrollElement as () => Element | null,
    observeElementRect: observeRootRect,
    observeElementOffset: observeRootOffset,
    scrollToFn: elementScroll,
    initialOffset: () => getScrollMetrics(getScrollElement() ?? window).scrollTop,
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

  return <TableBodyVirtualizedCore tbodyRef={tbodyRef} virtualizer={virtualizer} />;
};

TableBodyVirtualizedWindow.displayName = 'TableBodyVirtualizedWindow';
