import { useEffect } from 'react';

/**
 * Watches a captured DOM element and runs `onDetached` as soon as the element
 * leaves the document tree. Useful for state that stores a reference to a
 * conditionally rendered element (e.g. a clicked chip) — if the parent removes
 * the element via a controlled prop change while the state still holds it,
 * downstream consumers can otherwise read a stale rect from a detached node.
 *
 * The effect runs on every render with no deps so transitions to "detached"
 * are caught regardless of which prop change triggered them. The callback
 * is expected to be cheap and idempotent (typically setState(null)).
 */
export const useAutoCleanupDetachedElement = (
  el: HTMLElement | null,
  onDetached: () => void,
): void => {
  useEffect(() => {
    if (el && !el.isConnected) onDetached();
  });
};
