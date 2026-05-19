import type { RefObject } from 'react';
import { useCallback, useRef, useState } from 'react';
import { type AnchorBounds, QUERY_BAR_SELECTOR, toAnchorBounds } from '../../lib';
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
  /** Menu is currently visible — gates the synthetic resize so a chip add/remove
   *  while the menu is closed doesn't wake page-wide resize listeners. */
  isMenuOpen: boolean;
}

/**
 * Manages dropdown menu positioning relative to the active chip / segment / input.
 *
 * Anchor resolution (highest priority first):
 *   1. Explicit element passed via `setMenuAnchor` — set when a chip segment is
 *      clicked, including the Backspace cascade.
 *   2. Building chip ref (for operator/value menus while a chip is being built).
 *   3. Input ref — only when chips are already committed (the input has shifted
 *      past them, so the dropdown follows the input's live position).
 *   4. Container rect — the empty/initial state, flush with the field's border.
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
  isMenuOpen,
}: UseMenuPositioningOptions) => {
  const [editingEl, setMenuAnchor] = useState<HTMLElement | null>(null);
  const resetMenuAnchor = useCallback(() => setMenuAnchor(null), []);

  useAutoCleanupDetachedElement(editingEl, resetMenuAnchor);
  useFloatingRecomputeOn(chipsCount, isMenuOpen);

  const tick = useResizeTracker(editingEl, buildingChipRef.current, containerRef.current);

  // Ark UI / zag.js captures `getAnchorRect` on first menu attach and reuses
  // it across repositions — closures of reactive state would go stale.
  // Read everything dynamic through this ref so the function stays stable.
  const anchorStateRef = useRef({ editingEl, isBuilding, chipsCount });
  anchorStateRef.current = { editingEl, isBuilding, chipsCount };

  // +8 added to anchor.bottom in the chip-anchored branches: positioning.gutter
  // alone can't switch reactively (Ark UI captures it once), but getAnchorRect
  // is re-read on every reposition, so this is where the dynamic gap lives.
  const CHIP_GUTTER_OFFSET = 8;

  const getAnchorBounds = useCallback(
    (containerRect: DOMRect): AnchorBounds => {
      const { editingEl: el, isBuilding: building, chipsCount: count } = anchorStateRef.current;
      // isConnected guards a parent that reordered/removed the chip via the
      // controlled value prop — detached el returns zero rect.
      // Anchor (both axes) is the chip/input the user is interacting with so
      // the dropdown sits flush below it — important on multi-row layouts where
      // a chip on the first row must not anchor to the field's bottom edge.
      const chipAnchor: AnchorBounds | null = el?.isConnected
        ? toAnchorBounds(el.getBoundingClientRect())
        : building && buildingChipRef.current
          ? toAnchorBounds(buildingChipRef.current.getBoundingClientRect())
          : count > 0 && inputRef?.current
            ? toAnchorBounds(inputRef.current.getBoundingClientRect())
            : null;
      if (chipAnchor) {
        return { ...chipAnchor, bottom: chipAnchor.bottom + CHIP_GUTTER_OFFSET };
      }
      // No chips, no editing — anchor to the bordered field so the dropdown is
      // flush with its border. The outer container may extend past the field
      // (error rows below), so resolve the field explicitly.
      const fieldEl = containerRef.current?.querySelector<HTMLElement>(QUERY_BAR_SELECTOR) ?? null;
      return toAnchorBounds(fieldEl?.getBoundingClientRect() ?? containerRect);
    },
    [containerRef, buildingChipRef, inputRef],
  );

  // Effective vertical gap: 4px in the empty state, 12px from a chip / input.
  // Ark UI captures `positioning.gutter` on first mount and ignores later prop
  // changes, so the +8 chip offset is baked into anchor.bottom inside
  // getAnchorBounds above (read on every reposition via getAnchorRect).
  const menuPositioning = useFilterInputPositioning(
    { containerRef, getAnchorBounds, gutter: 4 },
    // Recompute on insertIndex change, chip count change, or any tracked
    // element resize — these shift positions without firing window resize.
    [insertIndex, chipsCount, tick],
  );

  return { menuPositioning, setMenuAnchor, resetMenuAnchor };
};
