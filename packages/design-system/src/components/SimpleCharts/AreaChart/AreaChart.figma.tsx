import figma from '@figma/code-connect';
import { Chart } from '../Chart/Chart';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import type { LineChartDatum, LineChartSeries } from '../LineChart/LineChartContext';
import { LineChartGrid } from '../LineChart/LineChartGrid';
import { LineChartHoverPopoverDot } from '../LineChart/LineChartHoverPopoverDot';
import { LineChartLegend } from '../LineChart/LineChartLegend';
import { LineChartLegendItem } from '../LineChart/LineChartLegendItem';
import { LineChartTooltip } from '../LineChart/LineChartTooltip';
import { LineChartXAxis } from '../LineChart/LineChartXAxis';
import { LineChartYAxis } from '../LineChart/LineChartYAxis';
import { formatChartHour } from '../lib/timeFormatters';
import { AreaChart } from './AreaChart';
import { AreaChartArea } from './AreaChartArea';
import { AreaChartBody } from './AreaChartBody';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11973-4142&m=dev';

const sampleData: LineChartDatum[] = Array.from({ length: 24 }, (_, i) => {
  const t = Date.UTC(2025, 0, 1, i, 0, 0);
  const requests = Math.round(120 + Math.sin(i / 3) * 60);
  const errors = Math.round(20 + Math.cos(i / 4) * 12);
  const latency = Math.round(80 + Math.sin(i / 5) * 20);
  return { timestamp: t, requests, errors, latency };
});

const multiSeries: LineChartSeries[] = [
  { key: 'requests', label: 'Requests', color: 'brand' },
  { key: 'errors', label: 'Errors', color: 'red' },
  { key: 'latency', label: 'Latency', color: 'blue' },
];

const formatXTick = (value: unknown) => formatChartHour(value);
const formatYTick = (value: unknown) => Number(value).toLocaleString('en-US');

figma.connect(AreaChart, figmaNodeUrl, {
  props: {
    title: figma.string('Title'),
    variant: figma.enum('Type', {
      Stacked: 'stacked',
      Standard: 'standard',
    }),
  },
  example: ({ title, variant }) => (
    <Chart>
      <ChartHeader>
        <ChartTitle>{title}</ChartTitle>
      </ChartHeader>
      <AreaChart data={sampleData} series={multiSeries} xKey='timestamp' variant={variant}>
        <LineChartLegend>
          {multiSeries.map(s => (
            <LineChartLegendItem key={s.key} seriesKey={s.key}>
              <LineChartHoverPopoverDot color={s.color} />
              <span className='text-xs font-mono text-text-primary'>{s.label}</span>
            </LineChartLegendItem>
          ))}
        </LineChartLegend>
        <AreaChartBody>
          <LineChartGrid />
          <LineChartXAxis tickFormatter={formatXTick} minTickGap={32} />
          <LineChartYAxis tickFormatter={formatYTick} />
          {multiSeries.map(s => (
            <AreaChartArea key={s.key} seriesKey={s.key} />
          ))}
          <LineChartTooltip xTickFormatter={formatChartHour} />
        </AreaChartBody>
      </AreaChart>
    </Chart>
  ),
});
