import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';

type MenuState = 'closed' | 'field' | 'operator' | 'value';

interface UseMenuPositioningOptions {
  containerRef: RefObject<HTMLElement | null>;
  buildingChipRef: RefObject<HTMLElement | null>;
  inputRef?: RefObject<HTMLElement | null>;
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
  inputRef,
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

  // After building chip renders, update offset to align dropdown with the chip.
  // When no building chip (field menu for new condition), align with the input.
  useEffect(() => {
    if (menuState === 'closed') return;
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    if (isBuilding) {
      const chipRect = buildingChipRef.current?.getBoundingClientRect();
      if (chipRect) {
        menuOffsetRef.current = chipRect.left - containerRect.left;
      }
    } else if (menuState === 'field' && inputRef?.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      menuOffsetRef.current = inputRect.left - containerRect.left;
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
