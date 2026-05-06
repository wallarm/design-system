import { type RefObject, useEffect } from 'react';

/**
 * Pending-phase listeners for the zoom confirm popover. Runs while `enabled`
 * is `true` (i.e. a pending range exists):
 *
 * - Mousedown outside the popover dismisses the pending range. `mousedown`
 *   rather than `click` so a fresh drag (which starts on the chart body's
 *   `mousedown`) sees an already-cleared pending state.
 * - Enter confirms, Escape cancels. Scope is gated to events whose target is
 *   inside `rootRef`, inside `popoverRef` (portalled), or ambient (focus on
 *   `<body>` / `<html>`). The ref-based scope is load-bearing: a generic
 *   `closest('[data-slot="line-chart"]')` selector would let sibling charts
 *   confirm a pending range that does not belong to them.
 */
export const useZoomPendingListeners = ({
  enabled,
  rootRef,
  popoverRef,
  onConfirm,
  onCancel,
}: {
  enabled: boolean;
  rootRef: RefObject<HTMLElement | null> | undefined;
  popoverRef: RefObject<HTMLElement | null>;
  onConfirm?: () => void;
  onCancel?: () => void;
}): void => {
  useEffect(() => {
    if (!enabled) return;
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Node && popoverRef.current?.contains(target)) return;
      onCancel?.();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== 'Escape') return;
      const target = event.target;
      const isAmbient =
        target === null || target === document.body || target === document.documentElement;
      const isInPopover = target instanceof Node && (popoverRef.current?.contains(target) ?? false);
      const isInOwningChart =
        target instanceof Node && (rootRef?.current?.contains(target) ?? false);
      if (!isAmbient && !isInPopover && !isInOwningChart) return;
      event.preventDefault();
      if (event.key === 'Enter') onConfirm?.();
      else onCancel?.();
    };
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKey);
    };
  }, [enabled, rootRef, popoverRef, onConfirm, onCancel]);
};
