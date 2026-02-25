import { type RefObject, useEffect, useRef } from 'react';
import { TABLE_END_REACHED_THRESHOLD } from '../lib';

type ScrollMode = 'container' | 'window';

/** Minimum time (ms) between successive `onEndReached` calls. */
const COOLDOWN_MS = 200;

interface UseEndReachedOptions {
  mode: ScrollMode;
  /** Scroll element ref — required for `container` mode */
  scrollRef?: RefObject<HTMLElement | null>;
  onEndReached?: () => void;
  threshold?: number;
}

/**
 * Fires `onEndReached` once when the user scrolls within `threshold` px
 * of the bottom. Re-arms automatically after the user scrolls back up
 * past the threshold or when the scroll height grows (new data loaded).
 *
 * A cooldown guard prevents rapid re-fires that can occur when new rows
 * are appended (scrollHeight grows → firedRef resets → still at bottom).
 */
export function useEndReached({
  mode,
  scrollRef,
  onEndReached,
  threshold = TABLE_END_REACHED_THRESHOLD,
}: UseEndReachedOptions) {
  const firedRef = useRef(false);
  const lastFiredAtRef = useRef(0);

  useEffect(() => {
    if (!onEndReached) return;

    const check = () => {
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

      const distanceToBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceToBottom <= threshold) {
        const now = Date.now();
        if (!firedRef.current && now - lastFiredAtRef.current >= COOLDOWN_MS) {
          firedRef.current = true;
          lastFiredAtRef.current = now;
          onEndReached();
        }
      } else {
        firedRef.current = false;
      }
    };

    const target = mode === 'window' ? window : scrollRef?.current;
    if (!target) return;

    target.addEventListener('scroll', check, { passive: true });
    // Check immediately in case already at the bottom
    check();

    return () => {
      target.removeEventListener('scroll', check);
    };
  }, [mode, scrollRef, onEndReached, threshold]);
}
