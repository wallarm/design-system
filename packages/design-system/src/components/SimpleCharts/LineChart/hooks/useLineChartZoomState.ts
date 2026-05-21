import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';
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

interface PendingDragUpdate {
  index?: number;
  clientX?: number;
  clientY?: number;
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
 * Drag updates from recharts (`updateDrag` — carries index+coords) and from
 * the window listener (`handleDragMove` — coords only) both write into a
 * single pending-frame buffer and flush together on the next animation frame.
 * That collapses the two motion paths into one React commit per frame and
 * keeps state writes off the synchronous mousemove path.
 *
 * Dataset changes invalidate cached indices on both `drag` and `pending`, so
 * both reset whenever `data` or `xKey` flips — otherwise a stale range could
 * be committed against a refreshed dataset.
 */
export const useLineChartZoomState = ({
  data,
  xKey,
  onZoomChangeRef,
}: {
  data: LineChartDatum[];
  xKey: string;
  onZoomChangeRef: RefObject<((range: LineChartZoomRange | null) => void) | undefined>;
}): UseLineChartZoomStateResult => {
  const [zoomEnabledCount, setZoomEnabledCount] = useState(0);
  const [zoomDrag, setZoomDrag] = useState<LineChartZoomDragState | null>(null);
  const [zoomPending, setZoomPending] = useState<LineChartZoomPendingState | null>(null);

  const registerEnabled = useCallback(() => {
    setZoomEnabledCount(n => n + 1);
    return () => setZoomEnabledCount(n => n - 1);
  }, []);

  // Pending mousemove buffer + scheduled rAF id. Two motion paths feed in (recharts
  // tooltip + window mousemove); both write here and the next animation frame
  // commits a single state update.
  const pendingDragRef = useRef<PendingDragUpdate | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const flushPendingDrag = useCallback(() => {
    rafIdRef.current = null;
    const buffered = pendingDragRef.current;
    if (!buffered) return;
    pendingDragRef.current = null;
    setZoomDrag(prev => {
      if (!prev) return null;
      const endIndex = buffered.index ?? prev.endIndex;
      const clientX = buffered.clientX ?? prev.clientX;
      const clientY = buffered.clientY ?? prev.clientY;
      if (prev.endIndex === endIndex && prev.clientX === clientX && prev.clientY === clientY) {
        return prev;
      }
      return { startIndex: prev.startIndex, endIndex, clientX, clientY };
    });
  }, []);

  const scheduleFlush = useCallback(() => {
    if (rafIdRef.current !== null) return;
    rafIdRef.current = requestAnimationFrame(flushPendingDrag);
  }, [flushPendingDrag]);

  const cancelScheduledFlush = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    pendingDragRef.current = null;
  }, []);

  // A new drag implicitly discards any prior unconfirmed pending range and any
  // mid-flight rAF buffer from a previous drag session.
  const startDrag = useCallback(
    (index: number, clientX: number, clientY: number) => {
      cancelScheduledFlush();
      setZoomPending(null);
      setZoomDrag({ startIndex: index, endIndex: index, clientX, clientY });
    },
    [cancelScheduledFlush],
  );

  const updateDrag = useCallback(
    (index: number, clientX: number, clientY: number) => {
      pendingDragRef.current = { ...pendingDragRef.current, index, clientX, clientY };
      scheduleFlush();
    },
    [scheduleFlush],
  );

  const cancelDrag = useCallback(() => {
    cancelScheduledFlush();
    setZoomDrag(null);
  }, [cancelScheduledFlush]);

  // Releases drag → pending without emitting onZoomChange (user still confirms
  // via the popover). Single-index drags (plain clicks) are dropped to avoid
  // surfacing a popover for a zero-width range. Any in-flight rAF buffer is
  // merged in so the release reflects the final cursor position even if the
  // last mousemove hasn't been committed yet.
  const endDrag = useCallback(() => {
    const buffered = pendingDragRef.current;
    cancelScheduledFlush();
    setZoomDrag(currentDrag => {
      if (!currentDrag) return null;
      const endIndex = buffered?.index ?? currentDrag.endIndex;
      const clientX = buffered?.clientX ?? currentDrag.clientX;
      const clientY = buffered?.clientY ?? currentDrag.clientY;
      const lo = Math.min(currentDrag.startIndex, endIndex);
      const hi = Math.max(currentDrag.startIndex, endIndex);
      if (lo === hi) return null;
      const fromDatum = data[lo];
      const toDatum = data[hi];
      const from = fromDatum?.[xKey];
      const to = toDatum?.[xKey];
      if (from != null && to != null) {
        setZoomPending({
          range: { fromIndex: lo, toIndex: hi, from, to },
          clientX,
          clientY,
        });
      }
      return null;
    });
  }, [data, xKey, cancelScheduledFlush]);

  const confirmZoom = useCallback(() => {
    setZoomPending(currentPending => {
      if (currentPending) onZoomChangeRef.current?.(currentPending.range);
      return null;
    });
  }, [onZoomChangeRef]);

  const cancelPending = useCallback(() => {
    setZoomPending(null);
  }, []);

  // Dataset changes invalidate cached indices on `pending` and `drag`; reset
  // both so a stale range can't be committed against a refreshed dataset.
  // biome-ignore lint/correctness/useExhaustiveDependencies: data/xKey are triggers, not read inside
  useEffect(() => {
    cancelScheduledFlush();
    setZoomDrag(null);
    setZoomPending(null);
  }, [data, xKey, cancelScheduledFlush]);

  // Cancel any pending rAF on unmount so the callback doesn't fire against a
  // stale closure / unmounted component.
  useEffect(() => () => cancelScheduledFlush(), [cancelScheduledFlush]);

  // Window-level listeners so the popover tracks the cursor outside the SVG
  // and `mouseup` outside the chart still releases into pending. Escape
  // mid-drag cancels outright (no pending popover). `handleDragMove` writes
  // into the same rAF buffer as `updateDrag` so both paths produce one commit
  // per frame.
  const isZoomDragging = zoomDrag !== null;
  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      pendingDragRef.current = { ...pendingDragRef.current, clientX, clientY };
      scheduleFlush();
    },
    [scheduleFlush],
  );
  const handleDragEscape = useCallback(() => {
    cancelScheduledFlush();
    setZoomDrag(null);
  }, [cancelScheduledFlush]);
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
