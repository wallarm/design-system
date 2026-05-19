/**
 * True if element belongs to a FilterInput-owned menu overlay. Marked by
 * `data-filter-input-menu` on DropdownMenuContent — generic Ark UI selectors
 * are intentionally NOT used so blur handlers don't confuse unrelated page
 * popups (tenant switcher etc.) for FilterInput's own menu. AS-882.
 */
export const isMenuRelated = (el: HTMLElement | null): boolean =>
  !!el?.closest('[data-filter-input-menu]');

export interface AnchorBounds {
  top: number;
  bottom: number;
  left: number;
}

/** Extract anchor bounds from a DOMRect (right edge is computed at build time). */
export const toAnchorBounds = (rect: DOMRect): AnchorBounds => ({
  top: rect.top,
  bottom: rect.bottom,
  left: rect.left,
});

/**
 * Build a DOMRect-compatible object from the anchor's vertical bounds + left
 * edge; right edge stays at the container's right so the dropdown can expand
 * to full container width below the actual interaction target.
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
