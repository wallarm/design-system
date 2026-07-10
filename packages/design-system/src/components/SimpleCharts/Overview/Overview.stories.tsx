import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { formatFullNumber } from '../../../utils/abbreviateNumber';
import { Badge } from '../../Badge';
import { BarList } from '../BarList/BarList';
import { BarListBar } from '../BarList/BarListBar';
import { BarListItem } from '../BarList/BarListItem';
import { BarListLabel } from '../BarList/BarListLabel';
import { BarListPercent } from '../BarList/BarListPercent';
import { BarListValue } from '../BarList/BarListValue';
import { Chart } from '../Chart/Chart';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import {
  HorizontalBarStack,
  type HorizontalBarStackDatum,
} from '../HorizontalBarStack/HorizontalBarStack';
import { useChartTimeFormatters } from '../hooks/useChartTimeFormatters';
import { LineChart } from '../LineChart/LineChart';
import { LineChartBody } from '../LineChart/LineChartBody';
import { LineChartGrid } from '../LineChart/LineChartGrid';
import { LineChartLine } from '../LineChart/LineChartLine';
import { LineChartTooltip } from '../LineChart/LineChartTooltip';
import { LineChartXAxis } from '../LineChart/LineChartXAxis';
import { LineChartYAxis } from '../LineChart/LineChartYAxis';
import { hourlyData24, singleSeries } from '../LineChart/lib/sampleData';
import { Metric } from '../Metric/Metric';
import { MetricCaption } from '../Metric/MetricCaption';
import { MetricDelta } from '../Metric/MetricDelta';
import { MetricHeader } from '../Metric/MetricHeader';
import { MetricTotal } from '../Metric/MetricTotal';
import { MetricValue } from '../Metric/MetricValue';
import { LegendDot } from '../PieChart/LegendDot';
import { PieChart } from '../PieChart/PieChart';
import {
  PieChartCenter,
  PieChartCenterLabel,
  PieChartCenterValue,
} from '../PieChart/PieChartCenter';
import { PieChartDonut } from '../PieChart/PieChartDonut';
import { PieChartLegend } from '../PieChart/PieChartLegend';
import { PieChartLegendItem } from '../PieChart/PieChartLegendItem';
import { PieChartLegendPercent } from '../PieChart/PieChartLegendPercent';
import { PieChartLegendValue } from '../PieChart/PieChartLegendValue';
import type { ChartColor } from '../types';

const formatValue = (n: number) => n.toLocaleString('en-US');
const formatYTick = (value: unknown) => formatFullNumber(Number(value));

const barRows: { name: string; value: number; color: ChartColor }[] = [
  { name: '/api/v1/users', value: 1240, color: 'brand' },
  { name: '/api/v1/auth/login', value: 890, color: 'green' },
  { name: '/api/v1/orders', value: 612, color: 'blue' },
  { name: '/api/v1/products', value: 358, color: 'amber' },
  { name: '/api/v1/search', value: 174, color: 'red' },
];
const barTotal = barRows.reduce((sum, r) => sum + r.value, 0);

const pieRows = [
  { name: '4XX', value: 35, color: 'amber' as const, badgeColor: 'amber' as const },
  { name: '2XX', value: 31, color: 'green' as const, badgeColor: 'green' as const },
  { name: '5XX', value: 15, color: 'red' as const, badgeColor: 'red' as const },
  { name: '3XX', value: 18, color: 'blue' as const, badgeColor: 'blue' as const },
  { name: '1XX', value: 1, color: 'slate' as const, badgeColor: 'slate' as const },
];
const pieTotal = pieRows.reduce((sum, r) => sum + r.value, 0);

const severityData: HorizontalBarStackDatum[] = [
  { name: 'Critical', value: 42, color: 'red' },
  { name: 'High', value: 31, color: 'brand' },
  { name: 'Medium', value: 18, color: 'amber' },
];

