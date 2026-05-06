import { type FC, useContext } from 'react';
import { XAxis } from 'recharts';
import type { TickFormatter } from 'recharts/types/cartesian/CartesianAxis';
import { LINE_AXIS_TICK_TEXT_PROPS } from './constants';
import { LineChartDataContext } from './LineChartContext';

/**
 * Tick-spacing preset. Maps to `minTickGap` so callers don't have to think in
 * pixels for the common case — explicit `minTickGap` still wins if passed.
 *
 *   - `'sparse'` → 64px gap (wide labels, long ranges)
 *   - `'normal'` → 32px gap (sane default for hourly / daily timeseries)
 *   - `'dense'`  → 16px gap (short labels, short ranges)
 */
export type LineChartXAxisDensity = 'sparse' | 'normal' | 'dense';

const DENSITY_MIN_TICK_GAP: Record<LineChartXAxisDensity, number> = {
  sparse: 64,
  normal: 32,
  dense: 16,
};

export interface LineChartXAxisProps {
  /** Format the rendered tick label. Receives the raw datum value at the tick. */
  tickFormatter?: (value: unknown, index: number) => string;
  /**
   * Curated tick-spacing preset (`'sparse' | 'normal' | 'dense'`). Sets
   * `minTickGap` to 64/32/16px respectively. Explicit `minTickGap` overrides
   * the preset — reach for that escape hatch when no preset fits.
   */
  density?: LineChartXAxisDensity;
  /** Recharts tick interval — `0` to render every tick, the literal strings to auto-pick. */
  interval?:
    | number
    | 'preserveStart'
    | 'preserveEnd'
    | 'preserveStartEnd'
    | 'equidistantPreserveStart';
  /** Recharts target tick count. */
  tickCount?: number;
  /** Explicit tick values. Overrides recharts' generator. */
  ticks?: ReadonlyArray<number | string>;
  /** Minimum gap (in pixels) between rendered tick labels. Overrides `density`. */
  minTickGap?: number;
  /** Recharts domain override — `['auto', 'auto']` by default. */
  domain?: [
    number | string | 'auto' | 'dataMin' | 'dataMax',
    number | string | 'auto' | 'dataMin' | 'dataMax',
  ];
  /** Padding between the plot edge and the first/last tick. */
  padding?: { left?: number; right?: number } | 'gap' | 'no-gap';
  /** Recharts axis scale type — `'category'` (default for line charts) or `'number'` for continuous X. */
  type?: 'category' | 'number';
  /** Render the axis area as a spacer (preserves layout, hides the labels). */
  hideTicks?: boolean;
  /**
   * Render the solid bottom axis line. Defaults to `true` — the line owns the
   * bottom rail of the plot (the `<LineChartGrid>` drops its bottom horizontal
   * grid line to avoid stacking on top of it). Pass `false` for sparkline-style
   * plots; in that case set `<LineChartGrid keepBottomLine />` if a bottom rail
   * is still wanted.
   */
  axisLine?: boolean;
}

// Solid axis line styling — same border token as the dashed grid so the
// bottom rail reads as one continuous frame element.
const AXIS_LINE_PROPS = {
  stroke: 'var(--color-border-primary-light)',
} as const;

// Recharts requires `<XAxis>` to be a direct child of `<RechartsLineChart>`.
// In v3 the axis self-registers via Redux dispatch, so wrapping it inside this
// component still wires up correctly when the wrapper is mounted anywhere
// inside the `<RechartsLineChart>` subtree.
export const LineChartXAxis: FC<LineChartXAxisProps> = ({
  tickFormatter,
  density,
  interval,
  tickCount,
  ticks,
  minTickGap,
  domain,
  padding,
  type,
  hideTicks = false,
  axisLine = true,
}) => {
  const dataCtx = useContext(LineChartDataContext);
  const xKey = dataCtx?.xKey ?? 'x';
  const resolvedMinTickGap = minTickGap ?? (density ? DENSITY_MIN_TICK_GAP[density] : undefined);

  return (
    <XAxis
      dataKey={xKey}
      type={type}
      tickLine={false}
      axisLine={axisLine ? AXIS_LINE_PROPS : false}
      tick={hideTicks ? false : LINE_AXIS_TICK_TEXT_PROPS}
      tickFormatter={tickFormatter as TickFormatter | undefined}
      interval={interval}
      tickCount={tickCount}
      ticks={ticks as ReadonlyArray<string | number> | undefined}
      minTickGap={resolvedMinTickGap}
      domain={domain}
      padding={padding}
    />
  );
};

LineChartXAxis.displayName = 'LineChartXAxis';
