import { type FC, type HTMLAttributes, type Ref, useCallback, useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { Button } from '../../Button';
import { Code } from '../../Code';
import { Text } from '../../Text';
import { CHART_COLORS } from '../constants';
import type { ChartColor, ChartLineSeriesConfig } from '../types';
import { ChartLineTooltip } from './ChartLineTooltip';

export interface ChartLineProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  ref?: Ref<HTMLDivElement>;
  data: Record<string, unknown>[];
  series: ChartLineSeriesConfig[];
  xAxisDataKey: string;
  xAxisFormatter?: (value: string) => string;
  yAxisFormatter?: (value: number) => string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  tooltipLabelFormatter?: (label: string) => string;
  tooltipValueFormatter?: (value: number) => string;
  curveType?: 'monotone' | 'linear' | 'step';
  /** Callback when user confirms a zoom range selection. Enables drag-to-zoom when provided. */
  onZoomIn?: (range: { start: string; end: string }) => void;
}

export const ChartLine: FC<ChartLineProps> = ({
  ref,
  data,
  series,
  xAxisDataKey,
  xAxisFormatter,
  yAxisFormatter,
  height = 200,
  showGrid = true,
  showTooltip = true,
  showLegend,
  tooltipLabelFormatter,
  tooltipValueFormatter,
  curveType = 'monotone',
  onZoomIn,
  className,
  ...props
}) => {
  const testId = useTestId('line');
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

  const handleSeriesEnter = useCallback((dataKey: string) => setHoveredSeries(dataKey), []);
  const handleSeriesLeave = useCallback(() => setHoveredSeries(null), []);

  // Range selection state
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const hasSelection = refAreaLeft !== null && refAreaRight !== null && !isSelecting;

  const clearSelection = useCallback(() => {
    setRefAreaLeft(null);
    setRefAreaRight(null);
    setIsSelecting(false);
  }, []);

  const handleZoomIn = useCallback(() => {
    if (refAreaLeft && refAreaRight && onZoomIn) {
      const dataKeys = data.map(d => d[xAxisDataKey] as string);
      const leftIdx = dataKeys.indexOf(refAreaLeft);
      const rightIdx = dataKeys.indexOf(refAreaRight);
      const [start, end] =
        leftIdx <= rightIdx ? [refAreaLeft, refAreaRight] : [refAreaRight, refAreaLeft];
      onZoomIn({ start, end });
    }
    clearSelection();
  }, [refAreaLeft, refAreaRight, onZoomIn, data, xAxisDataKey, clearSelection]);

  const handleMouseDown = useCallback(
    (e: { activeLabel?: string | number }) => {
      if (!onZoomIn || e.activeLabel == null) return;
      setRefAreaLeft(String(e.activeLabel));
      setRefAreaRight(null);
      setIsSelecting(true);
    },
    [onZoomIn],
  );

  const handleMouseMove = useCallback(
    (e: { activeLabel?: string | number }) => {
      if (isSelecting && e.activeLabel != null) {
        setRefAreaRight(String(e.activeLabel));
      }
    },
    [isSelecting],
  );

  const handleMouseUp = useCallback(() => {
    if (!isSelecting) return;
    setIsSelecting(false);
    if (refAreaLeft === refAreaRight || !refAreaRight) {
      setRefAreaLeft(null);
      setRefAreaRight(null);
    }
  }, [isSelecting, refAreaLeft, refAreaRight]);

  // Keyboard handlers: Escape clears, Enter confirms
  useEffect(() => {
    if (!refAreaLeft) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSelection();
      }
      if (e.key === 'Enter' && hasSelection) {
        handleZoomIn();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [refAreaLeft, hasSelection, clearSelection, handleZoomIn]);

  const shouldShowLegend = showLegend ?? series.length > 1;

  const colorMap = series.reduce<Record<string, ChartColor>>((acc, s) => {
    if (s.color) acc[s.dataKey] = s.color;
    return acc;
  }, {});

  return (
    <div
      {...props}
      ref={ref}
      data-slot='chart-line'
      data-testid={testId}
      className={cn('pb-12', className)}
    >
      {shouldShowLegend && (
        <div className='flex flex-wrap items-center gap-12 px-12 pb-8'>
          {series.map(s => (
            <div
              key={s.dataKey}
              className={cn(
                'flex items-center gap-4 cursor-pointer transition-opacity',
                hoveredSeries !== null && hoveredSeries !== s.dataKey && 'opacity-30',
              )}
              onMouseEnter={() => handleSeriesEnter(s.dataKey)}
              onMouseLeave={handleSeriesLeave}
            >
              <span
                className='h-8 w-8 shrink-0 rounded-[3px]'
                style={{ backgroundColor: CHART_COLORS[s.color ?? 'brand'] }}
              />
              <Code asChild size='s' color='primary'>
                <span>{s.name}</span>
              </Code>
            </div>
          ))}
        </div>
      )}
      <div className='relative px-12'>
        <ResponsiveContainer width='100%' height={height}>
          <LineChart
            data={data}
            margin={{ top: 4, right: 12, bottom: 0, left: 0 }}
            onMouseDown={onZoomIn ? handleMouseDown : undefined}
            onMouseMove={onZoomIn ? handleMouseMove : undefined}
            onMouseUp={onZoomIn ? handleMouseUp : undefined}
            style={onZoomIn ? { cursor: isSelecting ? 'col-resize' : 'crosshair' } : undefined}
          >
            {showGrid && (
              <CartesianGrid
                strokeDasharray='3 3'
                vertical={false}
                stroke='var(--color-border-primary-light)'
              />
            )}
            <XAxis
              dataKey={xAxisDataKey}
              tickFormatter={xAxisFormatter}
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 10,
                fill: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-sans)',
              }}
              dy={8}
            />
            <YAxis
              width={38}
              tickFormatter={yAxisFormatter}
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 10,
                fill: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-sans)',
              }}
              dx={-4}
            />
            {showTooltip && !isSelecting && !hasSelection && (
              <Tooltip
                content={
                  <ChartLineTooltip
                    labelFormatter={tooltipLabelFormatter}
                    valueFormatter={tooltipValueFormatter}
                    colorMap={colorMap}
                  />
                }
                cursor={{
                  stroke: 'var(--color-border-primary-light)',
                  strokeDasharray: '3 3',
                  strokeWidth: 1,
                }}
              />
            )}
            {series.map(s => (
              <Line
                key={s.dataKey}
                type={curveType}
                dataKey={s.dataKey}
                name={s.name}
                stroke={CHART_COLORS[s.color ?? 'brand']}
                strokeWidth={2}
                strokeOpacity={hoveredSeries !== null && hoveredSeries !== s.dataKey ? 0.2 : 1}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            ))}
            {refAreaLeft && refAreaRight && (
              <ReferenceArea
                x1={refAreaLeft}
                x2={refAreaRight}
                fill='var(--color-states-primary-pressed)'
                fillOpacity={1}
                stroke='none'
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        {hasSelection && (
          <div className='pointer-events-auto absolute left-1/2 top-1/3 z-10 -translate-x-1/2'>
            <div className='flex flex-col items-center gap-8 rounded-12 border-1 border-border-primary-light bg-bg-surface-2 px-16 py-12 shadow-md'>
              <Text asChild size='xs' weight='medium' color='primary'>
                <span>
                  {refAreaLeft} → {refAreaRight}
                </span>
              </Text>
              <Button
                variant='secondary'
                color='brand'
                size='small'
                className='w-full'
                onClick={handleZoomIn}
              >
                Zoom in
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ChartLine.displayName = 'ChartLine';
