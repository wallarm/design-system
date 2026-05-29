import type { RefObject } from 'react';
import type { Table } from '@tanstack/react-table';
import { TABLE_END_REACHED_THRESHOLD, TABLE_START_REACHED_THRESHOLD } from '../../lib';
import type { TableVirtualizerInstance } from '../../TableContext/types';
import { useInitialAnchor } from './useInitialAnchor';
import { usePrependScrollAnchor } from './usePrependScrollAnchor';
import { useScrollEdge } from './useScrollEdge';

interface UseInfiniteScrollOptions<T> {
  mode: 'container' | 'window';
  /** Scroll element ref — required for `container` mode */
  scrollRef?: RefObject<HTMLElement | null>;
  table: Table<T>;
  virtualizerRef: RefObject<TableVirtualizerInstance | null>;
  onStartReached?: () => void;
  onStartReachedThreshold?: number;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  initialScrollToRowId?: string;
}

/** Single entry point for bidirectional infinite scroll behavior. */
export const useInfiniteScroll = <T>({
  mode,
  scrollRef,
  table,
  virtualizerRef,
  onStartReached,
  onStartReachedThreshold,
  onEndReached,
  onEndReachedThreshold,
  initialScrollToRowId,
}: UseInfiniteScrollOptions<T>) => {
  const rows = table.getRowModel().rows;

  const ready = useInitialAnchor({ initialScrollToRowId, rows, virtualizerRef });

  usePrependScrollAnchor({ mode, scrollRef, rows });

  useScrollEdge({
    edge: 'start',
    mode,
    scrollRef,
    onReached: onStartReached,
    threshold: onStartReachedThreshold ?? TABLE_START_REACHED_THRESHOLD,
    enabled: ready,
  });

  useScrollEdge({
    edge: 'end',
    mode,
    scrollRef,
    onReached: onEndReached,
    threshold: onEndReachedThreshold ?? TABLE_END_REACHED_THRESHOLD,
    enabled: ready,
  });
};
