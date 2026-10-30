/**
 * Ref for a portaled popup's content (menu, select): puts its positioner above
 * the drawer that holds the rule builder. The popup layer is stacked below the
 * drawer (50 < 70), so it opened behind it and a click on an option hit the
 * drawer's backdrop. Set inline, so it does not depend on a stylesheet the
 * host may not load or may serve from cache.
 */
export const liftLayer = (el: HTMLElement | null): void => {
  el?.closest<HTMLElement>('[data-part="positioner"]')?.style.setProperty(
    'z-index',
    '1000',
    'important',
  );
};
