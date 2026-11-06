import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { pieChartLegendClasses } from './classes';

export interface PieChartLegendProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export const PieChartLegend: FC<PieChartLegendProps> = ({ className, ref, ...props }) => {
  const testId = useTestId('legend');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='pie-chart-legend'
      data-testid={testId}
      className={cn(pieChartLegendClasses, className)}
    />
  );
};

PieChartLegend.displayName = 'PieChartLegend';
