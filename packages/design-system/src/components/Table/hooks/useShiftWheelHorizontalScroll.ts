import { type RefObject, useEffect } from 'react';

/**
 * Shift + vertical wheel scrolls the container horizontally.
 *
 * Browsers disagree here: Chromium on Windows/Linux swaps the axes itself and
 * delivers `deltaX`, macOS browsers deliver a plain vertical `deltaY` with
 * `shiftKey` and scroll nothing. Only the latter shape is handled, so native
 * horizontal wheels, trackpads and axis-swapping browsers pass through
 * untouched and never double-scroll.
 *
 * A manual listener is used because React registers `wheel` as passive, and
 * a passive listener cannot `preventDefault` the page scroll.
 */
export const useShiftWheelHorizontalScroll = (ref: RefObject<HTMLElement | null>): void => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!e.shiftKey || e.deltaX !== 0 || e.deltaY === 0) return;
      if (el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [ref]);
};
