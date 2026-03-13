/** Check if an element belongs to a menu/portal overlay (dropdown, date-picker, etc.) */
export const isMenuRelated = (el: HTMLElement | null): boolean =>
  !!(
    el?.closest('[role="menu"]') ||
    el?.closest('[data-scope="menu"]') ||
    el?.closest('[data-scope="date-picker"]') ||
    el?.closest('[data-part="content"]')
  );

/**
 * Build a DOMRect-compatible object anchored vertically to the container
 * and horizontally to the given left position. Used by all QueryBar dropdowns
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
