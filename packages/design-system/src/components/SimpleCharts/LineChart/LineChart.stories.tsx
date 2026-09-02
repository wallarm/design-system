import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { FilterX, RefreshCcw, ZoomOut } from '../../../icons';
import { formatFullNumber } from '../../../utils/abbreviateNumber';
import { Button } from '../../Button';
import { Skeleton } from '../../Skeleton';
import { HStack } from '../../Stack';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';
import { Chart } from '../Chart/Chart';
import { ChartActions } from '../Chart/ChartActions';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import { useChartTimeFormatters } from '../hooks/useChartTimeFormatters';
import { MetricDelta } from '../Metric/MetricDelta';
import { MetricHeader } from '../Metric/MetricHeader';
import { MetricValue } from '../Metric/MetricValue';
import { LineChart } from './LineChart';
import { LineChartBody } from './LineChartBody';
import type { LineChartSeries, LineChartZoomRange } from './LineChartContext';
import { LineChartEmpty } from './LineChartEmpty';
import { LineChartGrid } from './LineChartGrid';
import { LineChartHoverPopover } from './LineChartHoverPopover';
import { LineChartHoverPopoverDot } from './LineChartHoverPopoverDot';
import { LineChartHoverPopoverRow } from './LineChartHoverPopoverRow';
import { LineChartHoverPopoverTimestamp } from './LineChartHoverPopoverTimestamp';
import { LineChartLegend } from './LineChartLegend';
import { LineChartLegendItem } from './LineChartLegendItem';
import { LineChartLine } from './LineChartLine';
import { LineChartTooltip } from './LineChartTooltip';
import { LineChartXAxis } from './LineChartXAxis';
import { LineChartYAxis } from './LineChartYAxis';
import { LineChartZoomBrush } from './LineChartZoomBrush';
import { formatRange } from './lib/formatRange';
import {
  customColorSeries,
  dailyData60,
  dashedSeries,
  dataWithErrorGaps,
  hourlyData24,
  hourlyData1000,
  hourlyDataA,
  hourlyDataB,
  multiSeries,
  singlePointData,
  singleSeries,
  unitsByKey,
} from './lib/sampleData';

const formatYTick = (value: unknown) => formatFullNumber(Number(value));

const DESCRIPTION = [
  "A time series in the family's card — request volume, error rate, latency, anything where the X axis reads left to right; reach for `BarList` for a top-N comparison and `PieChart` for a share of a total.",
  'Every part is an opt-in child, so a bare sparkline and a fully instrumented panel are the same component with different children, and hover, filtering and zoom all travel through one context.',
].join(' ');

const meta = {
  title: 'Data display/SimpleCharts/LineChart',
  component: LineChart,
  subcomponents: {
    LineChartBody,
    LineChartGrid,
    LineChartXAxis,
    LineChartYAxis,
    LineChartLine,
    LineChartTooltip,
    LineChartHoverPopover,
    LineChartHoverPopoverTimestamp,
    LineChartHoverPopoverRow,
    LineChartHoverPopoverDot,
    LineChartLegend,
    LineChartLegendItem,
    LineChartZoomBrush,
    LineChartEmpty,
  },
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7490-123142&m=dev',
    },
    docs: { description: { component: DESCRIPTION } },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LineChart>;

export default meta;

/**
 * One series with the full chrome — grid, both axes, and a tooltip that follows the pointer
 * along the line.
 */
export const Default: StoryFn<typeof meta> = () => {
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();
  return (
    <div className='w-560'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Requests per hour</ChartTitle>
        </ChartHeader>
        <LineChart data={hourlyData24} series={singleSeries} xKey='timestamp'>
          <LineChartBody>
            <LineChartGrid />
            <LineChartXAxis tickFormatter={formatHour} minTickGap={32} />
            <LineChartYAxis tickFormatter={formatYTick} />
            <LineChartLine seriesKey='requests' curve='linear' />
            <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
          </LineChartBody>
        </LineChart>
      </Chart>
    </div>
  );
};

Default.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7490-123143&m=dev',
  },
};

/**
 * Three series with a legend composed from `LineChartLegendItem` rows. The dot in each row is
 * the same one the tooltip uses, so the colours cannot drift apart.
 */
