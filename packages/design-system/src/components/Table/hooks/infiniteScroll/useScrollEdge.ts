import { type RefObject, useEffect, useRef } from 'react';
import { getScrollMetrics, SCROLL_EDGE_COOLDOWN_MS, type ScrollRoot } from '../../lib';

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
  /** `window` mode: the resolved scroll root (see `useWindowScrollRoot`) */
  scrollRoot?: ScrollRoot | null;
  /** The rows rendered; a change re-arms the edge (new rows, not loaders or row measuring) */
  itemCount?: number;
}

/**
 * Fires `onReached` once when the user scrolls within `threshold` px of the
 * given edge. Re-arms after scrolling back past the threshold, or once
 * `itemCount` changes (new rows): a jump straight to the new edge, such as
 * a scrollbar drag or End, never passes a point outside the threshold. A
 * cooldown guard prevents rapid re-fires when prepended/appended rows grow the
 * content.
 */
export const useScrollEdge = ({
  edge,
  mode,
  scrollRef,
  onReached,
  threshold,
  enabled = true,
  scrollRoot,
  itemCount,
}: UseScrollEdgeOptions) => {
  const firedRef = useRef(false);
  const firedCountRef = useRef(itemCount);
  const lastFiredAtRef = useRef(0);

  // Latest-callback ref: re-running the effect on identity changes races with
  // `firedRef` and fires twice per page.
  const onReachedRef = useRef(onReached);
  useEffect(() => {
    onReachedRef.current = onReached;
  });
  const enabledRef = useRef(enabled);
  const itemCountRef = useRef(itemCount);
  useEffect(() => {
    enabledRef.current = enabled;
    itemCountRef.current = itemCount;
  });

  useEffect(() => {
    const target = mode === 'window' ? scrollRoot : scrollRef?.current;
    if (!target) return;
    // A new target starts armed: the edge state of the previous one (e.g. the
    // window a pane host starts on, always "at the end") does not carry over.
    firedRef.current = false;

    const check = () => {
      const callback = onReachedRef.current;
      if (!callback || !enabledRef.current) return;

      const { scrollTop, clientHeight, scrollHeight } = getScrollMetrics(target);
      const distance = edge === 'start' ? scrollTop : scrollHeight - scrollTop - clientHeight;

      if (distance <= threshold) {
        const now = Date.now();
        if (firedRef.current && itemCountRef.current !== firedCountRef.current)
          firedRef.current = false;
        if (!firedRef.current && now - lastFiredAtRef.current >= SCROLL_EDGE_COOLDOWN_MS) {
          firedRef.current = true;
          firedCountRef.current = itemCountRef.current;
          lastFiredAtRef.current = now;
          callback();
        }
      } else {
        firedRef.current = false;
      }
    };

    // `enabled` is read via ref, so flipping it does not re-run this effect —
    // re-arming after the initial-anchor gate opens relies on the next scroll event.
    target.addEventListener('scroll', check, { passive: true });
    check();

    return () => {
      target.removeEventListener('scroll', check);
    };
  }, [edge, mode, scrollRef, scrollRoot, threshold]);
};
