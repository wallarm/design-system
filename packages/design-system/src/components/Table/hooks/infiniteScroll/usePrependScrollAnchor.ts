import { type RefObject, useLayoutEffect, useRef } from 'react';
import { detectDataChange } from '../../lib';
import type { TableVirtualizerInstance } from '../../TableContext/types';

interface UsePrependScrollAnchorOptions {
  mode: 'container' | 'window';
  scrollRef?: RefObject<HTMLElement | null>;
  rows: { id: string }[];
  /** Preferred delta source: virtual-list offsets are immune to unrelated layout growth. */
  virtualizerRef?: RefObject<TableVirtualizerInstance | null>;
}

/**
 * Keeps the viewport visually stable when rows are prepended. The prepended
 * height is read as how far the previously-first row moved down the virtual
 * list (its `start` offset delta) — unlike a scrollHeight diff, that is immune
 * to unrelated layout changes elsewhere on the page, which matters in `window`
 * mode where the whole document height is shared. Falls back to the
 * scrollHeight diff when the virtualizer or the row is unavailable. Runs in a
 * layout effect so the adjustment lands before paint (no flicker).
 */
export const usePrependScrollAnchor = ({
  mode,
  scrollRef,
  rows,
  virtualizerRef,
}: UsePrependScrollAnchorOptions) => {
  const prevFirstRowIdRef = useRef<string | undefined>(rows[0]?.id);
  const prevFirstRowStartRef = useRef<number | null>(null);
  const prevScrollHeightRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const getScrollHeight = () =>
      mode === 'window'
        ? document.documentElement.scrollHeight
        : (scrollRef?.current?.scrollHeight ?? 0);

    // measurementsCache is keyed by row id (getItemKey), so measured sizes
    // survive a prepend and `start` offsets stay attached to the right rows.
    // Both the baseline and the post-prepend offset come from the same
    // list-relative coordinate space, so constant terms (paddingStart, the
    // table's own document offset in window mode) cancel out in the delta.
    const getFirstRowStart = () => {
      const start = virtualizerRef?.current?.measurementsCache[0]?.start;
      return typeof start === 'number' ? start : null;
    };

    // Seed the baselines on first run — there is nothing to diff against.
    if (prevScrollHeightRef.current === null) {
      prevScrollHeightRef.current = getScrollHeight();
      prevFirstRowStartRef.current = getFirstRowStart();
      prevFirstRowIdRef.current = rows[0]?.id;
      return;
    }

    if (detectDataChange(prevFirstRowIdRef.current, rows) === 'prepend') {
      const prevId = prevFirstRowIdRef.current;
      const index = rows.findIndex(row => row.id === prevId);
      const newStart = virtualizerRef?.current?.measurementsCache[index]?.start;
      const delta =
        index >= 0 && typeof newStart === 'number' && prevFirstRowStartRef.current !== null
          ? newStart - prevFirstRowStartRef.current
          : getScrollHeight() - prevScrollHeightRef.current;
      if (delta > 0) {
        if (mode === 'window') window.scrollBy(0, delta);
        else if (scrollRef?.current) scrollRef.current.scrollTop += delta;
      }
    }

    prevFirstRowIdRef.current = rows[0]?.id;
    prevFirstRowStartRef.current = getFirstRowStart();
    prevScrollHeightRef.current = getScrollHeight();
  }, [rows, mode, scrollRef, virtualizerRef]);
};