export const DefaultMulti: StoryFn<typeof meta> = () => {
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();
  return (
    <div className='w-560'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Traffic, errors, and latency</ChartTitle>
        </ChartHeader>
        <LineChart data={hourlyData24} series={multiSeries} xKey='timestamp'>
          <LineChartLegend>
            {multiSeries.map(s => (
              <LineChartLegendItem key={s.key} seriesKey={s.key}>
                <LineChartHoverPopoverDot color={s.color} />
                <span className='text-xs font-mono text-text-primary'>{s.label}</span>
              </LineChartLegendItem>
            ))}
          </LineChartLegend>
          <LineChartBody>
            <LineChartGrid />
            <LineChartXAxis tickFormatter={formatHour} minTickGap={32} />
            <LineChartYAxis tickFormatter={formatYTick} />
            {multiSeries.map(s => (
              <LineChartLine key={s.key} seriesKey={s.key} />
            ))}
            <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
          </LineChartBody>
        </LineChart>
      </Chart>
    </div>
  );
};

DefaultMulti.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7509-2355&m=dev',
  },
};

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
 * The metric variant: the shared `Metric` bricks sit to the left of the legend in a row of
 * their own between the header and the plot. Pure composition — the chart is untouched and the
 * card simply grows by that row.
 */
export const WithMetric: StoryFn<typeof meta> = () => {
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();
  return (
    <div className='w-800'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Requests per hour</ChartTitle>
        </ChartHeader>
        <LineChart data={hourlyData24} series={multiSeries} xKey='timestamp'>
          <div className='flex items-center justify-between pr-8'>
            <MetricHeader className='px-16'>
              <MetricValue>{2903}</MetricValue>
              <MetricDelta value={10} trend='up' sentiment='negative' />
            </MetricHeader>
            <MultiLegend />
          </div>
          <LineChartBody>
            <LineChartGrid />
            <LineChartXAxis tickFormatter={formatHour} minTickGap={32} />
            <LineChartYAxis tickFormatter={formatYTick} />
            {multiSeries.map(s => (
              <LineChartLine key={s.key} seriesKey={s.key} />
            ))}
            <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
          </LineChartBody>
        </LineChart>
      </Chart>
    </div>
  );
};

WithMetric.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11626-37312',
  },
};

/**
 * Straight joins tell the truth about where the samples are; `monotone` smooths between them
 * and reads better for a rate. Mix the two only when the series mean genuinely different
 * things.
 */
export const Curves: StoryFn<typeof meta> = () => {
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();
  return (
    <div className='grid grid-cols-2 gap-16 w-1120'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Linear interpolation</ChartTitle>
        </ChartHeader>
        <LineChart data={hourlyData24} series={multiSeries} xKey='timestamp'>
          <MultiLegend />
          <LineChartBody>
            <LineChartGrid />
            <LineChartXAxis tickFormatter={formatHour} minTickGap={32} />
            <LineChartYAxis tickFormatter={formatYTick} />
            {multiSeries.map(s => (
              <LineChartLine key={s.key} seriesKey={s.key} curve='linear' />
            ))}
            <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
          </LineChartBody>
        </LineChart>
      </Chart>

      <Chart>
        <ChartHeader>
          <ChartTitle>Mixed curves — monotone vs linear</ChartTitle>
        </ChartHeader>
        <LineChart data={hourlyData24} series={multiSeries} xKey='timestamp'>
          <MultiLegend />
          <LineChartBody>
            <LineChartGrid />
            <LineChartXAxis tickFormatter={formatHour} minTickGap={32} />
            <LineChartYAxis tickFormatter={formatYTick} />
            <LineChartLine seriesKey='requests' curve='monotone' />
            <LineChartLine seriesKey='errors' curve='linear' />
            <LineChartLine seriesKey='latency' curve='linear' />
            <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
          </LineChartBody>
        </LineChart>
      </Chart>
    </div>
  );
};

/**
 * A dashed series against a solid one — the way to separate a threshold or a projection from
 * measured data — and a CSS colour string for a series whose colour is decided elsewhere.
 */
