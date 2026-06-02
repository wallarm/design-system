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
 * Keeps the viewport visually stable when rows are prepended. The prepended
 * height is read as how far the previously-first row moved down the virtual
 * list (its `start` offset delta) — unlike a scrollHeight diff, that is immune
 * to unrelated layout changes elsewhere on the page, which matters in `window`
 * mode where the whole document height is shared. Falls back to the
 * scrollHeight diff when the virtualizer or the row is unavailable. Runs in a
 * layout effect so the adjustment lands before paint (no flicker).
 *
 * The start-edge loading skeletons (`isLoadingPrevious`) live above the rows
 * but outside the virtual list, so the row-offset delta can't see them. Their
 * height is tracked per commit (the effect deliberately has no dependency
 * array): when a prepend lands in the same commit that unmounts them, the
 * block's collapse joins the adjustment — otherwise the viewport would land
 * short by exactly the skeleton block.
 */
export const usePrependScrollAnchor = ({
  mode,
  scrollRef,
  rows,
  virtualizerRef,
  tbodyRef,
}: UsePrependScrollAnchorOptions) => {
  const prevFirstRowIdRef = useRef<string | undefined>(undefined);
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

    // measurementsCache is keyed by row id (getItemKey), so measured sizes
    // survive a prepend and `start` offsets stay attached to the right rows.
    // Both the baseline and the post-prepend offset come from the same
    // list-relative coordinate space, so constant terms (paddingStart, the
    // table's own document offset in window mode) cancel out in the delta.
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
      getStartLoaderHeight();
      return;
    }

    const prevLoaderHeight = prevLoaderRef.current.height;

    if (detectDataChange(prevFirstRowIdRef.current, rows) === 'prepend') {
      const prevId = prevFirstRowIdRef.current;
      const index = rows.findIndex(row => row.id === prevId);
      const newStart = virtualizerRef?.current?.measurementsCache[index]?.start;
      const useVirtualDelta =
        index >= 0 && typeof newStart === 'number' && prevFirstRowStartRef.current !== null;
      if (useVirtualDelta) {
        const rowDelta = (newStart as number) - (prevFirstRowStartRef.current as number);
        // Usually negative: the skeleton block collapses in the commit the
        // page it stood in for arrives. The scrollHeight fallback includes
        // this term by construction; the virtual-offset path adds it here.
        const loaderDelta = getStartLoaderHeight() - prevLoaderHeight;
        const delta = rowDelta + loaderDelta;
        if (delta !== 0) {
          if (mode === 'window') window.scrollBy(0, delta);
          else if (scrollRef?.current) scrollRef.current.scrollTop += delta;
        }
      } else if (prevScrollHeightRef.current !== null) {
        const delta = getScrollHeight() - prevScrollHeightRef.current;
        if (delta > 0) {
          if (mode === 'window') window.scrollBy(0, delta);
          else if (scrollRef?.current) scrollRef.current.scrollTop += delta;
        }
      }
    }

    prevFirstRowIdRef.current = rows[0]?.id;
    prevFirstRowStartRef.current = getFirstRowStart();
    prevScrollHeightRef.current = trackScrollHeight ? getScrollHeight() : null;
    getStartLoaderHeight();
  });
};
