import { useEffect, useReducer } from 'react';

/**
 * Observes up to three elements with a single ResizeObserver and returns a
 * counter that increments on every resize. Use it as a memo/effect dep to force
 * a recompute when any tracked element changes size — typical use is to keep a
 * floating UI (dropdown, tooltip) aligned with a target whose width depends on
 * dynamic content (e.g. text inside a chip segment).
 *
 * The first element is additionally watched with a MutationObserver
 * (childList + subtree). ResizeObserver alone misses sibling reflow caused by
 * adding/removing a child of the *same* size — the parent's outer box stays
 * put while inner items shift. Watching for DOM mutations on the host element
 * catches those cases too, so a floating UI anchored to a sibling reflows along.
 *
 * Null entries are skipped, so refs and conditionally rendered elements can be
 * passed directly without filtering.
 */
export const useResizeTracker = (
  el1: HTMLElement | null,
  el2?: HTMLElement | null,
  el3?: HTMLElement | null,
): number => {
  const [tick, bump] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    // Skip detached nodes — observing them would leak the observer and a
    // detached node's size never changes, so the observer would never fire.
    const targets = [el1, el2, el3].filter((el): el is HTMLElement => el != null && el.isConnected);
    if (targets.length === 0) return;
    const resizeObserver = new ResizeObserver(() => bump());
    for (const el of targets) resizeObserver.observe(el);

    // Watch the first (host-most) element for child add/remove — covers the
    // case where a sibling chip is removed and the anchor element shifts
    // without changing size.
    const mutationObserver = new MutationObserver(() => bump());
    mutationObserver.observe(targets[0]!, { childList: true, subtree: true });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [el1, el2, el3]);

  return tick;
};