export const LineStyling: StoryFn<typeof meta> = () => {
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();
  return (
    <div className='grid grid-cols-2 gap-16 w-1120'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Solid + dashed series</ChartTitle>
        </ChartHeader>
        <LineChart data={hourlyData24} series={dashedSeries} xKey='timestamp'>
          <MultiLegend series={dashedSeries} />
          <LineChartBody>
            <LineChartGrid />
            <LineChartXAxis tickFormatter={formatHour} minTickGap={32} />
            <LineChartYAxis tickFormatter={formatYTick} />
            {dashedSeries.map(s => (
              <LineChartLine key={s.key} seriesKey={s.key} />
            ))}
            <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
          </LineChartBody>
        </LineChart>
      </Chart>

      <Chart>
        <ChartHeader>
          <ChartTitle>Custom palette via CSS color string</ChartTitle>
        </ChartHeader>
        <LineChart data={hourlyData24} series={customColorSeries} xKey='timestamp'>
          <MultiLegend series={customColorSeries} />
          <LineChartBody>
            <LineChartGrid />
            <LineChartXAxis tickFormatter={formatHour} minTickGap={32} />
            <LineChartYAxis tickFormatter={formatYTick} />
            {customColorSeries.map(s => (
              <LineChartLine key={s.key} seriesKey={s.key} />
            ))}
            <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
          </LineChartBody>
        </LineChart>
      </Chart>
    </div>
  );
};

/**
 * The three shapes that break naive charts: a sparkline with no chrome at all, a single data
 * point, and a series with null gaps, which has to break the line rather than bridge it.
 */
export const EdgeCases: StoryFn<typeof meta> = () => {
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();
  return (
    <div className='grid grid-cols-2 gap-16 w-1120'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Sparkline — no chrome</ChartTitle>
        </ChartHeader>
        <LineChart data={hourlyData24} series={singleSeries} xKey='timestamp'>
          <LineChartBody>
            <LineChartLine seriesKey='requests' />
          </LineChartBody>
        </LineChart>
      </Chart>

      <Chart>
        <ChartHeader>
          <ChartTitle>Single data point</ChartTitle>
        </ChartHeader>
        <LineChart data={singlePointData} series={singleSeries} xKey='timestamp'>
          <LineChartBody>
            <LineChartGrid />
            <LineChartXAxis tickFormatter={formatHour} />
            <LineChartYAxis tickFormatter={formatYTick} />
            <LineChartLine seriesKey='requests' />
            <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
          </LineChartBody>
        </LineChart>
      </Chart>

      <Chart>
        <ChartHeader>
          <ChartTitle>Series with null gaps</ChartTitle>
        </ChartHeader>
        <LineChart data={dataWithErrorGaps} series={multiSeries} xKey='timestamp'>
          <MultiLegend />
          <LineChartBody>
            <LineChartGrid />
            <LineChartXAxis tickFormatter={formatHour} minTickGap={32} />
            <LineChartYAxis tickFormatter={formatYTick} />
            {multiSeries.map(s => (
              <LineChartLine key={s.key} seriesKey={s.key} />
            ))}
            <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
          </LineChartBody>
        </LineChart>
      </Chart>
    </div>
  );
};

/**
 * Composing the hover popover yourself, a `LineChartHoverPopoverRow` per series, for when a
 * value needs its unit rather than the default name-and-number.
 */
export const CustomTooltip: StoryFn<typeof meta> = () => {
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();
  return (
    <div className='w-560'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Custom tooltip with units</ChartTitle>
        </ChartHeader>
        <LineChart data={hourlyData24} series={multiSeries} xKey='timestamp'>
          <LineChartLegend>
            {multiSeries.map(s => (
              <LineChartLegendItem key={s.key} seriesKey={s.key}>
                <LineChartHoverPopoverDot color={s.color} />
                <span className='text-xs font-mono text-text-primary'>{s.label}</span>
              </LineChartLegendItem>
            ))}
          </LineChartLegend>
          <LineChartBody>
            <LineChartGrid />
            <LineChartXAxis tickFormatter={formatHour} minTickGap={32} />
            <LineChartYAxis tickFormatter={formatYTick} />
            {multiSeries.map(s => (
              <LineChartLine key={s.key} seriesKey={s.key} />
            ))}
            <LineChartTooltip>
              {({ rows, xValue }) => (
                <LineChartHoverPopover>
                  <LineChartHoverPopoverTimestamp>
                    {formatHourWithTimezone(xValue)}
                  </LineChartHoverPopoverTimestamp>
                  {rows.map(({ series: s, value: raw }) => {
                    const value = typeof raw === 'number' ? raw : 0;
                    const unit = unitsByKey[s.key] ?? '';
                    return (
                      <LineChartHoverPopoverRow
                        key={s.key}
                        series={s}
                        value={value}
                        formatValue={v =>
                          `${typeof v === 'number' ? formatFullNumber(v) : String(v ?? '')}${unit}`
                        }
                      />
                    );
                  })}
                </LineChartHoverPopover>
              )}
            </LineChartTooltip>
          </LineChartBody>
        </LineChart>
      </Chart>
    </div>
  );
};

