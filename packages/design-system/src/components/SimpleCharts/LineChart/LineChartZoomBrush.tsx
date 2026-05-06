import { type FC, type ReactNode, useContext, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ReferenceArea } from 'recharts';
import { lineChartZoomCursorPopoverClasses } from './classes';
import { useZoomPendingListeners } from './hooks/useZoomPendingListeners';
import {
  LineChartDataContext,
  LineChartZoomContext,
  type LineChartZoomRange,
} from './LineChartContext';
import { LineChartZoomPopover } from './LineChartZoomPopover';
import { LineChartZoomPopoverConfirm } from './LineChartZoomPopoverConfirm';
import { LineChartZoomPopoverRange } from './LineChartZoomPopoverRange';
import { formatRange as defaultFormatRange } from './lib/formatRange';

const POPOVER_OFFSET_X = 12;
const POPOVER_OFFSET_Y = 12;

export interface LineChartZoomBrushProps {
  /** When `true` the zoom interaction is removed entirely. */
  disabled?: boolean;
  /** Override the default range text rendered inside the popover. */
  formatRange?: (range: LineChartZoomRange) => ReactNode;
  /** Override the default "Zoom in" label on the confirm button. */
  confirmLabel?: ReactNode;
  /**
   * Portal target for the floating range/confirm popover. Defaults to
   * `document.body`. Pass a dialog/modal node to keep the popover inside the
   * focus-trapped subtree — without this the portal escapes the focus context
   * and tabbing from the confirm button lands outside the dialog.
   */
  container?: HTMLElement | null;
}

/**
 * Enables Chrome DevTools-style drag-to-zoom on the chart plot. Two-phase:
 *
 *   1. The user drags on the plot → gray `<ReferenceArea>` follows the cursor,
 *      and a floating popover shows the formatted range live.
 *   2. The user releases → selection stays put, popover surfaces a "Zoom in"
 *      button. Clicking it (or pressing Enter) fires `onZoomChange` with the
 *      selected range. Escape, clicking outside the popover, or starting a new
 *      drag dismisses without emitting.
 *
 * Mount once as a child of `<LineChartBody>` (anywhere — order does not matter
 * since recharts picks `<ReferenceArea>` up by component type). Pair with a
 * "Zoom out" affordance in your chart header that calls `setRange(null)`.
 */
export const LineChartZoomBrush: FC<LineChartZoomBrushProps> = ({
  disabled = false,
  formatRange = defaultFormatRange,
  confirmLabel = 'Zoom in',
  container,
}) => {
  const dataCtx = useContext(LineChartDataContext);
  const zoomCtx = useContext(LineChartZoomContext);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Register that zoom is active so `<LineChartBody>` flips its cursor and
  // captures pointer events. Counted (not boolean) inside the context so this
  // composes safely if a future variant mounts two brush instances.
  const registerEnabled = zoomCtx?.registerEnabled;
  useEffect(() => {
    if (disabled || !registerEnabled) return;
    return registerEnabled();
  }, [disabled, registerEnabled]);

  const drag = zoomCtx?.drag ?? null;
  const pending = zoomCtx?.pending ?? null;
  const cancelPending = zoomCtx?.cancelPending;
  const confirmZoom = zoomCtx?.confirmZoom;
  const rootRef = zoomCtx?.rootRef;

  // Pending-state contract: click-outside dismisses, Enter confirms, Escape
  // cancels. The keydown half is scoped to events whose target is inside this
  // chart's root (looked up via the ref shared by `<LineChart>`), the popover
  // (portaled to `document.body`), or ambient (focus on body/html) — the
  // ref-based scope is load-bearing for the documented cross-chart-sync
  // pattern, where two charts share the page via a parent's hover state and
  // must not see each other's keystrokes. `useZoomPendingListeners` lives in
  // `hooks/` so the keyboard contract has a single source of truth.
  useZoomPendingListeners({
    enabled: pending !== null,
    rootRef,
    popoverRef,
    onConfirm: confirmZoom,
    onCancel: cancelPending,
  });

  // Resolve the visible selection range — drag takes priority over pending
  // because `startDrag` clears pending; both can never be set at once.
  const range = useMemo<LineChartZoomRange | null>(() => {
    if (drag && dataCtx) {
      const lo = Math.min(drag.startIndex, drag.endIndex);
      const hi = Math.max(drag.startIndex, drag.endIndex);
      const fromDatum = dataCtx.data[lo];
      const toDatum = dataCtx.data[hi];
      if (!fromDatum || !toDatum) return null;
      const from = fromDatum[dataCtx.xKey];
      const to = toDatum[dataCtx.xKey];
      if (from == null || to == null) return null;
      return { fromIndex: lo, toIndex: hi, from, to };
    }
    return pending?.range ?? null;
  }, [drag, pending, dataCtx]);

  if (disabled || !dataCtx || !zoomCtx) return null;

  // Popover position — locked at the cursor for both drag (live) and pending
  // (last position on release). The `pointer-events` toggle is what flips the
  // popover between "informational while dragging" and "interactive after
  // release" — the button is unclickable during drag (the mouse button is
  // already held anyway), and pointer-events:auto only kicks in once the drag
  // ends and the pending popover takes over.
  const popoverPosition = drag ?? pending ?? null;
  const isPending = pending !== null;

  const popoverContent =
    range && popoverPosition ? (
      <div
        ref={popoverRef}
        data-slot='line-chart-zoom-cursor-popover'
        data-zoom-state={isPending ? 'pending' : 'dragging'}
        className={lineChartZoomCursorPopoverClasses}
        style={{
          top: popoverPosition.clientY - POPOVER_OFFSET_Y,
          left: popoverPosition.clientX + POPOVER_OFFSET_X,
          transform: 'translateY(-100%)',
          pointerEvents: isPending ? 'auto' : 'none',
        }}
        // React events bubble through portals back to React ancestors. Without
        // this, mousedown on the confirm button bubbles to the chart body's
        // `onMouseDown` and starts a new drag — wiping the pending range
        // before the click handler can confirm it.
        onMouseDown={e => e.stopPropagation()}
      >
        <LineChartZoomPopover>
          <LineChartZoomPopoverRange>{formatRange(range)}</LineChartZoomPopoverRange>
          <LineChartZoomPopoverConfirm onClick={zoomCtx.confirmZoom}>
            {confirmLabel}
          </LineChartZoomPopoverConfirm>
        </LineChartZoomPopover>
      </div>
    ) : null;

  return (
    <>
      {range ? (
        <ReferenceArea
          x1={range.from}
          x2={range.to}
          // Match the Figma selection swatch — same token as the legend's hover
          // surface so the gray reads as a chart-system colour, not random.
          fill='var(--color-states-primary-hover)'
          fillOpacity={1}
          stroke='var(--color-border-primary-light)'
          strokeOpacity={1}
          ifOverflow='visible'
        />
      ) : null}
      {popoverContent ? createPortal(popoverContent, container ?? document.body) : null}
    </>
  );
};

LineChartZoomBrush.displayName = 'LineChartZoomBrush';
