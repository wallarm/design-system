import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { chartCardVariants } from './classes';

export interface ChartProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const Chart: FC<ChartProps> = ({
  ref,
  className,
  children,
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
        className={cn(chartCardVariants(), className)}
      >
        {children}
      </div>
    </TestIdProvider>
  );
};

Chart.displayName = 'Chart';
