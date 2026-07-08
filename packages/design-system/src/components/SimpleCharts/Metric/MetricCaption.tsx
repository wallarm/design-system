import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { metricCaptionClasses } from './classes';

export interface MetricCaptionProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
}

/** The muted secondary subline rendered under the header. */
export const MetricCaption: FC<MetricCaptionProps> = ({ className, ref, ...props }) => {
  const testId = useTestId('caption');

  return (
    <span
      {...props}
      ref={ref}
      data-slot='metric-caption'
      data-testid={testId}
      className={cn(metricCaptionClasses, className)}
    />
  );
};

MetricCaption.displayName = 'MetricCaption';
