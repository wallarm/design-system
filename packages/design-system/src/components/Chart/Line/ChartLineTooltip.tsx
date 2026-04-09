import type { FC } from 'react';
import { cn } from '../../../utils/cn';
import { Code } from '../../Code';
import { Text } from '../../Text';
import { CHART_COLORS } from '../constants';
import type { ChartColor } from '../types';

interface ChartLineTooltipPayloadItem {
  name: string;
  value: number;
  color?: string;
  dataKey: string;
  payload: Record<string, unknown>;
}

export interface ChartLineTooltipProps {
  active?: boolean;
  payload?: ChartLineTooltipPayloadItem[];
  label?: string;
  labelFormatter?: (label: string) => string;
  valueFormatter?: (value: number) => string;
  colorMap?: Record<string, ChartColor>;
}

export const ChartLineTooltip: FC<ChartLineTooltipProps> = ({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter = v => String(v),
  colorMap,
}) => {
  if (!active || !payload?.length) return null;

  const formattedLabel = label ? (labelFormatter ? labelFormatter(label) : label) : undefined;

  return (
    <div
      data-slot='chart-tooltip'
      className={cn(
        'min-w-[140px] rounded-12 border-1 border-border-primary-light bg-bg-surface-2 px-12 py-8 shadow-md',
      )}
    >
      {formattedLabel && (
        <Text asChild size='xs' weight='medium' color='primary'>
          <div>{formattedLabel}</div>
        </Text>
      )}
      <div className='flex flex-col gap-6'>
        {payload.map(item => {
          const chartColor = colorMap?.[item.dataKey];
          const dotColor = chartColor ? CHART_COLORS[chartColor] : item.color;

          return (
            <div key={item.dataKey} className='flex items-center gap-4'>
              <span
                className='h-8 w-8 shrink-0 rounded-[3px]'
                style={{ backgroundColor: dotColor }}
              />
              <Code asChild size='s' color='primary'>
                <span className='flex-1'>{item.name}</span>
              </Code>
              <Code asChild size='s' weight='medium' color='primary'>
                <span className='text-right'>{valueFormatter(item.value)}</span>
              </Code>
            </div>
          );
        })}
      </div>
    </div>
  );
};

ChartLineTooltip.displayName = 'ChartLineTooltip';
