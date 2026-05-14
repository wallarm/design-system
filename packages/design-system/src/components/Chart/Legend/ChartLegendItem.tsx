import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { Badge } from '../../Badge';
import { Code } from '../../Code';
import { CHART_BADGE_COLORS } from '../constants';
import type { ChartColor } from '../types';

export interface ChartLegendItemProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  color: ChartColor;
  name: string;
  value: string | number;
  percentage?: number;
  badge?: ReactNode;
  dimmed?: boolean;
}

export const ChartLegendItem: FC<ChartLegendItemProps> = ({
  ref,
  color,
  name,
  value,
  percentage,
  badge,
  dimmed = false,
  className,
  onClick,
  ...props
}) => {
  const testId = useTestId('legend-item');

  return (
    <div
      {...props}
      ref={ref}
      onClick={onClick}
      data-slot='chart-legend-item'
      data-testid={testId}
      className={cn(
        'relative h-32 overflow-clip rounded-8 transition-opacity',
        dimmed && 'opacity-40',
        onClick && 'cursor-pointer hover:bg-states-primary-hover',
        className,
      )}
    >
      <div className='absolute left-8 top-1/2 -translate-y-1/2'>
        {badge ?? (
          <Badge
            size='medium'
            type='secondary'
            color={CHART_BADGE_COLORS[color]}
            textVariant='code'
          >
            {name}
          </Badge>
        )}
      </div>
      <div className='absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-8 whitespace-nowrap'>
        <Code asChild size='s' weight='medium' color='primary'>
          <span>{value}</span>
        </Code>
        {percentage !== undefined && (
          <>
            <Code asChild size='s' weight='regular'>
              <span className='text-text-tertiary'>•</span>
            </Code>
            <span>
              <Code asChild size='s' weight='medium' color='primary'>
                <span>{percentage.toFixed(0)}</span>
              </Code>
              <Code asChild size='s' weight='medium' color='secondary'>
                <span>%</span>
              </Code>
            </span>
          </>
        )}
      </div>
    </div>
  );
};

ChartLegendItem.displayName = 'ChartLegendItem';