/**
 * Legend placement is structural rather than a prop: JSX order picks top or bottom, and
 * wrapping the body and the legend in an `HStack` picks left or right, where a vertical
 * orientation stacks its rows.
 */
export const LegendPlacements: StoryFn<typeof meta> = () => {
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();
  return (
    <div className='grid grid-cols-2 gap-16 w-1120'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Top — JSX order</ChartTitle>
        </ChartHeader>
        <LineChart data={hourlyData24} series={multiSeries} xKey='timestamp'>
          <LineChartLegend>
            {multiSeries.map(s => (
              <LineChartLegendItem key={s.key} seriesKey={s.key}>
                <LineChartHoverPopoverDot color={s.color} />
                <span className='text-xs font-mono text-text-primary'>{s.label}</span>
              </LineChartLegendItem>
            ))}
          </LineChartLegend>
          <LineChartBody>
            <LineChartGrid />
            <LineChartXAxis tickFormatter={formatHour} minTickGap={32} />
            <LineChartYAxis tickFormatter={formatYTick} />
            {multiSeries.map(s => (
              <LineChartLine key={s.key} seriesKey={s.key} />
            ))}
            <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
          </LineChartBody>
        </LineChart>
      </Chart>

      <Chart>
        <ChartHeader>
          <ChartTitle>Bottom — JSX order</ChartTitle>
        </ChartHeader>
        <LineChart data={hourlyData24} series={multiSeries} xKey='timestamp'>
          <LineChartBody>
            <LineChartGrid />
            <LineChartXAxis tickFormatter={formatHour} minTickGap={32} />
            <LineChartYAxis tickFormatter={formatYTick} />
            {multiSeries.map(s => (
              <LineChartLine key={s.key} seriesKey={s.key} />
            ))}
            <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
          </LineChartBody>
          <LineChartLegend>
            {multiSeries.map(s => (
              <LineChartLegendItem key={s.key} seriesKey={s.key}>
                <LineChartHoverPopoverDot color={s.color} />
                <span className='text-xs font-mono text-text-primary'>{s.label}</span>
              </LineChartLegendItem>
            ))}
          </LineChartLegend>
        </LineChart>
      </Chart>

      <Chart>
        <ChartHeader>
          <ChartTitle>Left — wrapped in HStack</ChartTitle>
        </ChartHeader>
        <LineChart data={hourlyData24} series={multiSeries} xKey='timestamp'>
          <HStack flexGrow gap={12} align='stretch'>
            <LineChartLegend orientation='vertical'>
              {multiSeries.map(s => (
                <LineChartLegendItem key={s.key} seriesKey={s.key}>
                  <LineChartHoverPopoverDot color={s.color} />
                  <span className='text-xs font-mono text-text-primary'>{s.label}</span>
                </LineChartLegendItem>
              ))}
            </LineChartLegend>
            <LineChartBody>
              <LineChartGrid />
              <LineChartXAxis tickFormatter={formatHour} minTickGap={32} />
              <LineChartYAxis tickFormatter={formatYTick} />
              {multiSeries.map(s => (
                <LineChartLine key={s.key} seriesKey={s.key} />
              ))}
              <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
            </LineChartBody>
          </HStack>
        </LineChart>
      </Chart>

      <Chart>
        <ChartHeader>
          <ChartTitle>Right — wrapped in HStack</ChartTitle>
        </ChartHeader>
        <LineChart data={hourlyData24} series={multiSeries} xKey='timestamp'>
          <HStack flexGrow gap={12} align='stretch'>
            <LineChartBody>
              <LineChartGrid />
              <LineChartXAxis tickFormatter={formatHour} minTickGap={32} />
              <LineChartYAxis tickFormatter={formatYTick} />
              {multiSeries.map(s => (
                <LineChartLine key={s.key} seriesKey={s.key} />
              ))}
              <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
            </LineChartBody>
            <LineChartLegend orientation='vertical'>
              {multiSeries.map(s => (
                <LineChartLegendItem key={s.key} seriesKey={s.key}>
                  <LineChartHoverPopoverDot color={s.color} />
                  <span className='text-xs font-mono text-text-primary'>{s.label}</span>
                </LineChartLegendItem>
              ))}
            </LineChartLegend>
          </HStack>
        </LineChart>
      </Chart>
    </div>
  );
};

