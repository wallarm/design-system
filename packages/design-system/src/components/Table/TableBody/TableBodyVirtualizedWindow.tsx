import { type FC, useCallback, useEffect } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { TABLE_VIRTUALIZATION_OVERSCAN } from '../lib';
import { useTableContext } from '../TableContext';
import { getDocumentOffsetTop } from './lib/getDocumentOffsetTop';
import { TableBodyVirtualizedCore } from './TableBodyVirtualizedCore';
import { useResetVirtualizerOnDataChange } from './useResetVirtualizerOnDataChange';
import { useSmoothScrollOnSort } from './useSmoothScrollOnSort';

export const TableBodyVirtualizedWindow: FC = () => {
  const { table, estimateRowHeight, overscan, tbodyRef, virtualizerRef } = useTableContext();

  const virtualizer = useWindowVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: estimateRowHeight ?? (() => 40),
    overscan: overscan ?? TABLE_VIRTUALIZATION_OVERSCAN,
    scrollMargin: tbodyRef.current ? getDocumentOffsetTop(tbodyRef.current) : 0,
  });

  // Variable-height rows report a size delta on every (re)measure. The default
  // reaction is window.scrollTo() to pin content — but in window mode that scroll
  // drifts the page down AND emits scroll events that retrigger onEndReached,
  // creating a runaway auto-load loop and blank gaps on scroll-up. Opting out
  // leaves the scroll position put; rows above simply reflow, which is far less
  // disruptive than the feedback loop. It's an instance field, not a constructor
  // option, so it's set here rather than passed in.
  virtualizer.shouldAdjustScrollPositionOnItemSizeChange = () => false;

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

  const getScrollTarget = useCallback(() => window as Window, []);
  useSmoothScrollOnSort(table, getScrollTarget);

  return <TableBodyVirtualizedCore tbodyRef={tbodyRef} virtualizer={virtualizer} />;
};

TableBodyVirtualizedWindow.displayName = 'TableBodyVirtualizedWindow';
