import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { FilterX, ZoomOut } from '../../../icons';
import { formatFullNumber } from '../../../utils/abbreviateNumber';
import { Button } from '../../Button';
import { Skeleton } from '../../Skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';
import { Chart } from '../Chart/Chart';
import { ChartActions } from '../Chart/ChartActions';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import { useChartTimeFormatters } from '../hooks/useChartTimeFormatters';
import type { LineChartSeries, LineChartZoomRange } from '../LineChart/LineChartContext';
import { LineChartEmpty } from '../LineChart/LineChartEmpty';
import { LineChartGrid } from '../LineChart/LineChartGrid';
import { LineChartHoverPopoverDot } from '../LineChart/LineChartHoverPopoverDot';
import { LineChartLegend } from '../LineChart/LineChartLegend';
import { LineChartLegendItem } from '../LineChart/LineChartLegendItem';
import { LineChartTooltip } from '../LineChart/LineChartTooltip';
import { LineChartXAxis } from '../LineChart/LineChartXAxis';
import { LineChartYAxis } from '../LineChart/LineChartYAxis';
import { LineChartZoomBrush } from '../LineChart/LineChartZoomBrush';
import { formatRange } from '../LineChart/lib/formatRange';
import { dailyData60, hourlyData24, multiSeries } from '../LineChart/lib/sampleData';
import { MetricDelta } from '../Metric/MetricDelta';
import { MetricHeader } from '../Metric/MetricHeader';
import { MetricValue } from '../Metric/MetricValue';
import { AreaChart } from './AreaChart';
import { AreaChartArea } from './AreaChartArea';
import { AreaChartBody } from './AreaChartBody';

const formatYTick = (value: unknown) => formatFullNumber(Number(value));

const DESCRIPTION = [
  'A stacked or overlaid area chart in the SimpleCharts family — ideal for showing cumulative totals or comparing volume across series over time.',
  'All interactions (hover crosshair, tooltip, legend click-to-filter, drag-to-zoom) come from the shared LineChart infrastructure and work identically.',
].join(' ');

const meta = {
  title: 'Data display/SimpleCharts/AreaChart',
  component: AreaChart,
  subcomponents: {
    AreaChartBody,
    AreaChartArea,
  },
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11973-4142&m=dev',
    },
    docs: { description: { component: DESCRIPTION } },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AreaChart>;

export default meta;

const MultiLegend = ({ series = multiSeries }: { series?: LineChartSeries[] }) => (
  <LineChartLegend>
    {series.map(s => (
      <LineChartLegendItem key={s.key} seriesKey={s.key}>
        <LineChartHoverPopoverDot color={s.color} />
        <span className='text-xs font-mono text-text-primary'>{s.label}</span>
      </LineChartLegendItem>
    ))}
  </LineChartLegend>
);

/**
 * Three series stacked cumulatively — each band starts where the previous ends, showing the
 * total volume as the top edge of the topmost area.
 */
export const Default: StoryFn<typeof meta> = () => {
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();
  return (
    <div className='w-560'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Traffic breakdown (stacked)</ChartTitle>
        </ChartHeader>
        <AreaChart data={hourlyData24} series={multiSeries} xKey='timestamp'>
          <MultiLegend />
          <AreaChartBody>
            <LineChartGrid />
            <LineChartXAxis tickFormatter={formatHour} minTickGap={32} />
            <LineChartYAxis tickFormatter={formatYTick} />
            {multiSeries.map(s => (
              <AreaChartArea key={s.key} seriesKey={s.key} />
            ))}
            <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
          </AreaChartBody>
        </AreaChart>
      </Chart>
    </div>
  );
};

/**
 * Standard (overlaid) variant — each series draws from the baseline independently with
 * transparency, useful when stacking would be misleading.
 */
export const Standard: StoryFn<typeof meta> = () => {
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();
  return (
    <div className='w-560'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Traffic breakdown (standard)</ChartTitle>
        </ChartHeader>
        <AreaChart data={hourlyData24} series={multiSeries} xKey='timestamp' variant='standard'>
          <MultiLegend />
          <AreaChartBody>
            <LineChartGrid />
            <LineChartXAxis tickFormatter={formatHour} minTickGap={32} />
            <LineChartYAxis tickFormatter={formatYTick} />
            {multiSeries.map(s => (
              <AreaChartArea key={s.key} seriesKey={s.key} />
            ))}
            <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
          </AreaChartBody>
        </AreaChart>
      </Chart>
    </div>
  );
};

/**
 * The metric variant: `Metric` bricks sit to the left of the legend in a row between the
 * header and the plot.
 */
export const WithMetric: StoryFn<typeof meta> = () => {
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();
  return (
    <div className='w-800'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Requests per hour</ChartTitle>
        </ChartHeader>
        <AreaChart data={hourlyData24} series={multiSeries} xKey='timestamp'>
          <div className='flex items-center justify-between pr-8'>
            <MetricHeader className='px-16'>
              <MetricValue>{2903}</MetricValue>
              <MetricDelta value={10} trend='up' sentiment='negative' />
            </MetricHeader>
            <MultiLegend />
          </div>
          <AreaChartBody>
            <LineChartGrid />
            <LineChartXAxis tickFormatter={formatHour} minTickGap={32} />
            <LineChartYAxis tickFormatter={formatYTick} />
            {multiSeries.map(s => (
              <AreaChartArea key={s.key} seriesKey={s.key} />
            ))}
            <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
          </AreaChartBody>
        </AreaChart>
      </Chart>
    </div>
  );
};

/**
 * Clicking a legend row isolates that series and clicking another adds it back.
 */
