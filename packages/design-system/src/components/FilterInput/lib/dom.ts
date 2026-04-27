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

/**
 * Build a DOMRect-compatible object anchored vertically to the container
 * and horizontally to the given left position. Used by all FilterInput dropdowns
 * so they share the same vertical gap from the container bottom edge.
 */
export const buildContainerAnchoredRect = (
  containerRect: DOMRect,
  anchorLeft: number,
  anchorRight = containerRect.right,
) => ({
  x: anchorLeft,
  y: containerRect.top,
  width: anchorRight - anchorLeft,
  height: containerRect.height,
  top: containerRect.top,
  bottom: containerRect.bottom,
  left: anchorLeft,
  right: anchorRight,
});
