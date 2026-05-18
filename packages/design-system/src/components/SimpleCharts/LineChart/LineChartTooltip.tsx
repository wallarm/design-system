import { type FC, type ReactNode, useContext, useMemo } from 'react';
import { Tooltip, type TooltipContentProps, usePlotArea } from 'recharts';
import { lineChartTooltipCenterClasses } from './classes';
import { HOVER_POPOVER_TOP, LINE_CURSOR_DASHARRAY } from './constants';
import {
  LineChartDataContext,
  type LineChartDatum,
  LineChartSelectionContext,
  type LineChartSeries,
  LineChartZoomContext,
} from './LineChartContext';
import { LineChartHoverPopover } from './LineChartHoverPopover';
import { LineChartHoverPopoverRow } from './LineChartHoverPopoverRow';
import { LineChartHoverPopoverTimestamp } from './LineChartHoverPopoverTimestamp';

export interface LineChartTooltipRow {
  /** Series schema for this row. */
  series: LineChartSeries;
  /** Raw datum value at the active index for `series.key`. */
  value: number | string | null | undefined;
}

export interface LineChartTooltipRenderArgs {
  /** Active datum at the cursor's nearest X position. */
  datum: LineChartDatum;
  /**
   * Pre-resolved popover rows — visible series joined with their value at the
   * active index, in render order. Lets the render-prop be "just lay it out"
   * instead of "join + look up + format".
   */
  rows: LineChartTooltipRow[];
  /** Raw `xKey` value at the active datum. */
  xValue: number | string;
}

export interface LineChartTooltipProps {
  /**
   * Render-prop override for the popover body. Receives the active datum, the
   * pre-resolved `rows` (visible series + value pairs), and the X value at the
   * cursor. When omitted, the default surface renders timestamp + rows.
   */
  children?: (args: LineChartTooltipRenderArgs) => ReactNode;
  /** Custom formatter for the default popover timestamp slot. */
  xTickFormatter?: (value: unknown) => ReactNode;
}

// Tokens match Figma `7527-32438` line-selection sub-node `7473:101831`.
const TOOLTIP_CURSOR = {
  stroke: 'var(--color-border-strong-primary)',
  strokeWidth: 1,
  strokeDasharray: LINE_CURSOR_DASHARRAY,
} as const;

// Keep the popover inside the plot at chart edges — without this recharts
// allows it to escape the viewBox on tight datasets.
const TOOLTIP_ALLOW_ESCAPE = { x: false, y: false };

const formatXValue = (
  value: number | string,
  formatter: ((value: unknown) => ReactNode) | undefined,
): ReactNode => {
  if (formatter) return formatter(value);
  return String(value);
};

// Recharts requires `<Tooltip>` to be a direct child of `<RechartsLineChart>` so
// it can read the chart's redux state. `LineChartTooltip` therefore returns the
// bare `<Tooltip>` element with our `content` callback wired in.
export const LineChartTooltip: FC<LineChartTooltipProps> = ({ children, xTickFormatter }) => {
  const dataCtx = useContext(LineChartDataContext);
  const { hiddenSet } = useContext(LineChartSelectionContext);
  const zoomCtx = useContext(LineChartZoomContext);
  // `usePlotArea` returns the inner plot rectangle (post-axes, post-margins) —
  // anchoring against this (not the SVG) keeps the popover between the topmost
  // line and the X axis even when the X-tick band is tall.
  const plotArea = usePlotArea();

  // Recharts re-invokes `renderContent` on every mousemove frame — filtering
  // the full series list there allocates a fresh array per pixel. Memoise
  // outside the callback so each tooltip frame reuses the same reference.
  const visibleSeries = useMemo(
    () => (dataCtx ? dataCtx.series.filter(s => !hiddenSet.has(s.key)) : []),
    [dataCtx, hiddenSet],
  );

  if (!dataCtx) return null;

  // Falls back to the original top-aligned anchor for the first frame, before
  // recharts has measured the plot.
  const centerY = plotArea ? plotArea.y + plotArea.height / 2 : HOVER_POPOVER_TOP;

  const renderContent = ({ active, payload }: TooltipContentProps): ReactNode => {
    if (!active || !payload || payload.length === 0) return null;
    // Hide the hover popover while a zoom drag is in progress or while the
    // confirm popover is up — the floating range popover from
    // `<LineChartZoomBrush>` owns the cursor in both states.
    if (zoomCtx?.drag || zoomCtx?.pending) return null;
    const datum = payload[0]?.payload as LineChartDatum | undefined;
    if (!datum) return null;

    const xValue = datum[dataCtx.xKey] as number | string;
    const rows: LineChartTooltipRow[] = visibleSeries.map(s => ({
      series: s,
      value: datum[s.key] as number | string | null | undefined,
    }));

    const body = children ? (
      children({ datum, rows, xValue })
    ) : (
      <LineChartHoverPopover>
        <LineChartHoverPopoverTimestamp>
          {formatXValue(xValue, xTickFormatter)}
        </LineChartHoverPopoverTimestamp>
        {rows.map(row => (
          <LineChartHoverPopoverRow key={row.series.key} series={row.series} value={row.value} />
        ))}
      </LineChartHoverPopover>
    );

    return <div className={lineChartTooltipCenterClasses}>{body}</div>;
  };

  return (
    <Tooltip
      // Drop the dashed cursor guideline while zoom-dragging or while the
      // confirm popover is up — the selection overlay owns the visual
      // hierarchy and the guideline reads as noise on top of it.
      cursor={zoomCtx?.drag || zoomCtx?.pending ? false : TOOLTIP_CURSOR}
      // Without this the popover Y interpolates between frames, defeating the
      // lock as the cursor moves between peaks and valleys.
      isAnimationActive={false}
      position={{ y: centerY }}
      allowEscapeViewBox={TOOLTIP_ALLOW_ESCAPE}
      content={renderContent}
    />
  );
};

LineChartTooltip.displayName = 'LineChartTooltip';
