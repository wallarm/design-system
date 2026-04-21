import { type FC, type HTMLAttributes, type Ref, useContext } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import {
  pieChartLegendPercentClasses,
  pieChartLegendPercentSymbolVariants,
  pieChartLegendPercentValueVariants,
} from './classes';
import { PieChartItemContext } from './PieChartContext';

export type PieChartLegendPercentVariant = 'split' | 'muted' | 'inherit';

export interface PieChartLegendPercentProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
  /** Number of fractional digits in the percent label. Defaults to `0`. */
  digits?: number;
  /**
   * Color treatment for the value and the `%` symbol. Mirrors `BarListPercent`.
   * - `split` (default, matches Figma) — value uses `text-text-primary`, symbol uses `text-text-secondary`.
   * - `muted` — both tokens use `text-text-secondary`.
   * - `inherit` — both inherit the parent's color (e.g. follow `PieChartLegendValue`).
   */
  variant?: PieChartLegendPercentVariant;
}

export const PieChartLegendPercent: FC<PieChartLegendPercentProps> = ({
  digits = 0,
  variant = 'split',
  className,
  children,
  ref,
  ...props
}) => {
  const testId = useTestId('legend-percent');
  const itemCtx = useContext(PieChartItemContext);
  const percent = (itemCtx?.ratio ?? 0) * 100;

  return (
    <span
      {...props}
      ref={ref}
      data-slot='pie-chart-legend-percent'
      data-testid={testId}
      className={cn(
        pieChartLegendPercentClasses,
        pieChartLegendPercentValueVariants({ variant }),
        className,
      )}
    >
      {children ?? (
        <>
          {percent.toFixed(digits)}
          <span
            data-slot='pie-chart-legend-percent-symbol'
            className={pieChartLegendPercentSymbolVariants({ variant })}
          >
            %
          </span>
        </>
      )}
    </span>
  );
};

PieChartLegendPercent.displayName = 'PieChartLegendPercent';
