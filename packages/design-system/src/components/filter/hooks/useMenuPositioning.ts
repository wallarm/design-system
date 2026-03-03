import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';

type MenuState = 'closed' | 'field' | 'operator' | 'value';

interface UseMenuPositioningOptions {
  containerRef: RefObject<HTMLElement | null>;
  buildingChipRef: RefObject<HTMLElement | null>;
  isBuilding: boolean;
  menuState: MenuState;
}

/**
 * Manages dropdown menu positioning relative to the active chip or input.
 * Computes a horizontal offset so the dropdown aligns with the building chip
 * or the clicked chip segment.
 */
export const useMenuPositioning = ({
  containerRef,
  buildingChipRef,
  isBuilding,
  menuState,
}: UseMenuPositioningOptions) => {
  const menuOffsetRef = useRef(0);

  const setMenuOffset = useCallback((offset: number) => {
    menuOffsetRef.current = offset;
  }, []);

  const resetMenuOffset = useCallback(() => {
    menuOffsetRef.current = 0;
  }, []);

  // After building chip renders, update offset to align dropdown with the chip
  useEffect(() => {
    if (isBuilding && menuState !== 'closed') {
      const containerRect = containerRef.current?.getBoundingClientRect();
      const chipRect = buildingChipRef.current?.getBoundingClientRect();
      if (containerRect && chipRect) {
        menuOffsetRef.current = chipRect.left - containerRect.left;
      }
    }
  });

  const menuPositioning = useMemo(() => ({
    placement: 'bottom-start' as const,
    gutter: 4,
    getAnchorRect: () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return null;
      return {
        x: rect.left + menuOffsetRef.current,
        y: rect.y,
        width: rect.width - menuOffsetRef.current,
        height: rect.height,
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left + menuOffsetRef.current,
        right: rect.right,
      };
    },
  }), [containerRef]);

  return { menuPositioning, setMenuOffset, resetMenuOffset };
};
