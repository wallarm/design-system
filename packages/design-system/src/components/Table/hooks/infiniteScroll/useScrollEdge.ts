import { type RefObject, useEffect, useRef } from 'react';
import { SCROLL_EDGE_COOLDOWN_MS } from '../../lib';

type ScrollMode = 'container' | 'window';
type ScrollEdge = 'start' | 'end';

interface UseScrollEdgeOptions {
  edge: ScrollEdge;
  mode: ScrollMode;
  /** Scroll element ref — required for `container` mode */
  scrollRef?: RefObject<HTMLElement | null>;
  onReached?: () => void;
  threshold: number;
  /** When false, suppresses firing (e.g. while the initial anchor scroll settles) */
  enabled?: boolean;
}

/**
 * Fires `onReached` once when the user scrolls within `threshold` px of the
 * given edge. Re-arms after scrolling back past the threshold. A cooldown
 * guard prevents rapid re-fires when prepended/appended rows grow the content.
 */
export const useScrollEdge = ({
  edge,
  mode,
  scrollRef,
  onReached,
  threshold,
  enabled = true,
}: UseScrollEdgeOptions) => {
  const firedRef = useRef(false);
  const lastFiredAtRef = useRef(0);

  // Latest-callback ref: re-running the effect on identity changes races with
  // `firedRef` and fires twice per page.
  const onReachedRef = useRef(onReached);
  useEffect(() => {
    onReachedRef.current = onReached;
  });
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  });

  useEffect(() => {
    const check = () => {
      const callback = onReachedRef.current;
      if (!callback || !enabledRef.current) return;

      let scrollTop: number;
      let clientHeight: number;
      let scrollHeight: number;

      if (mode === 'window') {
        scrollTop = window.scrollY;
        clientHeight = window.innerHeight;
        scrollHeight = document.documentElement.scrollHeight;
      } else {
        const el = scrollRef?.current;
        if (!el) return;
        scrollTop = el.scrollTop;
        clientHeight = el.clientHeight;
        scrollHeight = el.scrollHeight;
      }

      const distance = edge === 'start' ? scrollTop : scrollHeight - scrollTop - clientHeight;

      if (distance <= threshold) {
        const now = Date.now();
        if (!firedRef.current && now - lastFiredAtRef.current >= SCROLL_EDGE_COOLDOWN_MS) {
          firedRef.current = true;
          lastFiredAtRef.current = now;
          callback();
        }
      } else {
        firedRef.current = false;
      }
    };

    const target = mode === 'window' ? window : scrollRef?.current;
    if (!target) return;

    // `enabled` is read via ref, so flipping it does not re-run this effect —
    // re-arming after the initial-anchor gate opens relies on the next scroll event.
    target.addEventListener('scroll', check, { passive: true });
    check();

    return () => {
      target.removeEventListener('scroll', check);
    };
  }, [edge, mode, scrollRef, threshold]);
};
