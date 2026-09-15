import { type RefObject, useEffect } from 'react';

/**
 * Wheel-driven horizontal scrolling for the table viewport.
 *
 * Shift + vertical wheel scrolls horizontally in every mode. Browsers disagree
 * here: Chromium on Windows/Linux swaps the axes itself and delivers `deltaX`,
 * macOS browsers deliver a plain vertical `deltaY` with `shiftKey` and scroll
 * nothing. Only the latter shape is treated as a shift-scroll, so
 * axis-swapping browsers never double-scroll.
 *
 * With `mirrorRef` (window mode, where the header lives in its own clipped
 * scroller) native horizontal wheel/trackpad deltas are applied here as well
 * and written to both scrollers in the same frame. Left to the browser, the
 * body scrolls on the compositor thread and a header mirrored from `scroll`
 * events trails it by a frame — visibly, during a trackpad swipe.
 *
 * A manual listener is used because React registers `wheel` as passive, and
 * a passive listener cannot `preventDefault` the page scroll.
 */
export const useWheelHorizontalScroll = (
  ref: RefObject<HTMLElement | null>,
  mirrorRef?: RefObject<HTMLElement | null>,
): void => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      const shiftScroll = e.shiftKey && e.deltaX === 0 && e.deltaY !== 0;
      // Predominantly horizontal only, so a diagonal trackpad gesture keeps
      // scrolling the page vertically.
      const nativeHorizontal = !!mirrorRef && Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!shiftScroll && !nativeHorizontal) return;
      const delta = (shiftScroll ? e.deltaY : e.deltaX) * (e.deltaMode === 1 ? LINE_PX : 1);
      const next = Math.max(0, Math.min(el.scrollLeft + delta, el.scrollWidth - el.clientWidth));
      if (next === el.scrollLeft) return;
      e.preventDefault();
      el.scrollLeft = next;
      if (mirrorRef?.current) mirrorRef.current.scrollLeft = next;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [ref, mirrorRef]);
};

// Firefox reports mouse-wheel deltas in lines on some platforms.
const LINE_PX = 16;
