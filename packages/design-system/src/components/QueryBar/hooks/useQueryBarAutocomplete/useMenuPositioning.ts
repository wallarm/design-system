import type { RefObject } from 'react';
import { useCallback, useMemo, useRef } from 'react';

interface UseMenuPositioningOptions {
  containerRef: RefObject<HTMLElement | null>;
  buildingChipRef: RefObject<HTMLElement | null>;
  inputRef?: RefObject<HTMLElement | null>;
  isBuilding: boolean;
  insertIndex: number;
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
  insertIndex,
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

        // Determine anchor element rect: editing > building chip > input > container
        let anchorLeft = containerRect.left;
        let anchorTop = containerRect.top;
        let anchorBottom = containerRect.bottom;
        let anchorHeight = containerRect.height;

        if (editingOffsetRef.current !== null) {
          anchorLeft = containerRect.left + editingOffsetRef.current;
        } else if (isBuilding) {
          const chipRect = buildingChipRef.current?.getBoundingClientRect();
          if (chipRect) {
            anchorLeft = chipRect.left;
            anchorTop = chipRect.top;
            anchorBottom = chipRect.bottom;
            anchorHeight = chipRect.height;
          }
        } else if (inputRef?.current) {
          const inputRect = inputRef.current.getBoundingClientRect();
          anchorLeft = inputRect.left;
          anchorTop = inputRect.top;
          anchorBottom = inputRect.bottom;
          anchorHeight = inputRect.height;
        }

        // DOMRect-compatible shape required by Ark UI / zag.js positioning
        return {
          x: anchorLeft,
          y: anchorTop,
          width: containerRect.right - anchorLeft,
          height: anchorHeight,
          top: anchorTop,
          bottom: anchorBottom,
          left: anchorLeft,
          right: containerRect.right,
        };
      },
    }),
    // insertIndex forces recalculation when input moves between chips
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [containerRef, buildingChipRef, inputRef, isBuilding, insertIndex],
  );

  return { menuPositioning, setMenuOffset, resetMenuOffset };
};
