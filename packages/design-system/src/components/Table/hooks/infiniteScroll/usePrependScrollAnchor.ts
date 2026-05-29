import { type RefObject, useLayoutEffect, useRef } from 'react';
import { detectDataChange } from '../../lib';

interface UsePrependScrollAnchorOptions {
  mode: 'container' | 'window';
  scrollRef?: RefObject<HTMLElement | null>;
  rows: { id: string }[];
}

/**
 * Keeps the viewport visually stable when rows are prepended: measures the
 * scrollHeight delta and adds it to scrollTop. Runs in a layout effect so the
 * adjustment lands before paint (no flicker).
 */
export const usePrependScrollAnchor = ({
  mode,
  scrollRef,
  rows,
}: UsePrependScrollAnchorOptions) => {
  const prevFirstRowIdRef = useRef<string | undefined>(rows[0]?.id);
  const prevScrollHeightRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const getScrollHeight = () =>
      mode === 'window'
        ? document.documentElement.scrollHeight
        : (scrollRef?.current?.scrollHeight ?? 0);

    // Seed the baseline on first run — there is no previous height to diff against.
    if (prevScrollHeightRef.current === null) {
      prevScrollHeightRef.current = getScrollHeight();
      prevFirstRowIdRef.current = rows[0]?.id;
      return;
    }

    if (detectDataChange(prevFirstRowIdRef.current, rows) === 'prepend') {
      const delta = getScrollHeight() - prevScrollHeightRef.current;
      if (delta > 0) {
        if (mode === 'window') window.scrollBy(0, delta);
        else if (scrollRef?.current) scrollRef.current.scrollTop += delta;
      }
    }

    prevFirstRowIdRef.current = rows[0]?.id;
    prevScrollHeightRef.current = getScrollHeight();
  }, [rows, mode, scrollRef]);
};
