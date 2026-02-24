import { type RefObject, useEffect, useState } from 'react';

interface HorizontalScrollState {
  hasOverflow: boolean;
  atStart: boolean;
  atEnd: boolean;
}

/** Tracks horizontal overflow & scroll position of a scrollable container. */
export const useHorizontalScrollState = (
  containerRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
): HorizontalScrollState => {
  const [state, setState] = useState<HorizontalScrollState>({
    hasOverflow: false,
    atStart: true,
    atEnd: false,
  });

  useEffect(() => {
    if (!enabled) return;
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const hasOverflow = el.scrollWidth > el.clientWidth;
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      setState({ hasOverflow, atStart, atEnd });
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [containerRef, enabled]);

  return state;
};
