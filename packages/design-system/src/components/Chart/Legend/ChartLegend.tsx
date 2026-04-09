import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';

export interface ChartLegendProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const ChartLegend: FC<ChartLegendProps> = ({ ref, className, children, ...props }) => {
  const testId = useTestId('legend');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='chart-legend'
      data-testid={testId}
      className={cn('flex flex-col', className)}
    >
      {children}
    </div>
  );
};

ChartLegend.displayName = 'ChartLegend';
