import { useCallback, useEffect, useState } from 'react';
import type {
  LineChartDatum,
  LineChartZoomDragState,
  LineChartZoomPendingState,
  LineChartZoomRange,
} from '../LineChartContext';
import { useZoomDragListeners } from './useZoomDragListeners';

interface UseLineChartZoomStateResult {
  enabled: boolean;
  drag: LineChartZoomDragState | null;
  pending: LineChartZoomPendingState | null;
  registerEnabled: () => () => void;
  startDrag: (index: number, clientX: number, clientY: number) => void;
  updateDrag: (index: number, clientX: number, clientY: number) => void;
  endDrag: () => void;
  cancelDrag: () => void;
  confirmZoom: () => void;
  cancelPending: () => void;
}

/**
 * Two-phase zoom selection state machine.
 *
 * - `drag` is the live mouse-held selection — updated on every mousemove,
 *   torn down on Escape, promoted to `pending` on mouseup.
 * - `pending` is the released-but-unconfirmed selection — renders the confirm
 *   popover. Commits via `confirmZoom` (fires `onZoomChange`) or dismisses via
 *   `cancelPending` (no emit).
 *
 * `enabledCount` (not a boolean) so multiple brush instances can't race when
 * one unmounts while another remains. Window-level listeners are wired up by
 * `useZoomDragListeners` so the popover keeps tracking when the cursor leaves
 * the SVG and a mouseup outside the chart still releases into pending.
 *
 * Dataset changes invalidate cached indices on both `drag` and `pending`, so
 * both reset whenever `data` or `xKey` flips — otherwise a stale range could
 * be committed against a refreshed dataset.
 */
export const useLineChartZoomState = ({
  data,
  xKey,
  onZoomChange,
}: {
  data: LineChartDatum[];
  xKey: string;
  onZoomChange: ((range: LineChartZoomRange | null) => void) | undefined;
}): UseLineChartZoomStateResult => {
  const [zoomEnabledCount, setZoomEnabledCount] = useState(0);
  const [zoomDrag, setZoomDrag] = useState<LineChartZoomDragState | null>(null);
  const [zoomPending, setZoomPending] = useState<LineChartZoomPendingState | null>(null);

  const registerEnabled = useCallback(() => {
    setZoomEnabledCount(n => n + 1);
    return () => setZoomEnabledCount(n => n - 1);
  }, []);

  // A new drag implicitly discards any prior unconfirmed pending range.
  const startDrag = useCallback((index: number, clientX: number, clientY: number) => {
    setZoomPending(null);
    setZoomDrag({ startIndex: index, endIndex: index, clientX, clientY });
  }, []);

  const updateDrag = useCallback((index: number, clientX: number, clientY: number) => {
    setZoomDrag(prev => {
      if (!prev) return null;
      if (prev.endIndex === index && prev.clientX === clientX && prev.clientY === clientY) {
        return prev;
      }
      return { startIndex: prev.startIndex, endIndex: index, clientX, clientY };
    });
  }, []);

  const cancelDrag = useCallback(() => {
    setZoomDrag(null);
  }, []);

  // Releases drag → pending without emitting onZoomChange (user still confirms
  // via the popover). Single-index drags (plain clicks) are dropped to avoid
  // surfacing a popover for a zero-width range.
  const endDrag = useCallback(() => {
    setZoomDrag(currentDrag => {
      if (!currentDrag) return null;
      const lo = Math.min(currentDrag.startIndex, currentDrag.endIndex);
      const hi = Math.max(currentDrag.startIndex, currentDrag.endIndex);
      if (lo === hi) return null;
      const fromDatum = data[lo];
      const toDatum = data[hi];
      const from = fromDatum?.[xKey];
      const to = toDatum?.[xKey];
      if (from != null && to != null) {
        setZoomPending({
          range: { fromIndex: lo, toIndex: hi, from, to },
          clientX: currentDrag.clientX,
          clientY: currentDrag.clientY,
        });
      }
      return null;
    });
  }, [data, xKey]);

  const confirmZoom = useCallback(() => {
    setZoomPending(currentPending => {
      if (currentPending) onZoomChange?.(currentPending.range);
      return null;
    });
  }, [onZoomChange]);

  const cancelPending = useCallback(() => {
    setZoomPending(null);
  }, []);

  // Dataset changes invalidate cached indices on `pending` and `drag`; reset
  // both so a stale range can't be committed against a refreshed dataset.
  // biome-ignore lint/correctness/useExhaustiveDependencies: data/xKey are triggers, not read inside
  useEffect(() => {
    setZoomDrag(null);
    setZoomPending(null);
  }, [data, xKey]);

  // Window-level listeners so the popover tracks the cursor outside the SVG
  // and `mouseup` outside the chart still releases into pending. Escape
  // mid-drag cancels outright (no pending popover).
  const isZoomDragging = zoomDrag !== null;
  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    setZoomDrag(prev => {
      if (!prev) return null;
      if (prev.clientX === clientX && prev.clientY === clientY) return prev;
      return { ...prev, clientX, clientY };
    });
  }, []);
  const handleDragEscape = useCallback(() => setZoomDrag(null), []);
  useZoomDragListeners({
    enabled: isZoomDragging,
    onMove: handleDragMove,
    onEnd: endDrag,
    onEscape: handleDragEscape,
  });

  return {
    enabled: zoomEnabledCount > 0,
    drag: zoomDrag,
    pending: zoomPending,
    registerEnabled,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
    confirmZoom,
    cancelPending,
  };
};
