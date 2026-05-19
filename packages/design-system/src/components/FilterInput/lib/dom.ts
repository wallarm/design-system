/**
 * Check if an element belongs to a FilterInput-owned menu/portal overlay.
 *
 * Menus are marked with `data-filter-input-menu` on their `DropdownMenuContent`
 * root. Generic Ark UI selectors (`[role="menu"]`, `[data-part="content"]`,
 * `[data-scope="date-picker"]`) intentionally DO NOT match — otherwise blur
 * handlers mistake unrelated page popups (tenant switcher, other dropdowns)
 * for FilterInput's own menu and refuse to close. See AS-882.
 */
export const isMenuRelated = (el: HTMLElement | null): boolean =>
  !!el?.closest('[data-filter-input-menu]');

export interface AnchorBounds {
  top: number;
  bottom: number;
  left: number;
}

/**
 * Build a DOMRect-compatible object from the active anchor element's vertical
 * bounds and left edge, keeping the right edge at the container's right so the
 * dropdown can still expand to the full container width. Used by all FilterInput
 * dropdowns so they sit flush below the element the user is interacting with
 * (chip segment, building chip or input) rather than below the whole container.
 */
export const buildAnchoredRect = (
  anchor: AnchorBounds,
  containerRect: DOMRect,
  anchorRight = containerRect.right,
) => ({
  x: anchor.left,
  y: anchor.top,
  width: anchorRight - anchor.left,
  height: anchor.bottom - anchor.top,
  top: anchor.top,
  bottom: anchor.bottom,
  left: anchor.left,
  right: anchorRight,
});
