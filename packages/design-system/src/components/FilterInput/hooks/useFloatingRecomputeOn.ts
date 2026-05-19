import { useLayoutEffect } from 'react';

/**
 * Pokes floating-ui (via @zag-js / Ark UI) to recompute when `dep` changes.
 * Dispatches a synthetic resize in the layout phase: floating-ui's autoUpdate
 * listens for resize but NOT sibling reflow, so a laterally-shifting anchor
 * would lag one paint. Must be useLayoutEffect — useEffect runs after paint.
 */
export const useFloatingRecomputeOn = (dep: unknown): void => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: dep is intentionally generic
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new Event('resize'));
  }, [dep]);
};