const meta = {
  title: 'Data display/SimpleCharts/Overview',
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7490-121203&m=dev',
    },
    docs: {
      description: {
        component:
          'SimpleCharts is the design-system family of self-contained, composable charts for dashboard cards. ' +
          'Each chart owns its own data context and shares the chart frame (`<Chart>`, `<ChartHeader>`, `<ChartTitle>`, `<ChartActions>`). ' +
          'This page shows a default rendering of each one — open the individual chart pages for the full API and interaction stories. ' +
          '`Chart` itself is the low-level primitive used to build the others; treat it as developer reference.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

const BarChartCard = () => (
  <Chart>
    <ChartHeader>
      <ChartTitle>Top 5 endpoints</ChartTitle>
    </ChartHeader>
    <BarList max={barTotal}>
      {barRows.map(row => (
        <BarListItem key={row.name} value={row.value}>
          <BarListBar />
          <BarListLabel>{row.name}</BarListLabel>
          <BarListValue>
            {formatValue(row.value)}
            <BarListPercent />
          </BarListValue>
        </BarListItem>
      ))}
    </BarList>
  </Chart>
);

const PieChartCard = () => (
  <Chart>
    <ChartHeader>
      <ChartTitle>Response status</ChartTitle>
    </ChartHeader>
    <PieChart data={pieRows} total={pieTotal}>
      <PieChartDonut>
        <PieChartCenter>
          <PieChartCenterValue formatHoveredValue={d => formatValue(d.value)}>
            {formatValue(pieTotal)}
          </PieChartCenterValue>
          <PieChartCenterLabel
            className='whitespace-nowrap'
            pluralize={{ one: 'request', other: 'requests' }}
          />
        </PieChartCenter>
      </PieChartDonut>
      <PieChartLegend>
        {pieRows.map(row => (
          <PieChartLegendItem key={row.name} name={row.name}>
            <Badge color={row.badgeColor} type='secondary' textVariant='code'>
              {row.name}
            </Badge>
            <PieChartLegendValue>
              {formatValue(row.value)}
              <LegendDot />
              <PieChartLegendPercent />
            </PieChartLegendValue>
          </PieChartLegendItem>
        ))}
      </PieChartLegend>
    </PieChart>
  </Chart>
);

const LineChartCard = () => {
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();
  return (
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
  );
};

const HorizontalBarStackCard = () => (
  <Chart>
    <ChartHeader>
      <ChartTitle>Findings by severity</ChartTitle>
    </ChartHeader>
    <HorizontalBarStack data={severityData}>
      <MetricHeader>
        <MetricValue>91</MetricValue>
        <MetricDelta value={10} trend='up' sentiment='negative' />
      </MetricHeader>
    </HorizontalBarStack>
  </Chart>
);

const MetricCard = () => (
  <Chart>
    <ChartHeader>
      <ChartTitle>Blocked attacks</ChartTitle>
    </ChartHeader>
    <Metric>
      <MetricHeader>
        <MetricValue>91</MetricValue>
        <MetricTotal connector='of'>120</MetricTotal>
        <MetricDelta value={10} trend='up' sentiment='negative' />
      </MetricHeader>
      <MetricCaption>Last 24 hours</MetricCaption>
    </Metric>
  </Chart>
);

export const Default: StoryFn<typeof meta> = () => (
  <div className='flex flex-col gap-16 w-832'>
    <div className='grid grid-cols-2 gap-16'>
      <BarChartCard />
      <PieChartCard />
    </div>
    <LineChartCard />
    <div className='grid grid-cols-2 gap-16'>
      <HorizontalBarStackCard />
      <MetricCard />
    </div>
  </div>
);

Default.parameters = {
  docs: {
    description: {
      story:
        'Default rendering of each chart in the SimpleCharts family. BarList (top-left) and PieChart (top-right) share the row; LineChart spans the row below; HorizontalBarStack (bottom-left) and Metric (bottom-right) share the last row.',
    },
  },
};
