/** Check if an element belongs to a menu/portal overlay (dropdown, date-picker, etc.) */
export const isMenuRelated = (el: HTMLElement | null): boolean =>
  !!(
    el?.closest('[role="menu"]') ||
    el?.closest('[data-scope="menu"]') ||
    el?.closest('[data-scope="date-picker"]') ||
    el?.closest('[data-part="content"]')
  );
