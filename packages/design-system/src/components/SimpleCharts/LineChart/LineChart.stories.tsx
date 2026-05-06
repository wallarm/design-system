import { type ReactNode, useEffect, useMemo, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { FilterX, RefreshCcw, ZoomOut } from '../../../icons';
import { formatFullNumber } from '../../../utils/abbreviateNumber';
import { Button } from '../../Button';
import { Skeleton } from '../../Skeleton';
import { HStack } from '../../Stack';
import { Chart } from '../Chart/Chart';
import { ChartActions } from '../Chart/ChartActions';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import { useChartTimeFormatters } from '../hooks/useChartTimeFormatters';
import { LineChart } from './LineChart';
import { LineChartBody } from './LineChartBody';
import type { LineChartDatum, LineChartSeries, LineChartZoomRange } from './LineChartContext';
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
    docs: {
      description: {
        component: `LineChart renders one or more time-series lines inside the shared chart frame. The root owns \`data\` and \`series\` and supplies a context that the body, lines, axes, grid, tooltip, brush, and legend compose against. Hover sync, click-to-filter, and zoom-to-emit all flow through the same context. Legend placement is structural — JSX child order picks top vs bottom; wrapping body+legend in an \`<HStack>\` picks left vs right.`,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LineChart>;

export default meta;

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
  docs: {
    description: {
      story: `Legend placement is structural, not configured. JSX child order picks top vs bottom; wrapping the body and the legend together in an \`<HStack>\` (or any row flex container) picks left vs right. The legend pairs \`orientation="vertical"\` with the side layout so its rows stack vertically.`,
    },
  },
};

export const Filterable: StoryFn<typeof meta> = () => {
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();
  const [hidden, setHidden] = useState<string[]>([]);
  const toggle = (key: string) => {
    setHidden(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));
  };

  return (
    <div className='w-560'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Click a row to toggle</ChartTitle>
          <ChartActions alwaysVisible={hidden.length > 0}>
            {hidden.length > 0 && (
              <Button
                variant='ghost'
                color='neutral'
                size='small'
                aria-label='Clear filter'
                onClick={() => setHidden([])}
              >
                <FilterX />
              </Button>
            )}
          </ChartActions>
        </ChartHeader>
        <LineChart data={hourlyData24} series={multiSeries} xKey='timestamp' filteredKeys={hidden}>
          <LineChartLegend>
            {multiSeries.map(s => (
              <LineChartLegendItem key={s.key} seriesKey={s.key} onClick={() => toggle(s.key)}>
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
  const { formatDate, formatDateWithTimezone, formatDateRange } = useChartTimeFormatters();
  const [range, setRange] = useState<LineChartZoomRange | null>(null);
  const visibleData = useMemo(() => {
    if (!range) return dailyData60;
    return dailyData60.slice(range.fromIndex, range.toIndex + 1);
  }, [range]);

  return (
    <Chart>
      <ChartHeader>
        <ChartTitle>Drag on the plot, then click "Zoom in" — Esc to cancel</ChartTitle>
        <ChartActions alwaysVisible={range !== null}>
          {range !== null && (
            <Button
              variant='ghost'
              color='neutral'
              size='small'
              aria-label='Reset zoom'
              onClick={() => setRange(null)}
            >
              <ZoomOut />
            </Button>
          )}
        </ChartActions>
      </ChartHeader>
      <LineChart data={visibleData} series={multiSeries} xKey='timestamp' onZoomChange={setRange}>
        <MultiLegend />
        <LineChartBody height={220}>
          <LineChartGrid />
          <LineChartXAxis tickFormatter={formatDate} minTickGap={48} />
          <LineChartYAxis tickFormatter={formatYTick} />
          {multiSeries.map(s => (
            <LineChartLine key={s.key} seriesKey={s.key} />
          ))}
          <LineChartTooltip xTickFormatter={formatDateWithTimezone} />
          <LineChartZoomBrush formatRange={formatDateRange} />
        </LineChartBody>
      </LineChart>
    </Chart>
  );
};

export const Zoom: StoryFn<typeof meta> = () => (
  <div className='w-560'>
    <ZoomControlledChart />
  </div>
);

Zoom.parameters = {
  docs: {
    description: {
      story: `Drag on the chart plot to select a range — the gray selection rectangle follows the cursor. On release the selection stays put and a "Zoom in" popover appears for confirmation. Clicking "Zoom in" or pressing \`Enter\` fires \`onZoomChange\` with the selected range; pressing \`Escape\`, clicking outside the popover, or starting a new drag dismisses without emitting. The consumer slices its own data based on the range, and a "Zoom out" button in \`<ChartActions>\` clears it.`,
    },
  },
};

const LoadingLegend = ({ orientation }: { orientation?: 'horizontal' | 'vertical' }) => (
  <LineChartLegend orientation={orientation}>
    {[0, 1, 2].map(i => (
      <LineChartLegendItem key={i} seriesKey={`skeleton-${i}`}>
        <Skeleton width='72px' height='20px' rounded={4} />
      </LineChartLegendItem>
    ))}
  </LineChartLegend>
);

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
  docs: {
    description: {
      story: `Loading state is built by composing the same primitives as a populated chart — \`<LineChartLegend>\` with \`<Skeleton>\` chips for the legend, bare \`<LineChartEmpty />\` for the dashed-grid plot frame (no \`children\` means no message overlay). Mirrors the four placement variants from \`LegendPlacements\` plus a no-legend variant. \`aria-busy\` on \`<Chart>\` announces the loading state.`,
    },
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
          <Button
            variant='ghost'
            color='neutral'
            size='small'
            aria-label='Refresh'
            disabled={loading}
            onClick={() => setLoading(true)}
          >
            <RefreshCcw />
          </Button>
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

export const Refreshing: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-2 gap-16 w-1120'>
    <RefreshingChart placement='none' title='No legend' />
    <RefreshingChart placement='top' title='Top — JSX order' />
    <RefreshingChart placement='bottom' title='Bottom — JSX order' />
    <RefreshingChart placement='left' title='Left — wrapped in HStack' />
    <RefreshingChart placement='right' title='Right — wrapped in HStack' />
  </div>
);

Refreshing.parameters = {
  docs: {
    description: {
      story: `Each panel mounts in the loading state for 2 seconds before swapping to data; the refresh button replays the cycle independently per chart. Mirrors the four placement variants from \`LegendPlacements\` plus a no-legend variant — the skeleton (legend + plot frame) and the populated chart share the same outer layout, so the swap is invisible apart from the content.`,
    },
  },
};

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
  const { formatDate, formatDateWithTimezone, formatDateRange } = useChartTimeFormatters();
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
            <Button
              variant='ghost'
              color='neutral'
              size='small'
              aria-label='Reset zoom'
              onClick={() => setRange(null)}
            >
              <ZoomOut />
            </Button>
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
          <LineChartTooltip xTickFormatter={formatDateWithTimezone} />
          <LineChartZoomBrush formatRange={formatDateRange} />
        </LineChartBody>
      </LineChart>
    </Chart>
  );
};

export const LongTimeRange: StoryFn<typeof meta> = () => (
  <div className='w-720'>
    <LongTimeRangeChart />
  </div>
);