LegendPlacements.parameters = {
  layout: 'padded',
};

/**
 * Clicking a legend row isolates that series and clicking another adds it back, with the
 * header's clear control appearing while anything is hidden.
 */
export const Filterable: StoryFn<typeof meta> = () => {
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();
  const [hidden, setHidden] = useState<string[]>([]);
  // First click on a fully-visible chart isolates the clicked series (hides
  // every other one); after that, clicks toggle individual series in and out.
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
        <LineChart data={hourlyData24} series={multiSeries} xKey='timestamp' filteredKeys={hidden}>
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
          <LineChartBody>
            <LineChartGrid />
            <LineChartXAxis tickFormatter={formatHour} minTickGap={32} />
            <LineChartYAxis tickFormatter={formatYTick} />
            {multiSeries.map(s => (
              <LineChartLine key={s.key} seriesKey={s.key} />
            ))}
            <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
          </LineChartBody>
        </LineChart>
      </Chart>
    </div>
  );
};

/**
 * Two cards sharing a pointer, and it takes two mechanisms: `syncId` lines up the cursor and
 * tooltip through recharts, while `activeKey` shares the series highlight through our own
 * context.
 */
export const CrossChartHoverSync: StoryFn<typeof meta> = () => {
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();
  // `syncId` syncs the *cursor X* (tooltip + brush) via recharts' own redux
  // middleware. `activeKey` + `onActiveKeyChange` sync the *series highlight*
  // (line dimming + legend hover) via our context. The two pair cleanly —
  // each owns the surface it controls and neither reinvents the other.
  const [activeKey, setActiveKey] = useState<string | null>(null);

  return (
    <div className='grid grid-cols-2 gap-16 w-1120'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Region A</ChartTitle>
        </ChartHeader>
        <LineChart
          data={hourlyDataA}
          series={multiSeries}
          xKey='timestamp'
          syncId='regions'
          activeKey={activeKey}
          onActiveKeyChange={setActiveKey}
        >
          <LineChartLegend>
            {multiSeries.map(s => (
              <LineChartLegendItem key={s.key} seriesKey={s.key}>
                <LineChartHoverPopoverDot color={s.color} />
                <span className='text-xs font-mono text-text-primary'>{s.label}</span>
              </LineChartLegendItem>
            ))}
          </LineChartLegend>
          <LineChartBody>
            <LineChartGrid />
            <LineChartXAxis tickFormatter={formatHour} minTickGap={32} />
            <LineChartYAxis tickFormatter={formatYTick} />
            {multiSeries.map(s => (
              <LineChartLine key={s.key} seriesKey={s.key} />
            ))}
            <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
          </LineChartBody>
        </LineChart>
      </Chart>

      <Chart>
        <ChartHeader>
          <ChartTitle>Region B</ChartTitle>
        </ChartHeader>
        <LineChart
          data={hourlyDataB}
          series={multiSeries}
          xKey='timestamp'
          syncId='regions'
          activeKey={activeKey}
          onActiveKeyChange={setActiveKey}
        >
          <LineChartLegend>
            {multiSeries.map(s => (
              <LineChartLegendItem key={s.key} seriesKey={s.key}>
                <LineChartHoverPopoverDot color={s.color} />
                <span className='text-xs font-mono text-text-primary'>{s.label}</span>
              </LineChartLegendItem>
            ))}
          </LineChartLegend>
          <LineChartBody>
            <LineChartGrid />
            <LineChartXAxis tickFormatter={formatHour} minTickGap={32} />
            <LineChartYAxis tickFormatter={formatYTick} />
            {multiSeries.map(s => (
              <LineChartLine key={s.key} seriesKey={s.key} />
            ))}
            <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
          </LineChartBody>
        </LineChart>
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
  // Daily data — time is always 00:00 so the zoom popover renders date-only.
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
      <LineChart data={visibleData} series={multiSeries} xKey='timestamp' onZoomChange={handleZoom}>
        <MultiLegend />
        <LineChartBody height={220}>
          <LineChartGrid />
          <LineChartXAxis tickFormatter={formatDate} minTickGap={48} />
          <LineChartYAxis tickFormatter={formatYTick} />
          {multiSeries.map(s => (
            <LineChartLine key={s.key} seriesKey={s.key} />
          ))}
          <LineChartTooltip xTickFormatter={formatDateWithTimezone} />
          <LineChartZoomBrush formatRange={formatDateOnlyRange} />
        </LineChartBody>
      </LineChart>
    </Chart>
  );
};

