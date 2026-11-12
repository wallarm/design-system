import type { FC, ReactNode } from 'react';
import { Chart, ChartHeader, ChartTitle } from '@wallarm-org/design-system/SimpleCharts';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';

/** The chart card with its title (or a title-sized bar) and a skeleton body. */
export const ChartSkeleton: FC<{ title?: string; children?: ReactNode }> = ({
  title,
  children,
}) => (
  <Chart className='h-full'>
    <ChartHeader>
      {title ? (
        <ChartTitle>{title}</ChartTitle>
      ) : (
        <Skeleton width='96px' height='12px' transparent={false} />
      )}
    </ChartHeader>
    {children ?? (
      <div className='p-12'>
        <Skeleton width='100%' height='180px' transparent={false} />
      </div>
    )}
  </Chart>
);
