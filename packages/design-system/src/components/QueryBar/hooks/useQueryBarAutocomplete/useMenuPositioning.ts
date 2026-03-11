import type { RefObject } from 'react';
import { useCallback, useMemo, useRef } from 'react';
import type { MenuState } from '../../types';

interface UseMenuPositioningOptions {
  containerRef: RefObject<HTMLElement | null>;
  buildingChipRef: RefObject<HTMLElement | null>;
  inputRef?: RefObject<HTMLElement | null>;
  isBuilding: boolean;
  menuState: MenuState;
}

/**
 * Manages dropdown menu positioning relative to the active chip or input.
 * Computes a horizontal offset lazily in getAnchorRect so the dropdown aligns with:
 * - The input element (when selecting a field, before building chip exists)
 * - The building chip (when selecting operator/value during chip creation)
 * - The clicked chip segment (when editing — offset set externally via setMenuOffset)
 */
export const useMenuPositioning = ({
  containerRef,
  buildingChipRef,
  inputRef,
  isBuilding,
  menuState,
}: UseMenuPositioningOptions) => {
  // Explicit offset set by chip editing (absolute left relative to container)
  const editingOffsetRef = useRef<number | null>(null);

  const setMenuOffset = useCallback((offset: number) => {
    editingOffsetRef.current = offset;
  }, []);

  const resetMenuOffset = useCallback(() => {
    editingOffsetRef.current = null;
  }, []);

  const menuPositioning = useMemo(
    () => ({
      placement: 'bottom-start' as const,
      gutter: 4,
      getAnchorRect: () => {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return null;

        // Determine horizontal offset: editing > building chip > input > 0
        let offset = 0;
        if (editingOffsetRef.current !== null) {
          offset = editingOffsetRef.current;
        } else if (isBuilding) {
          const chipRect = buildingChipRef.current?.getBoundingClientRect();
          if (chipRect) offset = chipRect.left - containerRect.left;
        } else if (menuState === 'field' && inputRef?.current) {
          const inputRect = inputRef.current.getBoundingClientRect();
          offset = inputRect.left - containerRect.left;
        }

        return {
          x: containerRect.left + offset,
          y: containerRect.y,
          width: containerRect.width - offset,
          height: containerRect.height,
          top: containerRect.top,
          bottom: containerRect.bottom,
          left: containerRect.left + offset,
          right: containerRect.right,
        };
      },
    }),
    [containerRef, buildingChipRef, inputRef, isBuilding, menuState],
  );

  return { menuPositioning, setMenuOffset, resetMenuOffset };
};
