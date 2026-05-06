import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { lineChartLegendVariants } from './classes';
import type { LineChartLegendOrientation } from './LineChartContext';

export interface LineChartLegendProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /**
   * How legend rows lay out inside the legend itself. Defaults to `'horizontal'`.
   * Use `'vertical'` when the legend sits to the side of the chart (the consumer
   * controls placement by JSX child order or by wrapping body+legend in an
   * `<HStack>`). Layout-vs-orientation is the only knob the legend exposes.
   */
  orientation?: LineChartLegendOrientation;
  /** Cross-axis alignment of the legend rows. Default `'start'`. */
  align?: 'start' | 'center' | 'end';
}

export const LineChartLegend: FC<LineChartLegendProps> = ({
  orientation = 'horizontal',
  align = 'start',
  className,
  ref,
  ...props
}) => {
  const testId = useTestId('legend');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='line-chart-legend'
      data-testid={testId}
      className={cn(lineChartLegendVariants({ orientation, align }), className)}
    />
  );
};

LineChartLegend.displayName = 'LineChartLegend';
