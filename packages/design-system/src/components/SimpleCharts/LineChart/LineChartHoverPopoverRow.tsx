import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { ChartHoverCardRow } from '../internal/ChartHoverCard';
import type { LineChartSeries } from './LineChartContext';

export interface LineChartHoverPopoverRowProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Series whose colour and label feed the row. */
  series: LineChartSeries;
  /** Raw datum value at the active index. `null`/`undefined` renders an em-dash. */
  value?: number | string | null;
  /** Optional value formatter. Defaults to the shared locale formatting. */
  formatValue?: (value: number | string | null | undefined) => ReactNode;
}

/**
 * A hover popover row for one series — the shared `ChartHoverCardRow`, fed from a
 * `LineChartSeries` and keyed by `series.key`.
 */
export const LineChartHoverPopoverRow: FC<LineChartHoverPopoverRowProps> = ({
  series,
  value,
  formatValue,
  children,
  ref,
  ...props
}) => (
  <ChartHoverCardRow
    ref={ref}
    data-key={series.key}
    color={series.color ?? 'slate'}
    label={series.label}
    value={value}
    formatValue={formatValue}
    {...props}
  >
    {children}
  </ChartHoverCardRow>
);

LineChartHoverPopoverRow.displayName = 'LineChartHoverPopoverRow';
