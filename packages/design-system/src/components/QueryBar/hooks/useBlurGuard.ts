import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

interface UseBlurGuardOptions {
  containerRef: RefObject<HTMLElement | null>;
}

/**
 * Tracks pointer interactions with menu portals and container element
 * to prevent blur handlers from closing menus during click interactions.
 *
 * The flag stays active for 300ms (longer than the 200ms blur handler delay)
 * so the blur handler still sees it after pointerup fires.
 */
export const useBlurGuard = ({ containerRef }: UseBlurGuardOptions) => {
  const isPointerInMenuRef = useRef(false);

  useEffect(() => {
    let resetTimer: ReturnType<typeof setTimeout>;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const inMenu = target.closest('[data-scope="menu"]');
      const inContainer = containerRef.current?.contains(target);

      if (inMenu || inContainer) {
        clearTimeout(resetTimer);
        isPointerInMenuRef.current = true;
        resetTimer = setTimeout(() => {
          isPointerInMenuRef.current = false;
        }, 300);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      clearTimeout(resetTimer);
    };
  }, [containerRef]);

  return isPointerInMenuRef;
};
