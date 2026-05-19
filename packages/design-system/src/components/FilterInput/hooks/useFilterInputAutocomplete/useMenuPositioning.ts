import type { RefObject } from 'react';
import { useCallback, useState } from 'react';
import { type AnchorBounds, toAnchorBounds } from '../../lib';
import { useAutoCleanupDetachedElement } from '../useAutoCleanupDetachedElement';
import { useFilterInputPositioning } from '../useFilterInputPositioning';
import { useFloatingRecomputeOn } from '../useFloatingRecomputeOn';
import { useResizeTracker } from '../useResizeTracker';

interface UseMenuPositioningOptions {
  containerRef: RefObject<HTMLElement | null>;
  buildingChipRef: RefObject<HTMLElement | null>;
  inputRef?: RefObject<HTMLElement | null>;
  isBuilding: boolean;
  insertIndex: number;
  /** Committed chip count — recompute trigger for sibling reflow (ResizeObserver
   *  misses it; without this the dropdown sticks at the old position). */
  chipsCount: number;
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
 * Three signal sources keep Ark UI in sync with the live anchor:
 *   - `useResizeTracker` — width changes inside a segment as the user types.
 *   - `useFloatingRecomputeOn(chipsCount)` — sibling reflow when chips are
 *     added/removed (no element resized, so the resize observer is silent).
 *   - `useAutoCleanupDetachedElement` — drops the captured anchor as soon as
 *     its DOM node leaves the tree (e.g. controlled-value prop removed it).
 */
export const useMenuPositioning = ({
  containerRef,
  buildingChipRef,
  inputRef,
  isBuilding,
  insertIndex,
  chipsCount,
}: UseMenuPositioningOptions) => {
  const [editingEl, setMenuAnchor] = useState<HTMLElement | null>(null);
  const resetMenuAnchor = useCallback(() => setMenuAnchor(null), []);

  useAutoCleanupDetachedElement(editingEl, resetMenuAnchor);
  useFloatingRecomputeOn(chipsCount);

  const tick = useResizeTracker(editingEl, buildingChipRef.current, containerRef.current);

  // biome-ignore lint/correctness/useExhaustiveDependencies: tick is a force-recompute dep
  const getAnchorBounds = useCallback(
    (containerRect: DOMRect): AnchorBounds => {
      // isConnected guards a parent that reordered/removed the chip via the
      // controlled value prop — detached editingEl returns zero rect.
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
    // Recompute on insertIndex change or chip count change (sibling reflow
    // shifts positions without resizing — ResizeObserver alone misses it).
    [insertIndex, chipsCount],
  );

  return { menuPositioning, setMenuAnchor, resetMenuAnchor };
};
