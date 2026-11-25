import { type FC, type ReactNode, useContext } from 'react';
import { Tooltip, type TooltipContentProps } from 'recharts';
import { LineChartDataContext, type LineChartDatum } from '../LineChart/LineChartContext';
import { LineChartHoverPopover } from '../LineChart/LineChartHoverPopover';
import { LineChartHoverPopoverRow } from '../LineChart/LineChartHoverPopoverRow';
import { LineChartHoverPopoverTimestamp } from '../LineChart/LineChartHoverPopoverTimestamp';
import type { LineChartTooltipRow } from '../LineChart/LineChartTooltip';
import { buildTooltipRows } from '../LineChart/lib/buildTooltipRows';

export interface BarChartTooltipRenderArgs {
  /** The hovered bar's datum. */
  datum: LineChartDatum;
  /** Every series joined with its value on the hovered bar, in legend order. */
  rows: LineChartTooltipRow[];
  /** Raw `yKey` value of the hovered bar. */
  category: number | string;
}

export interface BarChartTooltipProps {
  /** Render-prop override for the popover body. Default: the category, then a row per series. */
  children?: (args: BarChartTooltipRenderArgs) => ReactNode;
  /** Format the category heading of the default popover. */
  categoryFormatter?: (value: unknown) => ReactNode;
}

const TOOLTIP_ALLOW_ESCAPE = { x: false, y: false };

const NO_RANGES = [] as const;

/**
 * The bar chart's hover popover — the `LineChartHoverPopover` pieces, opened over the
 * hovered bar part. `LineChartTooltip` locks the popover to the plot's vertical middle, which on a
 * tall bar chart would float it rows away from the hovered bar.
 */
export const BarChartTooltip: FC<BarChartTooltipProps> = ({ children, categoryFormatter }) => {
  const dataCtx = useContext(LineChartDataContext);

  if (!dataCtx) return null;

  const renderContent = ({ active, payload }: TooltipContentProps): ReactNode => {
    if (!active || !payload || payload.length === 0) return null;
    const datum = payload[0]?.payload as LineChartDatum | undefined;
    if (!datum) return null;

    const category = datum[dataCtx.xKey] as number | string;
    const rows = buildTooltipRows({
      datum,
      series: dataCtx.series,
      ranges: NO_RANGES,
      xKey: dataCtx.xKey,
      xs: NO_RANGES,
    });

    if (children) return children({ datum, rows, category });

    return (
      <LineChartHoverPopover>
        <LineChartHoverPopoverTimestamp>
          {categoryFormatter ? categoryFormatter(category) : String(category)}
        </LineChartHoverPopoverTimestamp>
        {rows.map(row => (
          <LineChartHoverPopoverRow key={row.series.key} series={row.series} value={row.value} />
        ))}
      </LineChartHoverPopover>
    );
  };

  return (
    <Tooltip
      // The popover opens over the bar itself; the row hover is `BarChartBody`'s.
      shared={false}
      cursor={false}
      isAnimationActive={false}
      allowEscapeViewBox={TOOLTIP_ALLOW_ESCAPE}
      content={renderContent}
    />
  );
};

BarChartTooltip.displayName = 'BarChartTooltip';
