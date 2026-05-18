import type { FC } from 'react';
import { YAxis } from 'recharts';
import type { TickFormatter } from 'recharts/types/cartesian/CartesianAxis';
import type { YAxisTickContentProps } from 'recharts/types/util/types';
import { LINE_Y_LABEL_WIDTH } from './constants';
import { renderAxisTick } from './lib/renderAxisTick';

export interface LineChartYAxisProps {
  /** Format the rendered tick label. */
  tickFormatter?: (value: unknown, index: number) => string;
  /** Recharts target tick count. */
  tickCount?: number;
  /** Explicit tick values. Overrides recharts' generator. */
  ticks?: ReadonlyArray<number | string>;
  /** Recharts domain override. */
  domain?: [
    number | string | 'auto' | 'dataMin' | 'dataMax',
    number | string | 'auto' | 'dataMin' | 'dataMax',
  ];
  /** Padding between the plot edge and the first/last tick. */
  padding?: { top?: number; bottom?: number };
  /** Y-label gutter width. Defaults to the Figma-mandated `LINE_Y_LABEL_WIDTH` (38px). */
  width?: number;
  /** Render the axis area as a spacer (preserves layout, hides the labels). */
  hideTicks?: boolean;
}

// Recharts emits Y-axis tick props bottom-to-top, so the last index is the
// topmost label — skip it to keep some breathing room at the chart's top edge.
const renderTick = renderAxisTick<YAxisTickContentProps>(({ index, visibleTicksCount }) => ({
  skip: index === visibleTicksCount - 1,
}));

// Recharts requires `<YAxis>` to be a direct child of `<RechartsLineChart>`.
// In v3 the axis self-registers via Redux dispatch, so wrapping it inside this
// component still wires up correctly when the wrapper is mounted anywhere
// inside the `<RechartsLineChart>` subtree.
export const LineChartYAxis: FC<LineChartYAxisProps> = ({
  tickFormatter,
  tickCount,
  ticks,
  domain,
  padding,
  width = LINE_Y_LABEL_WIDTH,
  hideTicks = false,
}) => (
  <YAxis
    width={width}
    tickLine={false}
    axisLine={false}
    tick={hideTicks ? false : renderTick}
    tickFormatter={tickFormatter as TickFormatter | undefined}
    tickCount={tickCount}
    ticks={ticks as ReadonlyArray<string | number> | undefined}
    domain={domain}
    padding={padding}
    // Disable recharts' built-in collision filter so we can deterministically
    // hide just the visual top tick in `renderTick`. Without this the filter
    // (default `preserveEnd`) silently drops a middle tick to make room, and
    // hiding the top on top of that leaves us with a too-sparse axis.
    interval={0}
  />
);

LineChartYAxis.displayName = 'LineChartYAxis';
