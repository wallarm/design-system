import { useEffect } from 'react';

/**
 * Watches a captured DOM element and runs `onDetached` as soon as the element
 * leaves the document tree. Useful for state that stores a reference to a
 * conditionally rendered element (e.g. a clicked chip) — if the parent removes
 * the element via a controlled prop change while the state still holds it,
 * downstream consumers can otherwise read a stale rect from a detached node.
 *
 * Detection is via a MutationObserver on documentElement (subtree childList),
 * so detachment caused by any reconciliation is caught synchronously after
 * commit — without re-running on every parent render.
 */
export const useAutoCleanupDetachedElement = (
  el: HTMLElement | null,
  onDetached: () => void,
): void => {
  useEffect(() => {
    if (!el) return;
    if (!el.isConnected) {
      onDetached();
      return;
    }
    if (typeof MutationObserver === 'undefined') return;
    const root = el.ownerDocument?.documentElement;
    if (!root) return;
    const observer = new MutationObserver(() => {
      if (!el.isConnected) onDetached();
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [el, onDetached]);
};
