import {
  type FC,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useCallback,
  useState,
} from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { CHART_COLORS } from '../constants';
import { ChartLegend } from '../Legend/ChartLegend';
import { ChartLegendItem } from '../Legend/ChartLegendItem';
import type { ChartPieDataItem } from '../types';

export interface ChartPieProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  ref?: Ref<HTMLDivElement>;
  data: ChartPieDataItem[];
  size?: number;
  strokeWidth?: number;
  centerValue?: string | number;
  centerLabel?: string;
  showLegend?: boolean;
  legendContent?: ReactNode;
  valueFormatter?: (value: number) => string;
  onItemClick?: (item: ChartPieDataItem) => void;
  filteredItem?: string;
}

export const ChartPie: FC<ChartPieProps> = ({
  ref,
  data,
  size = 120,
  strokeWidth = 20,
  centerValue,
  centerLabel,
  showLegend = true,
  legendContent,
  valueFormatter = v => String(v),
  onItemClick,
  filteredItem,
  className,
  ...props
}) => {
  const testId = useTestId('pie');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const innerRadius = size / 2 - strokeWidth;
  const outerRadius = size / 2;

  const activeIndex = filteredItem ? data.findIndex(d => d.name === filteredItem) : hoveredIndex;

  const handleItemClick = useCallback(
    (item: ChartPieDataItem) => {
      onItemClick?.(item);
    },
    [onItemClick],
  );

  const handleMouseEnter = useCallback((index: number) => setHoveredIndex(index), []);

  const handleMouseLeave = useCallback(() => setHoveredIndex(null), []);

  return (
    <div
      {...props}
      ref={ref}
      data-slot='chart-pie'
      data-testid={testId}
      className={cn('flex items-start', className)}
    >
      <div className='relative shrink-0' style={{ width: size + 48, height: size + 16 }}>
        <div className='absolute left-24 top-8' style={{ width: size, height: size }}>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={data}
                dataKey='value'
                cx='50%'
                cy='50%'
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                cornerRadius='2px'
                startAngle={90}
                endAngle={-270}
                paddingAngle={3}
                strokeWidth={0}
                isAnimationActive={false}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={CHART_COLORS[entry.color]}
                    fillOpacity={activeIndex !== null && activeIndex !== index ? 0.3 : 1}
                    style={{ transition: 'fill-opacity 150ms' }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {(centerValue !== undefined || centerLabel) && (
            <div className='pointer-events-none absolute inset-0 flex w-[58px] flex-col items-center justify-center mx-auto text-center'>
              {centerValue !== undefined && (
                <span className='text-base leading-sm font-mono font-medium text-text-primary'>
                  {centerValue}
                </span>
              )}
              {centerLabel && (
                <span className='text-xs font-mono text-text-secondary'>{centerLabel}</span>
              )}
            </div>
          )}
        </div>
      </div>
      {showLegend &&
        (legendContent ?? (
          <ChartLegend className='flex-1 pr-4'>
            {data.map((item, index) => (
              <ChartLegendItem
                key={item.name}
                color={item.color}
                name={item.name}
                value={valueFormatter(item.value)}
                percentage={total > 0 ? (item.value / total) * 100 : 0}
                dimmed={activeIndex !== null && activeIndex !== index}
                onClick={onItemClick ? () => handleItemClick(item) : undefined}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </ChartLegend>
        ))}
    </div>
  );
};

ChartPie.displayName = 'ChartPie';
