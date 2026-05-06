/**
 * Builds an `isHoverSyncTarget` predicate for a chart's hover-syncing surfaces.
 *
 * Without this guard, mouseLeave/blur handlers fire `setActive(null)` on every
 * row crossing — and the matching mouseEnter on the next sibling re-sets the
 * active key, but React commits the intermediate `null` frame first, flickering
 * popovers and dimmed series on every crossing.
 */
export const makeIsHoverSyncTarget = (slots: readonly string[]) => {
  const selector = slots.map(slot => `[data-slot="${slot}"]`).join(', ');
  return (target: EventTarget | null | undefined): boolean =>
    target instanceof Element && target.closest(selector) !== null;
};
