import type { RefObject } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { type AnchorBounds, toAnchorBounds } from '../../lib';
import { useFilterInputPositioning } from '../useFilterInputPositioning';
import { useResizeTracker } from '../useResizeTracker';

interface UseMenuPositioningOptions {
  containerRef: RefObject<HTMLElement | null>;
  buildingChipRef: RefObject<HTMLElement | null>;
  inputRef?: RefObject<HTMLElement | null>;
  isBuilding: boolean;
  insertIndex: number;
}

/**
 * Manages dropdown menu positioning relative to the active chip / segment / input.
 *
 * Anchor resolution (highest priority first):
 *   1. Explicit element passed via `setMenuAnchor` — set when a chip segment is
 *      clicked, including the Backspace cascade.
 *   2. Building chip ref (for operator/value menus while a chip is being built).
 *   3. Input ref (for the field menu, before a chip exists).
 *   4. Container rect (fallback).
 *
 * The active element is observed by `useResizeTracker` so when its width
 * changes — typing in a segment, segments swapping during cascade — the menu
 * follows. The tick is part of `getAnchorBounds` deps, forcing Ark UI to
 * recompute the floating position.
 */
export const useMenuPositioning = ({
  containerRef,
  buildingChipRef,
  inputRef,
  isBuilding,
  insertIndex,
}: UseMenuPositioningOptions) => {
  const [editingEl, setMenuAnchor] = useState<HTMLElement | null>(null);
  const resetMenuAnchor = useCallback(() => setMenuAnchor(null), []);

  // Auto-clear the captured anchor as soon as its DOM node leaves the tree.
  // This catches paths where a chip is removed (Clear button, last Backspace
  // cascade, controlled-value prop change) but the anchor reset is missed —
  // without this the dropdown would keep aligning to a stale chip rect on the
  // next menu open instead of falling through to the input/container anchor.
  useEffect(() => {
    if (editingEl && !editingEl.isConnected) setMenuAnchor(null);
  });

  const tick = useResizeTracker(editingEl, buildingChipRef.current, containerRef.current);

  // biome-ignore lint/correctness/useExhaustiveDependencies: tick is a force-recompute dep
  const getAnchorBounds = useCallback(
    (containerRect: DOMRect): AnchorBounds => {
      // `isConnected` guards against a parent reordering / removing the chip
      // via the controlled `value` prop while inline-edit is active —
      // `editingEl` would still be truthy but point at a detached node, and
      // `getBoundingClientRect()` on a detached node returns all-zeroes.
      if (editingEl?.isConnected) return toAnchorBounds(editingEl.getBoundingClientRect());
      if (isBuilding && buildingChipRef.current) {
        return toAnchorBounds(buildingChipRef.current.getBoundingClientRect());
      }
      if (inputRef?.current) return toAnchorBounds(inputRef.current.getBoundingClientRect());
      return toAnchorBounds(containerRect);
    },
    [editingEl, isBuilding, buildingChipRef, inputRef, tick],
  );

  const menuPositioning = useFilterInputPositioning(
    { containerRef, getAnchorBounds },
    // insertIndex forces recalculation when input moves between chips
    [insertIndex],
  );

  return { menuPositioning, setMenuAnchor, resetMenuAnchor };
};
