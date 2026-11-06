import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { metricHeaderClasses } from './classes';

export interface MetricHeaderProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

/**
 * The baseline row holding `MetricValue` + optional `MetricTotal` + optional `MetricDelta`.
 * Exported as its own brick so `HorizontalBarStack` can reuse the exact same header.
 */
export const MetricHeader: FC<MetricHeaderProps> = ({ className, ref, ...props }) => {
  const testId = useTestId('header');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='metric-header'
      data-testid={testId}
      className={cn(metricHeaderClasses, className)}
    />
  );
};

MetricHeader.displayName = 'MetricHeader';