/**
 * Drag across the plot to choose a range, then confirm in the popover — Enter or the button
 * emits `onZoomChange`, while Escape, an outside click or a new drag dismisses it. Slicing the
 * data to that range is yours, and so is the way back out.
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
 * There is no `loading` prop: the state is composed from the same primitives as a populated
 * chart — `Skeleton` chips inside the legend and a bare `LineChartEmpty` for the dashed plot —
 * with `aria-busy` on the `Chart` left to the caller.
 */
export const Loading: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-2 gap-16 w-1120'>
    <Chart aria-busy='true' aria-live='polite'>
      <ChartHeader>
        <ChartTitle>No legend</ChartTitle>
      </ChartHeader>
      <LineChartEmpty />
    </Chart>

    <Chart aria-busy='true' aria-live='polite'>
      <ChartHeader>
        <ChartTitle>Top — JSX order</ChartTitle>
      </ChartHeader>
      <LoadingLegend />
      <LineChartEmpty />
    </Chart>

    <Chart aria-busy='true' aria-live='polite'>
      <ChartHeader>
        <ChartTitle>Bottom — JSX order</ChartTitle>
      </ChartHeader>
      <LineChartEmpty />
      <LoadingLegend />
    </Chart>

    <Chart aria-busy='true' aria-live='polite'>
      <ChartHeader>
        <ChartTitle>Left — wrapped in HStack</ChartTitle>
      </ChartHeader>
      <HStack flexGrow gap={12} align='stretch'>
        <LoadingLegend orientation='vertical' />
        <LineChartEmpty className='flex-1 min-w-0' />
      </HStack>
    </Chart>

    <Chart aria-busy='true' aria-live='polite'>
      <ChartHeader>
        <ChartTitle>Right — wrapped in HStack</ChartTitle>
      </ChartHeader>
      <HStack flexGrow gap={12} align='stretch'>
        <LineChartEmpty className='flex-1 min-w-0' />
        <LoadingLegend orientation='vertical' />
      </HStack>
    </Chart>
  </div>
);

Loading.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7519-2617&m=dev',
  },
};

type RefreshingPlacement = 'none' | 'top' | 'bottom' | 'left' | 'right';

const RefreshingChart = ({
  placement,
  title,
}: {
  placement: RefreshingPlacement;
  title: string;
}) => {
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) return;
    const id = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(id);
  }, [loading]);

  const isSide = placement === 'left' || placement === 'right';
  const orientation = isSide ? 'vertical' : 'horizontal';

  const legend = loading ? (
    <LoadingLegend orientation={orientation} />
  ) : (
    <LineChartLegend orientation={orientation}>
      {multiSeries.map(s => (
        <LineChartLegendItem key={s.key} seriesKey={s.key}>
          <LineChartHoverPopoverDot color={s.color} />
          <span className='text-xs font-mono text-text-primary'>{s.label}</span>
        </LineChartLegendItem>
      ))}
    </LineChartLegend>
  );

  const body = loading ? (
    <LineChartEmpty className={isSide ? 'flex-1 min-w-0' : undefined} />
  ) : (
    <LineChartBody>
      <LineChartGrid />
      <LineChartXAxis tickFormatter={formatHour} minTickGap={32} />
      <LineChartYAxis tickFormatter={formatYTick} />
      {multiSeries.map(s => (
        <LineChartLine key={s.key} seriesKey={s.key} />
      ))}
      <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
    </LineChartBody>
  );

  let inner: ReactNode;
  if (placement === 'none') {
    inner = body;
  } else if (placement === 'top') {
    inner = (
      <>
        {legend}
        {body}
      </>
    );
  } else if (placement === 'bottom') {
    inner = (
      <>
        {body}
        {legend}
      </>
    );
  } else if (placement === 'left') {
    inner = (
      <HStack flexGrow gap={12} align='stretch'>
        {legend}
        {body}
      </HStack>
    );
  } else {
    inner = (
      <HStack flexGrow gap={12} align='stretch'>
        {body}
        {legend}
      </HStack>
    );
  }

  return (
    <Chart aria-busy={loading} aria-live='polite'>
      <ChartHeader>
        <ChartTitle>{title}</ChartTitle>
        <ChartActions alwaysVisible>
          <Tooltip disabled={loading}>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                color='neutral'
                size='small'
                aria-label='Reload'
                disabled={loading}
                onClick={() => setLoading(true)}
              >
                <RefreshCcw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reload</TooltipContent>
          </Tooltip>
        </ChartActions>
      </ChartHeader>
      {loading ? (
        inner
      ) : (
        <LineChart data={hourlyData24} series={multiSeries} xKey='timestamp'>
          {inner}
        </LineChart>
      )}
    </Chart>
  );
};

