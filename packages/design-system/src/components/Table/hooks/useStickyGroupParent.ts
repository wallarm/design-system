import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import type { ReactTable, Row, RowData } from '@tanstack/react-table';
import type { DSTableFeatures } from '../lib';
import type { TableVirtualizerInstance } from '../TableContext/types';

interface GroupRange {
  row: Row<DSTableFeatures, RowData>;
  /** Index of the parent row in the flat row model */
  parentIndex: number;
  /** Index of the last child row in the flat row model */
  lastChildIndex: number;
}

export interface StickyGroupParentResult<T extends RowData> {
  stickyRow: Row<DSTableFeatures, T> | null;
  pushUpOffset: number;
}

interface UseStickyGroupParentOptions {
  table: ReactTable<DSTableFeatures, RowData>;
  scrollElementRef: RefObject<HTMLElement | null>;
  useWindowScroll: boolean;
  headerHeight: number;
  tbodyRef: RefObject<HTMLTableSectionElement | null>;
  virtualizerRef: RefObject<TableVirtualizerInstance | null>;
  enabled: boolean;
}

/**
 * Builds a list of expanded depth-0 group parents and their index ranges
 * in the flat row model.
 */
const buildGroupRanges = (table: ReactTable<DSTableFeatures, RowData>): GroupRange[] => {
  const rows = table.getRowModel().rows;
  const ranges: GroupRange[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    if (row.depth === 0 && row.subRows.length > 0 && row.getIsExpanded()) {
      // Find the last child by scanning forward — children are contiguous
      // in the flat model immediately after the parent.
      let lastChildIndex = i;
      for (let j = i + 1; j < rows.length; j++) {
        if (rows[j]!.depth > 0) {
          lastChildIndex = j;
        } else {
          break;
        }
      }
      ranges.push({ row, parentIndex: i, lastChildIndex });
    }
  }

  return ranges;
};

/**
 * Returns a row's top and bottom positions in scroll-content coordinates.
 *
 * Scroll-content coordinates match scrollTop for container mode and
 * document-relative Y for window mode. The comparison
 * `pos < scrollTop + headerHeight` then means "the row is behind the
 * sticky header".
 *
 * For virtualized tables: measurement.start is relative to the virtual-list
 * start (tbody content), so we add `tbodyScrollOffset` to convert to
 * scroll-content coordinates.
 *
 * For non-virtualized tables: we use getBoundingClientRect which gives
 * pixel-accurate positions regardless of offsetParent chains.
 */
const getRowBounds = (
  index: number,
  virt: TableVirtualizerInstance | null,
  tbodyScrollOffset: number,
  tbodyEl: HTMLTableSectionElement | null,
  scrollTop: number,
  scrollContainerTop: number,
): { top: number; bottom: number; height: number } | null => {
  if (virt) {
    const m = virt.measurementsCache[index];
    if (m) {
      return {
        top: tbodyScrollOffset + m.start,
        bottom: tbodyScrollOffset + m.start + m.size,
        height: m.size,
      };
    }
    // Fallback: estimate (item hasn't been measured yet)
    const size = virt.options.estimateSize(index);
    let start = 0;
    for (let i = 0; i < index; i++) {
      const mi = virt.measurementsCache[i];
      start += mi ? mi.size : virt.options.estimateSize(i);
    }
    return {
      top: tbodyScrollOffset + start,
      bottom: tbodyScrollOffset + start + size,
      height: size,
    };
  }

  // Non-virtualized: use getBoundingClientRect for reliability
  if (!tbodyEl) return null;
  const rowEls = tbodyEl.querySelectorAll<HTMLTableRowElement>('[data-row-id]');
  const rowEl = rowEls[index];
  if (!rowEl) return null;

  const rect = rowEl.getBoundingClientRect();
  // Convert viewport-relative rect to scroll-content coordinates:
  // scrollContentPos = viewportPos - scrollContainerViewportTop + scrollTop
  const top = rect.top - scrollContainerTop + scrollTop;
  return {
    top,
    bottom: top + rect.height,
    height: rect.height,
  };
};

