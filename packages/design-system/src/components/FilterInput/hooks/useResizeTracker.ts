import { useEffect, useReducer } from 'react';

/**
 * Observes up to three elements with one ResizeObserver and returns a counter
 * that increments on every resize — use as a memo/effect dep to force
 * recompute when a tracked element changes size. Null entries are skipped.
 *
 * Observing a detached element is safe: ResizeObserver simply doesn't fire
 * until the element re-attaches and lays out, then resumes — no leak. We do
 * NOT filter detached nodes so re-attach is picked up without ref churn.
 */
export const useResizeTracker = (
  el1: HTMLElement | null,
  el2?: HTMLElement | null,
  el3?: HTMLElement | null,
): number => {
  const [tick, bump] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    const targets = [el1, el2, el3].filter((el): el is HTMLElement => el != null);
    if (targets.length === 0) return;
    const observer = new ResizeObserver(() => bump());
    for (const el of targets) observer.observe(el);
    return () => observer.disconnect();
  }, [el1, el2, el3]);

  return tick;
};
