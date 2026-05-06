import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../../utils/cn';
import {
  lineChartHoverPopoverRowClasses,
  lineChartHoverPopoverRowDotClasses,
  lineChartHoverPopoverRowLabelClasses,
  lineChartHoverPopoverRowValueClasses,
} from './classes';
import type { LineChartSeries } from './LineChartContext';
import { LineChartHoverPopoverDot } from './LineChartHoverPopoverDot';

export interface LineChartHoverPopoverRowProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Series whose colour and label feed the row. */
  series: LineChartSeries;
  /** Raw datum value at the active index. `null`/`undefined` renders an em-dash. */
  value?: number | string | null;
  /** Optional value formatter. Defaults to `Number.toLocaleString` / `String`. */
  formatValue?: (value: number | string | null | undefined) => ReactNode;
}

const defaultFormatValue = (value: number | string | null | undefined): ReactNode => {
  if (value === null || value === undefined) return '—';
  return typeof value === 'number' ? value.toLocaleString() : String(value);
};

export const LineChartHoverPopoverRow: FC<LineChartHoverPopoverRowProps> = ({
  series,
  value,
  formatValue = defaultFormatValue,
  ref,
  className,
  children,
  ...props
}) => {
  return (
    <div
      {...props}
      ref={ref}
      data-slot='line-chart-hover-popover-row'
      data-key={series.key}
      className={cn(lineChartHoverPopoverRowClasses, className)}
    >
      {children ?? (
        <>
          <LineChartHoverPopoverDot
            color={series.color ?? 'slate'}
            className={lineChartHoverPopoverRowDotClasses}
          />
          <span className={lineChartHoverPopoverRowLabelClasses}>{series.label}</span>
          <span className={lineChartHoverPopoverRowValueClasses}>{formatValue(value)}</span>
        </>
      )}
    </div>
  );
};

LineChartHoverPopoverRow.displayName = 'LineChartHoverPopoverRow';