export const useStickyGroupParent = <T extends RowData>(
  options: UseStickyGroupParentOptions,
): StickyGroupParentResult<T> => {
  const {
    table,
    scrollElementRef,
    useWindowScroll,
    headerHeight,
    tbodyRef,
    virtualizerRef,
    enabled,
  } = options;

  const [stickyRow, setStickyRow] = useState<Row<DSTableFeatures, T> | null>(null);
  const [pushUpOffset, setPushUpOffset] = useState(0);
  const rafRef = useRef(0);
  const prevStickyRowIdRef = useRef<string | null>(null);

  const compute = useCallback(() => {
    if (!enabled) {
      if (prevStickyRowIdRef.current !== null) {
        setStickyRow(null);
        setPushUpOffset(0);
        prevStickyRowIdRef.current = null;
      }
      return;
    }

    const scrollElement = scrollElementRef.current;
    if (!scrollElement) return;

    const scrollTop = useWindowScroll ? window.scrollY : scrollElement.scrollTop;
    const headerBottom = scrollTop + headerHeight;

    const tbodyEl = tbodyRef.current;
    const virt = virtualizerRef.current;

    // Compute the tbody's offset in scroll-content coordinates (needed for
    // virtualized mode where measurement.start is relative to tbody start).
    // For non-virtualized mode we use getBoundingClientRect per-row instead.
    let tbodyScrollOffset = 0;
    // scrollContainerTop is the scroll container's viewport-top for
    // converting getBoundingClientRect to scroll-content coords.
    let scrollContainerTop = 0;

    if (tbodyEl) {
      if (useWindowScroll) {
        // Window mode: scroll-content coords = document coords
        tbodyScrollOffset = tbodyEl.getBoundingClientRect().top + window.scrollY;
        scrollContainerTop = 0; // document coords: viewport origin = 0 + scrollY
      } else {
        const scrollRect = scrollElement.getBoundingClientRect();
        scrollContainerTop = scrollRect.top;
        tbodyScrollOffset = tbodyEl.getBoundingClientRect().top - scrollRect.top + scrollTop;
      }
    }

    const ranges = buildGroupRanges(table);

    let foundRow: Row<DSTableFeatures, RowData> | null = null;
    let offset = 0;

    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i]!;

      const parentBounds = getRowBounds(
        range.parentIndex,
        virt,
        tbodyScrollOffset,
        tbodyEl,
        scrollTop,
        scrollContainerTop,
      );
      if (!parentBounds) continue;

      const lastChildBounds = getRowBounds(
        range.lastChildIndex,
        virt,
        tbodyScrollOffset,
        tbodyEl,
        scrollTop,
        scrollContainerTop,
      );
      if (!lastChildBounds) continue;

      // The parent's top is above the header bottom (scrolled past),
      // and the last child's bottom is still below it (group still visible)
      if (parentBounds.top < headerBottom && lastChildBounds.bottom > headerBottom) {
        foundRow = range.row;

        // Compute push-up offset: when the last child's bottom is within
        // one parent-row-height of the header bottom, the sticky row should
        // start sliding up to make room for the next group.
        const remaining = lastChildBounds.bottom - headerBottom;
        if (remaining < parentBounds.height) {
          offset = -(parentBounds.height - remaining);
        } else {
          offset = 0;
        }

        break;
      }
    }

    const newId = foundRow?.id ?? null;
    if (newId !== prevStickyRowIdRef.current || offset !== 0) {
      prevStickyRowIdRef.current = newId;
      setStickyRow(foundRow as Row<DSTableFeatures, T> | null);
      setPushUpOffset(offset);
    }
  }, [enabled, scrollElementRef, useWindowScroll, headerHeight, table, virtualizerRef, tbodyRef]);

  // Scroll listener
  useEffect(() => {
    if (!enabled) return;

    const scrollTarget = useWindowScroll ? window : scrollElementRef.current;
    if (!scrollTarget) return;

    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(compute);
    };

    // Initial computation
    compute();

    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, useWindowScroll, scrollElementRef, compute]);

  // Recompute when expanded state changes
  useEffect(() => {
    compute();
  }, [compute]);

  return { stickyRow, pushUpOffset };
};
