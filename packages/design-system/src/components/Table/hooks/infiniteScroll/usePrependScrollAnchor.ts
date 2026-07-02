import { type RefObject, useLayoutEffect, useRef } from 'react';
import { detectDataChange } from '../../lib';
import type { TableVirtualizerInstance } from '../../TableContext/types';

interface UsePrependScrollAnchorOptions {
  mode: 'container' | 'window';
  scrollRef?: RefObject<HTMLElement | null>;
  rows: { id: string }[];
  /** Preferred delta source: virtual-list offsets are immune to unrelated layout growth. */
  virtualizerRef?: RefObject<TableVirtualizerInstance | null>;
  /** Scopes the start-loader measurement to this table's body. */
  tbodyRef?: RefObject<HTMLTableSectionElement | null>;
}

/**
 * Keeps the viewport stable across a prepend, in a layout effect (pre-paint, no
 * flicker). Delta = how far the previously-first row moved down the virtual list
 * (`start` offset) — immune to unrelated page-height changes, unlike a
 * scrollHeight diff, which matters in `window` mode. Falls back to scrollHeight
 * when there's no virtualizer.
 *
 * Start-edge skeletons (`isLoadingPrevious`) sit above the rows but outside the
 * virtual list, so the offset delta can't see them; their height is tracked per
 * commit (hence no dep array) and its collapse joins the delta when the prepend
 * lands in the same commit.
 */
export const usePrependScrollAnchor = ({
  mode,
  scrollRef,
  rows,
  virtualizerRef,
  tbodyRef,
}: UsePrependScrollAnchorOptions) => {
  const prevFirstRowIdRef = useRef<string | undefined>(undefined);
  const prevLastRowIdRef = useRef<string | undefined>(undefined);
  const prevFirstRowStartRef = useRef<number | null>(null);
  const prevScrollHeightRef = useRef<number | null>(null);
  const prevLoaderRef = useRef({ count: 0, height: 0 });
  const seededRef = useRef(false);

  // No dependency array on purpose: the loader baseline must track every
  // commit, not just rows changes.
  useLayoutEffect(() => {
    const getScrollHeight = () =>
      mode === 'window'
        ? document.documentElement.scrollHeight
        : (scrollRef?.current?.scrollHeight ?? 0);

    // Re-measure only when the row count changes (mount/unmount) so steady
    // renders don't pay geometry reads.
    const getStartLoaderHeight = () => {
      const loaderRows = tbodyRef?.current?.querySelectorAll('tr[data-loading-position="start"]');
      const count = loaderRows?.length ?? 0;
      if (count !== prevLoaderRef.current.count) {
        let height = 0;
        loaderRows?.forEach(row => {
          height += (row as HTMLElement).offsetHeight;
        });
        prevLoaderRef.current = { count, height };
      }
      return prevLoaderRef.current.height;
    };

    // measurementsCache is keyed by row id, so `start` offsets survive a
    // prepend; baseline and post-prepend offset share one coordinate space, so
    // constant terms cancel in the delta.
    const getFirstRowStart = () => {
      const start = virtualizerRef?.current?.measurementsCache[0]?.start;
      return typeof start === 'number' ? start : null;
    };

    // scrollHeight is a forced-reflow read, so the fallback baseline is kept
    // only while there is no virtualizer to provide clean virtual offsets.
    const trackScrollHeight = !virtualizerRef?.current;

    // Seed the baselines on first run — there is nothing to diff against.
    if (!seededRef.current) {
      seededRef.current = true;
      prevScrollHeightRef.current = trackScrollHeight ? getScrollHeight() : null;
      prevFirstRowStartRef.current = getFirstRowStart();
      prevFirstRowIdRef.current = rows[0]?.id;
      prevLastRowIdRef.current = rows[rows.length - 1]?.id;
      getStartLoaderHeight();
      return;
    }

    const prevLoaderHeight = prevLoaderRef.current.height;

    if (detectDataChange(prevFirstRowIdRef.current, rows, prevLastRowIdRef.current) === 'prepend') {
      const prevId = prevFirstRowIdRef.current;
      const index = rows.findIndex(row => row.id === prevId);
      const newStart = virtualizerRef?.current?.measurementsCache[index]?.start;
      const useVirtualDelta =
        index >= 0 && typeof newStart === 'number' && prevFirstRowStartRef.current !== null;
      if (useVirtualDelta) {
        const rowDelta = (newStart as number) - (prevFirstRowStartRef.current as number);
        // Usually negative — the skeleton block collapses as its page arrives;
        // the offset path adds it (the scrollHeight fallback nets it already).
        const loaderDelta = getStartLoaderHeight() - prevLoaderHeight;
        const delta = rowDelta + loaderDelta;
        if (delta !== 0) {
          if (mode === 'window') window.scrollBy(0, delta);
          else if (scrollRef?.current) scrollRef.current.scrollTop += delta;
        }
      } else if (prevScrollHeightRef.current !== null) {
        const delta = getScrollHeight() - prevScrollHeightRef.current;
        // `> 0`: a non-positive net (page shorter than the skeletons) is left
        // uncorrected — a tiny static gap beats a jump the wrong way.
        if (delta > 0) {
          if (mode === 'window') window.scrollBy(0, delta);
          else if (scrollRef?.current) scrollRef.current.scrollTop += delta;
        }
      }
    }

    prevFirstRowIdRef.current = rows[0]?.id;
    prevLastRowIdRef.current = rows[rows.length - 1]?.id;
    prevFirstRowStartRef.current = getFirstRowStart();
    prevScrollHeightRef.current = trackScrollHeight ? getScrollHeight() : null;
    getStartLoaderHeight();
  });
};
