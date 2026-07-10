import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { metricValueClasses } from './classes';

export interface MetricValueProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
}

/**
 * The headline number. A numeric child is formatted with `toLocaleString('en-US')`;
 * any other node renders as-is.
 */
export const MetricValue: FC<MetricValueProps> = ({ className, children, ref, ...props }) => {
  const testId = useTestId('value');
  const content = typeof children === 'number' ? children.toLocaleString('en-US') : children;

  return (
    <span
      {...props}
      ref={ref}
      data-slot='metric-value'
      data-testid={testId}
      className={cn(metricValueClasses, className)}
    >
      {content}
    </span>
  );
};

MetricValue.displayName = 'MetricValue';
