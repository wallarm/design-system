import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { metricTotalClasses, metricTotalValueClasses, metricTotalWordClasses } from './classes';

export type MetricTotalConnector = 'slash' | 'of' | 'total';

export interface MetricTotalProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
  /** How the denominator reads: `/120` (`slash`) · `of 120` (`of`) · `120 total` (`total`). */
  connector?: MetricTotalConnector;
}

/**
 * The denominator after the value. A numeric child is formatted with
 * `toLocaleString('en-US')`. The number is primary text; the connector word is muted.
 */
export const MetricTotal: FC<MetricTotalProps> = ({
  connector = 'slash',
  className,
  children,
  ref,
  ...props
}) => {
  const testId = useTestId('total');
  const num = typeof children === 'number' ? children.toLocaleString('en-US') : children;

  return (
    <span
      {...props}
      ref={ref}
      data-slot='metric-total'
      data-testid={testId}
      className={cn(metricTotalClasses, className)}
    >
      {connector === 'of' && <span className={metricTotalWordClasses}>of</span>}
      <span className={metricTotalValueClasses}>{connector === 'slash' ? <>/{num}</> : num}</span>
      {connector === 'total' && <span className={metricTotalWordClasses}>total</span>}
    </span>
  );
};

MetricTotal.displayName = 'MetricTotal';