export const Filterable: StoryFn<typeof meta> = () => {
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();
  const [hidden, setHidden] = useState<string[]>([]);
  const toggle = (key: string) => {
    setHidden(prev => {
      if (prev.length === 0) return multiSeries.filter(s => s.key !== key).map(s => s.key);
      if (prev.includes(key)) return prev.filter(k => k !== key);
      return [...prev, key];
    });
  };
  const filtered = hidden.length > 0;

  return (
    <div className='w-560'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Click a row to isolate, click another to add</ChartTitle>
          <ChartActions alwaysVisible={filtered}>
            {filtered && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    color='neutral'
                    size='small'
                    aria-label='Clear filter'
                    onClick={() => setHidden([])}
                  >
                    <FilterX />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove filter</TooltipContent>
              </Tooltip>
            )}
          </ChartActions>
        </ChartHeader>
        <AreaChart data={hourlyData24} series={multiSeries} xKey='timestamp' filteredKeys={hidden}>
          <LineChartLegend>
            {multiSeries.map(s => (
              <Tooltip key={s.key}>
                <TooltipTrigger asChild>
                  <LineChartLegendItem seriesKey={s.key} onClick={() => toggle(s.key)}>
                    <LineChartHoverPopoverDot color={s.color} />
                    <span className='text-xs font-mono text-text-primary'>{s.label}</span>
                  </LineChartLegendItem>
                </TooltipTrigger>
                <TooltipContent>
                  {hidden.includes(s.key) ? 'Remove filter' : 'Click to filter'}
                </TooltipContent>
              </Tooltip>
            ))}
          </LineChartLegend>
          <AreaChartBody>
            <LineChartGrid />
            <LineChartXAxis tickFormatter={formatHour} minTickGap={32} />
            <LineChartYAxis tickFormatter={formatYTick} />
            {multiSeries.map(s => (
              <AreaChartArea key={s.key} seriesKey={s.key} />
            ))}
            <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
          </AreaChartBody>
        </AreaChart>
      </Chart>
    </div>
  );
};

const ZoomControlledChart = () => {
  const { formatDate, formatDateWithTimezone } = useChartTimeFormatters();
  const [visibleData, setVisibleData] = useState(dailyData60);
  const handleZoom = useCallback((range: LineChartZoomRange | null) => {
    if (!range) {
      setVisibleData(dailyData60);
      return;
    }
    setVisibleData(prev => prev.slice(range.fromIndex, range.toIndex + 1));
  }, []);
  const isZoomed = visibleData !== dailyData60;
  const formatDateOnlyRange = useMemo(() => formatRange(formatDate), [formatDate]);

  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isZoomed) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const target = event.target;
      const isAmbient =
        target === null || target === document.body || target === document.documentElement;
      const isInChart = target instanceof Node && chartRef.current?.contains(target);
      if (!isAmbient && !isInChart) return;
      event.preventDefault();
      handleZoom(null);
    };

    window.addEventListener('keydown', handleKey);

    return () => window.removeEventListener('keydown', handleKey);
  }, [isZoomed, handleZoom]);

  return (
    <Chart ref={chartRef}>
      <ChartHeader>
        <ChartTitle>Drag on the plot, then click "Zoom in" — Esc to cancel</ChartTitle>
        <ChartActions alwaysVisible={isZoomed}>
          {isZoomed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  color='neutral'
                  size='small'
                  aria-label='Reset time selection'
                  onClick={() => handleZoom(null)}
                >
                  <ZoomOut />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset time selection</TooltipContent>
            </Tooltip>
          )}
        </ChartActions>
      </ChartHeader>
      <AreaChart data={visibleData} series={multiSeries} xKey='timestamp' onZoomChange={handleZoom}>
        <MultiLegend />
        <AreaChartBody height={220}>
          <LineChartGrid />
          <LineChartXAxis tickFormatter={formatDate} minTickGap={48} />
          <LineChartYAxis tickFormatter={formatYTick} />
          {multiSeries.map(s => (
            <AreaChartArea key={s.key} seriesKey={s.key} />
          ))}
          <LineChartTooltip xTickFormatter={formatDateWithTimezone} />
          <LineChartZoomBrush formatRange={formatDateOnlyRange} />
        </AreaChartBody>
      </AreaChart>
    </Chart>
  );
};

/**
 * Drag across the plot to choose a range, then confirm in the popover.
 */
export const Zoom: StoryFn<typeof meta> = () => (
  <div className='w-560'>
    <ZoomControlledChart />
  </div>
);

const LoadingLegend = ({ orientation }: { orientation?: 'horizontal' | 'vertical' }) => (
  <LineChartLegend orientation={orientation}>
    {[0, 1, 2].map(i => (
      <LineChartLegendItem key={i} seriesKey={`skeleton-${i}`}>
        <Skeleton width='72px' height='20px' rounded={4} />
      </LineChartLegendItem>
    ))}
  </LineChartLegend>
);

/**
 * Loading skeleton state composed from the same primitives as a populated chart.
 */
export const Loading: StoryFn<typeof meta> = () => (
  <div className='w-560'>
    <Chart aria-busy='true' aria-live='polite'>
      <ChartHeader>
        <ChartTitle>Loading</ChartTitle>
      </ChartHeader>
      <LoadingLegend />
      <LineChartEmpty />
    </Chart>
  </div>
);

/**
 * Empty state — `LineChartEmpty` keeps the dashed plot frame and puts the message inside it.
 */
export const Empty: StoryFn<typeof meta> = () => (
  <div className='w-560'>
    <Chart>
      <ChartHeader>
        <ChartTitle>No data</ChartTitle>
      </ChartHeader>
      <LineChartEmpty>No data</LineChartEmpty>
    </Chart>
  </div>
);
