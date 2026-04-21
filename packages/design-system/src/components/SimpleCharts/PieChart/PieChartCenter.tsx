import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import {
  pieChartCenterClasses,
  pieChartCenterLabelClasses,
  pieChartCenterValueClasses,
} from './classes';

export interface PieChartCenterProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export const PieChartCenter: FC<PieChartCenterProps> = ({ className, ref, ...props }) => {
  const testId = useTestId('center');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='pie-chart-center'
      data-testid={testId}
      aria-hidden='true'
      className={cn(pieChartCenterClasses, className)}
    />
  );
};

PieChartCenter.displayName = 'PieChartCenter';

export interface PieChartCenterValueProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
}

export const PieChartCenterValue: FC<PieChartCenterValueProps> = ({ className, ref, ...props }) => {
  const testId = useTestId('center-value');

  return (
    <span
      {...props}
      ref={ref}
      data-slot='pie-chart-center-value'
      data-testid={testId}
      className={cn(pieChartCenterValueClasses, className)}
    />
  );
};

PieChartCenterValue.displayName = 'PieChartCenterValue';

export interface PieChartCenterLabelProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
}

export const PieChartCenterLabel: FC<PieChartCenterLabelProps> = ({ className, ref, ...props }) => {
  const testId = useTestId('center-label');

  return (
    <span
      {...props}
      ref={ref}
      data-slot='pie-chart-center-label'
      data-testid={testId}
      className={cn(pieChartCenterLabelClasses, className)}
    />
  );
};

PieChartCenterLabel.displayName = 'PieChartCenterLabel';
