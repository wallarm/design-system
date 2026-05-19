import { useLayoutEffect } from 'react';

/**
 * Synchronously poke `floating-ui` (via @zag-js / Ark UI) to recompute the
 * position of any open floating element when the given dep changes.
 *
 * Why dispatch a window resize? floating-ui's `autoUpdate` listens for scroll
 * and element-resize events but NOT for sibling reflow — when an adjacent
 * element is removed and the anchor shifts laterally without its own size
 * changing, autoUpdate stays silent and the floating UI is left at the old
 * position for one paint cycle until React's normal effect chain catches up.
 *
 * Dispatching a synthetic `resize` event during the layout phase (before
 * paint) makes autoUpdate run `update()` synchronously, applying the new
 * coordinates in the same frame as the reflow. The hack is intentional:
 * floating-ui exposes no direct "reposition now" API at this layer.
 *
 * Must be `useLayoutEffect` — `useEffect` runs after paint, which is exactly
 * the lag this hook removes.
 */
export const useFloatingRecomputeOn = (dep: unknown): void => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: dep is intentionally generic
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new Event('resize'));
  }, [dep]);
};
