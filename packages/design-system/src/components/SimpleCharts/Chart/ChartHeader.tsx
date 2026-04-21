import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { chartHeaderClasses } from './classes';

export interface ChartHeaderProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export const ChartHeader: FC<ChartHeaderProps> = ({ className, ref, ...props }) => {
  const testId = useTestId('header');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='chart-header'
      data-testid={testId}
      className={cn(chartHeaderClasses, className)}
    />
  );
};

ChartHeader.displayName = 'ChartHeader';
