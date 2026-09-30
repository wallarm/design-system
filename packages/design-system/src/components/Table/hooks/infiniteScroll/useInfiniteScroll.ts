import type { RefObject } from 'react';
import type { RowData, Table } from '@tanstack/react-table';
import {
  type DSTableFeatures,
  type ScrollRoot,
  TABLE_END_REACHED_THRESHOLD,
  TABLE_START_REACHED_THRESHOLD,
} from '../../lib';
import type { TableVirtualizerInstance } from '../../TableContext/types';
import { useInitialAnchor } from './useInitialAnchor';
import { usePrependScrollAnchor } from './usePrependScrollAnchor';
import { useScrollEdge } from './useScrollEdge';

interface UseInfiniteScrollOptions<T extends RowData> {
  mode: 'container' | 'window';
  /** Scroll element ref — required for `container` mode */
  scrollRef?: RefObject<HTMLElement | null>;
  /** `window` mode: the resolved scroll root (see `useWindowScrollRoot`) */
  scrollRoot?: ScrollRoot | null;
  table: Table<DSTableFeatures, T>;
  virtualizerRef: RefObject<TableVirtualizerInstance | null>;
  tbodyRef?: RefObject<HTMLTableSectionElement | null>;
  onStartReached?: () => void;
  onStartReachedThreshold?: number;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  initialScrollToRowId?: string;
  /** Gates the prepend scroll compensation to actual previous-page fetches. */
  isLoadingPrevious?: boolean;
}

/** Single entry point for bidirectional infinite scroll behavior. */
export const useInfiniteScroll = <T extends RowData>({
  mode,
  scrollRef,
  scrollRoot,
  table,
  virtualizerRef,
  tbodyRef,
  onStartReached,
  onStartReachedThreshold,
  onEndReached,
  onEndReachedThreshold,
  initialScrollToRowId,
  isLoadingPrevious,
}: UseInfiniteScrollOptions<T>) => {
  const rows = table.getRowModel().rows;

  const ready = useInitialAnchor({ initialScrollToRowId, rows, virtualizerRef });

  usePrependScrollAnchor({
    mode,
    scrollRef,
    scrollRoot,
    rows,
    virtualizerRef,
    tbodyRef,
    isLoadingPrevious,
  });

  useScrollEdge({
    edge: 'start',
    mode,
    scrollRef,
    scrollRoot,
    onReached: onStartReached,
    threshold: onStartReachedThreshold ?? TABLE_START_REACHED_THRESHOLD,
    enabled: ready,
  });

  useScrollEdge({
    edge: 'end',
    mode,
    scrollRef,
    scrollRoot,
    onReached: onEndReached,
    threshold: onEndReachedThreshold ?? TABLE_END_REACHED_THRESHOLD,
    enabled: ready,
  });
};