/**
 * Each panel loads for two seconds before swapping to data, and the refresh button replays it.
 * The skeleton and the real chart share an outer layout, so nothing but the content moves on
 * the swap.
 */
export const Refreshing: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-2 gap-16 w-1120'>
    <RefreshingChart placement='none' title='No legend' />
    <RefreshingChart placement='top' title='Top — JSX order' />
    <RefreshingChart placement='bottom' title='Bottom — JSX order' />
    <RefreshingChart placement='left' title='Left — wrapped in HStack' />
    <RefreshingChart placement='right' title='Right — wrapped in HStack' />
  </div>
);

/**
 * `LineChartEmpty` keeps the dashed plot frame and puts the message inside it, so a card with
 * no data still reads as a chart rather than as something broken.
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

Empty.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=8670-2594&m=dev',
  },
};

const LongTimeRangeChart = () => {
  const { formatDate, formatDateTime, formatDateTimeWithTimezone } = useChartTimeFormatters();
  const formatDateTimeRangeText = useMemo(() => formatRange(formatDateTime), [formatDateTime]);
  const [range, setRange] = useState<LineChartZoomRange | null>(null);
  const visibleData = useMemo(() => {
    if (!range) return hourlyData1000;
    return hourlyData1000.slice(range.fromIndex, range.toIndex + 1);
  }, [range]);

  return (
    <Chart>
      <ChartHeader>
        <ChartTitle>1,000 hourly samples — drag to zoom</ChartTitle>
        <ChartActions alwaysVisible={range !== null}>
          {range !== null && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  color='neutral'
                  size='small'
                  aria-label='Reset time selection'
                  onClick={() => setRange(null)}
                >
                  <ZoomOut />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset time selection</TooltipContent>
            </Tooltip>
          )}
        </ChartActions>
      </ChartHeader>
      <LineChart data={visibleData} series={multiSeries} xKey='timestamp' onZoomChange={setRange}>
        <LineChartLegend>
          {multiSeries.map(s => (
            <LineChartLegendItem key={s.key} seriesKey={s.key}>
              <LineChartHoverPopoverDot color={s.color} />
              <span className='text-xs font-mono text-text-primary'>{s.label}</span>
            </LineChartLegendItem>
          ))}
        </LineChartLegend>
        <LineChartBody height={220}>
          <LineChartGrid />
          <LineChartXAxis tickFormatter={formatDate} minTickGap={64} />
          <LineChartYAxis tickFormatter={formatYTick} />
          {multiSeries.map(s => (
            <LineChartLine key={s.key} seriesKey={s.key} disableAnimation />
          ))}
          <LineChartTooltip xTickFormatter={formatDateTimeWithTimezone} />
          <LineChartZoomBrush formatRange={formatDateTimeRangeText} />
        </LineChartBody>
      </LineChart>
    </Chart>
  );
};

/**
 * A thousand hourly samples in one card: drag to zoom and the header's control restores the
 * full range. The story slices the data itself, exactly as a consumer has to.
 */
export const LongTimeRange: StoryFn<typeof meta> = () => (
  <div className='w-720'>
    <LongTimeRangeChart />
  </div>
);
