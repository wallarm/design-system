import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../../utils/testId';
import { chartRootClasses } from './classes';

export interface ChartProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
}

export const Chart: FC<ChartProps> = ({
  className,
  children,
  ref,
  'data-testid': testId,
  ...props
}) => {
  return (
    <TestIdProvider value={testId}>
      <div
        {...props}
        ref={ref}
        data-slot='chart'
        data-testid={testId}
        className={cn(chartRootClasses, className)}
      >
        {children}
      </div>
    </TestIdProvider>
  );
};

Chart.displayName = 'Chart';
