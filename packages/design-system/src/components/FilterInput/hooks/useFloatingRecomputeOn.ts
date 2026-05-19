import { useLayoutEffect, useRef } from 'react';

/**
 * Pokes floating-ui (via @zag-js / Ark UI) to recompute when `dep` changes.
 * floating-ui's autoUpdate listens for resize/scroll but not sibling reflow,
 * so a laterally-shifting anchor would lag one paint. Must be useLayoutEffect
 * — useEffect runs after paint.
 *
 * Two scoping rules:
 * - `enabled = false` short-circuits entirely (no event while menu closed).
 * - First mount is skipped (no transition has occurred yet).
 *
 * The dispatch is still a global `resize` (autoUpdate's only listener) — keep
 * dep-change rate low at the call site.
 */
export const useFloatingRecomputeOn = (dep: unknown, enabled = true): void => {
  const prevDepRef = useRef<unknown>(dep);
  useLayoutEffect(() => {
    if (!enabled) {
      prevDepRef.current = dep;
      return;
    }
    if (typeof window === 'undefined') return;
    if (Object.is(prevDepRef.current, dep)) return;
    prevDepRef.current = dep;
    window.dispatchEvent(new Event('resize'));
  }, [dep, enabled]);
};
