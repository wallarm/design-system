import type { LineChartDatum, LineChartRangeEntry, LineChartSeries } from '../LineChartContext';
import type { LineChartTooltipRow } from '../LineChartTooltip';
import { isInRange, type RangeX } from './rangeGeometry';

/**
 * Joins the visible series with their value at `datum`. `inRange` is true only when a range
 * naming that series (`seriesKey`) contains the datum's X — the same rule as the red popover dot.
 */
export function buildTooltipRows({
  datum,
  series,
  ranges,
  xKey,
  xs,
}: {
  datum: LineChartDatum;
  series: readonly LineChartSeries[];
  ranges: readonly LineChartRangeEntry[];
  xKey: string;
  xs: readonly RangeX[];
}): LineChartTooltipRow[] {
  const x = datum[xKey] as RangeX;
  return series.map(s => ({
    series: s,
    value: datum[s.key],
    inRange: ranges.some(range => range.seriesKey === s.key && isInRange(x, range, xs)),
  }));
}
