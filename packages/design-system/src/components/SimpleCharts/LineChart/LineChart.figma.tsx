import figma from '@figma/code-connect';
import { Chart } from '../Chart/Chart';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import { formatChartHour } from '../lib/timeFormatters';
import { LineChart } from './LineChart';
import { LineChartBody } from './LineChartBody';
import type { LineChartDatum, LineChartSeries } from './LineChartContext';
import { LineChartGrid } from './LineChartGrid';
import { LineChartHoverPopoverDot } from './LineChartHoverPopoverDot';
import { LineChartLegend } from './LineChartLegend';
import { LineChartLegendItem } from './LineChartLegendItem';
import { LineChartLine } from './LineChartLine';
import { LineChartTooltip } from './LineChartTooltip';
import { LineChartXAxis } from './LineChartXAxis';
import { LineChartYAxis } from './LineChartYAxis';
import { LineChartZoomBrush } from './LineChartZoomBrush';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7490-123142&m=dev';

const figmaMultiNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7509-2354&m=dev';

const sampleData: LineChartDatum[] = Array.from({ length: 24 }, (_, i) => {
  const t = Date.UTC(2025, 0, 1, i, 0, 0);
  const requests = Math.round(120 + Math.sin(i / 3) * 60);
  const errors = Math.round(20 + Math.cos(i / 4) * 12);
  const latency = Math.round(80 + Math.sin(i / 5) * 20);
  return { timestamp: t, requests, errors, latency };
});

const singleSeries: LineChartSeries[] = [{ key: 'requests', label: 'Requests', color: 'brand' }];

const multiSeries: LineChartSeries[] = [
  { key: 'requests', label: 'Requests', color: 'brand' },
  { key: 'errors', label: 'Errors', color: 'red' },
  { key: 'latency', label: 'Latency', color: 'blue' },
];

const formatXTick = (value: unknown) => formatChartHour(value);
const formatYTick = (value: unknown) => Number(value).toLocaleString('en-US');

figma.connect(LineChart, figmaNodeUrl, {
  props: {
    title: figma.string('Title'),
    state: figma.enum('State', {
      Default: 'default',
      Hovered: 'hovered',
      Zooming: 'zooming',
    }),
  },
  example: ({ title, state }) => (
    <Chart>
      <ChartHeader>
        <ChartTitle>{title}</ChartTitle>
      </ChartHeader>
      <LineChart data={sampleData} series={singleSeries} xKey='timestamp'>
        <LineChartBody>
          <LineChartGrid />
          <LineChartXAxis tickFormatter={formatXTick} minTickGap={32} />
          <LineChartYAxis tickFormatter={formatYTick} />
          <LineChartLine seriesKey='requests' />
          <LineChartTooltip xTickFormatter={formatChartHour} />
          {state === 'zooming' && <LineChartZoomBrush />}
        </LineChartBody>
      </LineChart>
    </Chart>
  ),
});

figma.connect(LineChart, figmaMultiNodeUrl, {
  props: {
    title: figma.string('Title'),
    state: figma.enum('State', {
      Default: 'default',
      Hovered: 'hovered',
      Filtered: 'filtered',
    }),
  },
  example: ({ title, state }) => (
    <Chart>
      <ChartHeader>
        <ChartTitle>{title}</ChartTitle>
      </ChartHeader>
      <LineChart
        data={sampleData}
        series={multiSeries}
        xKey='timestamp'
        filteredKeys={state === 'filtered' ? ['latency'] : []}
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
          <LineChartXAxis tickFormatter={formatXTick} minTickGap={32} />
          <LineChartYAxis tickFormatter={formatYTick} />
          {multiSeries.map(s => (
            <LineChartLine key={s.key} seriesKey={s.key} />
          ))}
          <LineChartTooltip xTickFormatter={formatChartHour} />
        </LineChartBody>
      </LineChart>
    </Chart>
  ),
});
