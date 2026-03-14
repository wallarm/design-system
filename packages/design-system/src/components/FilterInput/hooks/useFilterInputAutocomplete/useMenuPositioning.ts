import type { RefObject } from 'react';
import { useCallback, useRef } from 'react';
import { useFilterInputPositioning } from '../useFilterInputPositioning';

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

  // Determine horizontal anchor: editing > building chip > input > container
  const getAnchorLeft = useCallback(
    (containerRect: DOMRect) => {
      if (editingOffsetRef.current !== null) {
        return containerRect.left + editingOffsetRef.current;
      }
      if (isBuilding) {
        const chipRect = buildingChipRef.current?.getBoundingClientRect();
        if (chipRect) return chipRect.left;
      }
      if (inputRef?.current) {
        return inputRef.current.getBoundingClientRect().left;
      }
      return containerRect.left;
    },
    [isBuilding, buildingChipRef, inputRef],
  );

  const menuPositioning = useFilterInputPositioning(
    { containerRef, getAnchorLeft },
    // insertIndex forces recalculation when input moves between chips
    [insertIndex],
  );

  return { menuPositioning, setMenuOffset, resetMenuOffset };
};
