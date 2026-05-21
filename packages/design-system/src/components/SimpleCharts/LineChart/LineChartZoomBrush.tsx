import { type FC, type ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ReferenceArea, usePlotArea } from 'recharts';
import { formatChartDateTime } from '../lib/timeFormatters';
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
import { formatRange } from './lib/formatRange';

// `|| String(value)` keeps the popover readable when the X axis isn't a
// timestamp — `formatChartDateTime` returns `''` for non-numeric values.
const defaultFormatRange = formatRange(value => formatChartDateTime(value) || String(value));

const POPOVER_OFFSET_X = 12;

const RECHARTS_SURFACE = '.recharts-surface';

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
  const plotArea = usePlotArea();
  const rootRef = zoomCtx?.rootRef;

  const drag = zoomCtx?.drag ?? null;
  const pending = zoomCtx?.pending ?? null;
  const cancelPending = zoomCtx?.cancelPending;
  const confirmZoom = zoomCtx?.confirmZoom;

  const isPopoverOpen = drag !== null || pending !== null;
  const isPending = pending !== null;

  // Re-render on scroll/resize while the popover is open, so the memoised
  // viewport rect re-reads. Without this, the portal's `position: fixed`
  // pins the popover to viewport while the chart slides away on page scroll.
  // The handler short-circuits when the chart didn't actually move — scrolls
  // on unrelated subtrees (sidebars, code panels) skip the React re-render.
  const [scrollTick, setScrollTick] = useState(0);
  useEffect(() => {
    if (!isPopoverOpen) return;
    let lastTop: number | null = null;
    let lastLeft: number | null = null;
    const onScroll = () => {
      const surface = rootRef?.current?.querySelector(RECHARTS_SURFACE);
      if (!surface) return;
      const { top, left } = surface.getBoundingClientRect();
      if (top === lastTop && left === lastLeft) return;
      lastTop = top;
      lastLeft = left;
      setScrollTick(n => n + 1);
    };
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onScroll);
    };
  }, [isPopoverOpen, rootRef]);

  // Reading on every mousemove would thrash 60Hz layout, so re-reads are
  // gated on `scrollTick` bumps and popover open/close. The cache latches the
  // last truthy reading inside the memo: recharts can momentarily return a
  // null `plotArea` while re-measuring mid-drag, and without the fallback
  // the popover would drop to the cursor `clientY` for that one frame.
  const cachedGeometryRef = useRef<{ centerY: number; left: number } | null>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: `scrollTick` invalidates the memo on scroll without being read directly
  const popoverGeometry = useMemo(() => {
    if (!isPopoverOpen) {
      cachedGeometryRef.current = null;
      return null;
    }
    if (!plotArea || !rootRef?.current) return cachedGeometryRef.current;
    const surface = rootRef.current.querySelector(RECHARTS_SURFACE);
    if (!surface) return cachedGeometryRef.current;
    const rect = surface.getBoundingClientRect();
    const next = {
      centerY: rect.top + plotArea.y + plotArea.height / 2,
      left: rect.left,
    };
    cachedGeometryRef.current = next;
    return next;
  }, [isPopoverOpen, plotArea, rootRef, scrollTick]);

  // Captured once when pending begins, cleared when it ends. Combined with
  // the live left below to shift the popover by the chart's horizontal scroll
  // delta — keeps it anchored to the plot column instead of the viewport.
  // Drag doesn't need this: mousemove keeps `clientX` fresh.
  const pendingAnchorLeft = useMemo(() => {
    if (!isPending || !rootRef?.current) return null;
    const surface = rootRef.current.querySelector(RECHARTS_SURFACE);
    if (!surface) return null;
    return surface.getBoundingClientRect().left;
  }, [isPending, rootRef]);

  const centerY = popoverGeometry?.centerY ?? null;
  const pendingScrollDeltaX =
    isPending && pendingAnchorLeft !== null && popoverGeometry
      ? popoverGeometry.left - pendingAnchorLeft
      : 0;

  // Register that zoom is active so `<LineChartBody>` flips its cursor and
  // captures pointer events. Counted (not boolean) inside the context so this
  // composes safely if a future variant mounts two brush instances.
  const registerEnabled = zoomCtx?.registerEnabled;
  useEffect(() => {
    if (disabled || !registerEnabled) return;
    return registerEnabled();
  }, [disabled, registerEnabled]);

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

  // `startDrag` clears pending, so the two are mutually exclusive — `drag`
  // wins purely as a safety net against state races.
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

  const popoverPosition = drag ?? pending ?? null;

  // `pointer-events:none` during drag — the confirm button must be inert while
  // the mouse button is still held, or clicking it would re-trigger a drag.
  const popoverContent =
    range && popoverPosition ? (
      <div
        ref={popoverRef}
        data-slot='line-chart-zoom-cursor-popover'
        data-zoom-state={isPending ? 'pending' : 'dragging'}
        className={lineChartZoomCursorPopoverClasses}
        style={{
          top: centerY ?? popoverPosition.clientY,
          left: popoverPosition.clientX + pendingScrollDeltaX + POPOVER_OFFSET_X,
          transform: 'translateY(-50%)',
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
          stroke='none'
          ifOverflow='visible'
        />
      ) : null}
      {popoverContent ? createPortal(popoverContent, container ?? document.body) : null}
    </>
  );
};

LineChartZoomBrush.displayName = 'LineChartZoomBrush';
