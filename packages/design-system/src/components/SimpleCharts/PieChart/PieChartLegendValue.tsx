import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { pieChartLegendValueClasses } from './classes';

export interface PieChartLegendValueProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
}

export const PieChartLegendValue: FC<PieChartLegendValueProps> = ({ className, ref, ...props }) => {
  const testId = useTestId('legend-value');

  return (
    <span
      {...props}
      ref={ref}
      data-slot='pie-chart-legend-value'
      data-testid={testId}
      className={cn(pieChartLegendValueClasses, className)}
    />
  );
};

PieChartLegendValue.displayName = 'PieChartLegendValue';
