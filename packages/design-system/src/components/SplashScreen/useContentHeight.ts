import { type RefObject, useEffect, useRef, useState } from 'react';

/**
 * Measures the height of an element with ResizeObserver, with optional locking
 * during animations to prevent mid-animation jumps.
 *
 * When locked=true, stores the first measured height and ignores subsequent
 * updates until locked becomes false. This prevents viewport/content resizes
 * from disrupting the shrink animation.
 *
 * The measured height is capped by viewport height minus a margin to ensure
 * content fits on small screens.
 */
export const useContentHeight = (
  elementRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  locked: boolean,
): number | undefined => {
  const [height, setHeight] = useState<number | undefined>(undefined);
  const lockedHeightRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const updateHeight = () => {
      // Don't update during animation if we already have a locked value
      if (locked && lockedHeightRef.current !== undefined) {
        return;
      }

      if (elementRef.current) {
        const measured = elementRef.current.offsetHeight;
        const maxHeight = window.innerHeight - 40; // viewport margin
        const newHeight = Math.min(measured, maxHeight);
        setHeight(newHeight);

        // Lock the first measurement during animation
        if (locked) {
          lockedHeightRef.current = newHeight;
        }
      }
    };

    const observer = new ResizeObserver(updateHeight);
    observer.observe(elementRef.current);
    updateHeight(); // Initial measurement

    return () => observer.disconnect();
  }, [elementRef, enabled, locked]);

  // Reset lock when animation completes (locked becomes false)
  useEffect(() => {
    if (!locked) {
      lockedHeightRef.current = undefined;
    }
  }, [locked]);

  return height;
};
