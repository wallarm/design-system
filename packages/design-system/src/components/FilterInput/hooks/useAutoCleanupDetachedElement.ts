import { useEffect } from 'react';

/**
 * Watches a captured DOM element and runs `onDetached` as soon as the element
 * leaves the document tree. Useful for state that stores a reference to a
 * conditionally rendered element (e.g. a clicked chip) — if the parent removes
 * the element via a controlled prop change while the state still holds it,
 * downstream consumers can otherwise read a stale rect from a detached node.
 *
 * The MutationObserver is scoped to `el.parentElement` (subtree+childList) so
 * unrelated mutations elsewhere on the page don't wake the callback. If the
 * parent itself is removed in the same tick `el.parentElement` is null and we
 * fall back to `documentElement` to keep the safety net.
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
    const root = el.parentElement ?? el.ownerDocument?.documentElement;
    if (!root) return;
    const observer = new MutationObserver(() => {
      if (!el.isConnected) onDetached();
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [el, onDetached]);
};
