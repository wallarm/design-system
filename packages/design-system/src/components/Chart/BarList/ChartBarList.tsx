import {
  type FC,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type Ref,
  useCallback,
  useState,
} from 'react';
import {
  Bar,
  BarChart,
  type BarShapeProps,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CategoricalChartFunc } from 'recharts/types/chart/types';
import type { Props as LabelProps } from 'recharts/types/component/Label';
import type { ActiveShape } from 'recharts/types/util/types';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import type { ChartBarListDataItem, ChartColor } from '../types';
import { ChartBarListBar } from './ChartBarListBar';
import { ChartBarListTooltip } from './ChartBarListTooltip';
import { BAR_HEIGHT, ROW_HEIGHT } from './constants';

export interface ChartBarListProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  data: ChartBarListDataItem[];
  color?: ChartColor;
  valueFormatter?: (value: number) => string;
  showPercentage?: boolean;
  onItemClick?: (item: ChartBarListDataItem) => void;
  filteredItem?: string;
}

export const ChartBarList: FC<ChartBarListProps> = ({
  ref,
  data,
  color = 'slate',
  valueFormatter = v => String(v),
  showPercentage = true,
  onItemClick,
  filteredItem,
  className,
  ...props
}) => {
  const testId = useTestId('bar-list');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleMouseMove = useCallback<CategoricalChartFunc<ReactMouseEvent<SVGGraphicsElement>>>(
    state => {
      if (state?.activeTooltipIndex != null) {
        setHoveredIndex(Number(state.activeTooltipIndex));
      }
    },
    [],
  );

  const handleMouseLeave = useCallback<CategoricalChartFunc<ReactMouseEvent<SVGGraphicsElement>>>(
    () => setHoveredIndex(null),
    [],
  );

  const handleClick = useCallback<CategoricalChartFunc<ReactMouseEvent<SVGGraphicsElement>>>(
    state => {
      if (!onItemClick || state?.activeTooltipIndex == null) return;
      const items = filteredItem ? data.filter(d => d.name === filteredItem) : data;
      const item = items[Number(state.activeTooltipIndex)];
      if (item) onItemClick(item);
    },
    [onItemClick, data, filteredItem],
  );

  const visibleData = filteredItem ? data.filter(d => d.name === filteredItem) : data;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const chartHeight = visibleData.length * ROW_HEIGHT;

  const renderValueLabel = (labelProps: LabelProps) => {
    const { index = 0 } = labelProps;
    const y = Number(labelProps.y ?? 0);
    const h = Number(labelProps.height ?? 0);
    const item = visibleData[index];
    if (!item) return null;
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const formatted = valueFormatter(item.value);
    const percentText = showPercentage ? `${percentage.toFixed(0)}%` : '';

    return (
      <text
        x='100%'
        y={y + h / 2}
        dx={-12}
        textAnchor='end'
        dominantBaseline='middle'
        style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500 }}
      >
        <tspan style={{ fill: 'var(--color-text-primary)' }}>{formatted}</tspan>
        {percentText && (
          <tspan style={{ fill: 'var(--color-text-secondary)' }}>{percentText}</tspan>
        )}
      </text>
    );
  };

  const renderNameLabel = (labelProps: LabelProps) => {
    const { index = 0 } = labelProps;
    const y = Number(labelProps.y ?? 0);
    const h = Number(labelProps.height ?? 0);
    const item = visibleData[index];
    if (!item) return null;

    return (
      <text
        x={12}
        y={y + h / 2}
        dominantBaseline='middle'
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          fontWeight: 400,
          fill: 'var(--color-text-primary)',
        }}
      >
        {item.name}
      </text>
    );
  };

  // Closure-dependent: needs hoveredIndex and onItemClick from parent state
  const RowBackground: ActiveShape<BarShapeProps, SVGRectElement> = ({ y = 0, index = 0 }) => {
    const rowY = y - (ROW_HEIGHT - BAR_HEIGHT) / 2;

    return (
      <rect
        x={0}
        y={rowY}
        width='100%'
        height={ROW_HEIGHT}
        fill={hoveredIndex === index ? 'var(--color-states-primary-hover)' : 'transparent'}
        cursor={onItemClick ? 'pointer' : 'default'}
      />
    );
  };

  return (
    <div
      {...props}
      ref={ref}
      data-slot='chart-bar-list'
      data-testid={testId}
      className={cn(className)}
    >
      <ResponsiveContainer width='100%' height={chartHeight}>
        <BarChart
          layout='vertical'
          data={visibleData}
          margin={{ top: 0, right: 80, bottom: 0, left: 8 }}
          barCategoryGap={4}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={onItemClick ? handleClick : undefined}
          style={onItemClick ? { cursor: 'pointer' } : undefined}
        >
          <XAxis type='number' hide domain={[0, 'dataMax']} />
          <YAxis type='category' dataKey='name' hide />
          {onItemClick && (
            <Tooltip
              content={<ChartBarListTooltip />}
              cursor={false}
              allowEscapeViewBox={{ x: true, y: true }}
            />
          )}
          <Bar
            dataKey='value'
            barSize={BAR_HEIGHT}
            shape={ChartBarListBar}
            background={RowBackground}
            isAnimationActive={false}
          >
            <LabelList content={renderNameLabel} />
            <LabelList content={renderValueLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

ChartBarList.displayName = 'ChartBarList';
