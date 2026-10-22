import type { MouseEvent } from 'react';
import { fn } from 'storybook/test';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { formatFullNumber } from '../../../utils/abbreviateNumber';
import { Skeleton } from '../../Skeleton';
import { Chart } from '../Chart/Chart';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import { useChartTimeFormatters } from '../hooks/useChartTimeFormatters';
import type { LineChartDatum, LineChartSeries } from '../LineChart/LineChartContext';
import { LineChartEmpty } from '../LineChart/LineChartEmpty';
import { LineChartGrid } from '../LineChart/LineChartGrid';
import { LineChartHoverPopoverDot } from '../LineChart/LineChartHoverPopoverDot';
import { LineChartLegend } from '../LineChart/LineChartLegend';
import { LineChartLegendItem } from '../LineChart/LineChartLegendItem';
import { LineChartTooltip } from '../LineChart/LineChartTooltip';
import { LineChartYAxis } from '../LineChart/LineChartYAxis';
import { ColumnChart } from './ColumnChart';
import { ColumnChartBody } from './ColumnChartBody';
import { ColumnChartStack } from './ColumnChartStack';
import { ColumnChartXAxis } from './ColumnChartXAxis';

const DESCRIPTION = [
  'Vertical stacked columns in the SimpleCharts family — a column per step (a day, an hour), split by category, with a legend over the plot that carries each category and its total.',
  'Parts stack in legend order, the first category on top. Column width adapts to the chart width and the number of steps, from 32px down to 16px.',
  'Hover a column for its breakdown; hover a legend item to fade the other categories out.',
].join(' ');

const meta = {
  title: 'Data Display/SimpleCharts/ColumnChart',
  component: ColumnChart,
  subcomponents: { ColumnChartBody, ColumnChartStack, ColumnChartXAxis },
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12612-31838',
    },
    docs: { description: { component: DESCRIPTION } },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ColumnChart>;

export default meta;

const DAY = 24 * 60 * 60 * 1000;
const START = Date.UTC(2026, 0, 1);

const verdicts: LineChartSeries[] = [
  { key: 'malicious', label: 'Malicious anomaly', color: 'red' },
  { key: 'truePositive', label: 'True positive', color: 'brand' },
  { key: 'falsePositive', label: 'False positive', color: 'amber' },
  { key: 'benign', label: 'Benign anomaly', color: 'green' },
];

const findings: LineChartDatum[] = [
  [4, 6, 38, 4],
  [5, 0, 12, 10],
  [6, 40, 34, 4],
  [6, 14, 72, 4],
  [4, 0, 1, 30],
  [3, 8, 22, 6],
  [7, 18, 46, 5],
].map(([malicious, truePositive, falsePositive, benign], i) => ({
  timestamp: START + i * DAY,
  malicious,
  truePositive,
  falsePositive,
  benign,
}));

const findingsTotals = Object.fromEntries(
  verdicts.map(s => [s.key, findings.reduce((sum, d) => sum + Number(d[s.key] ?? 0), 0)]),
);

// Fourteen days of the same verdicts — enough steps to narrow the columns below 32px.
const findings14: LineChartDatum[] = [...findings, ...findings].map((d, i) => ({
  ...d,
  timestamp: START + i * DAY,
}));

const formatYTick = (value: unknown) => formatFullNumber(Number(value));

/**
 * Findings by verdict over a week: the legend carries each verdict and its total for the
 * period, a column per day stacks the verdicts in legend order with the first on top. Hover a
 * column for the day's breakdown, or a legend item to fade the other verdicts out.
 */
export const Default: StoryFn<typeof meta> = () => {
  const { formatDate, formatDateWithTimezone } = useChartTimeFormatters();
  return (
    <div className='w-800'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Findings by verdict</ChartTitle>
        </ChartHeader>
        <ColumnChart data={findings} series={verdicts} xKey='timestamp' data-testid='column-chart'>
          <LineChartLegend>
            {verdicts.map(s => (
              <LineChartLegendItem key={s.key} seriesKey={s.key}>
                <LineChartHoverPopoverDot color={s.color} />
                <span className='text-xs font-mono text-text-primary'>{s.label}</span>
                <span className='text-xs font-mono font-medium text-text-primary'>
                  {formatFullNumber(findingsTotals[s.key] ?? 0)}
                </span>
              </LineChartLegendItem>
            ))}
          </LineChartLegend>
          <ColumnChartBody>
            <LineChartGrid />
            <ColumnChartXAxis tickFormatter={formatDate} />
            <LineChartYAxis tickFormatter={formatYTick} />
            <ColumnChartStack />
            <LineChartTooltip xTickFormatter={formatDateWithTimezone} />
          </ColumnChartBody>
        </ColumnChart>
      </Chart>
    </div>
  );
};

/**
 * Column width follows the chart width and the number of steps: up to 32px, a fixed 22px
 * between columns below that, and 16px at least. The same week in a narrow card keeps 32px
 * columns; two weeks in it narrow them.
 */
export const AdaptiveWidth: StoryFn<typeof meta> = () => {
  const { formatDate, formatDateWithTimezone } = useChartTimeFormatters();
  return (
    <div className='flex gap-16'>
      <div className='w-428'>
        <Chart>
          <ChartHeader>
            <ChartTitle>7 days</ChartTitle>
          </ChartHeader>
          <ColumnChart
            data={findings}
            series={verdicts}
            xKey='timestamp'
            data-testid='column-chart-week'
          >
            <ColumnChartBody>
              <LineChartGrid />
              <ColumnChartXAxis tickFormatter={formatDate} />
              <LineChartYAxis tickFormatter={formatYTick} />
              <ColumnChartStack />
              <LineChartTooltip xTickFormatter={formatDateWithTimezone} />
            </ColumnChartBody>
          </ColumnChart>
        </Chart>
      </div>
      <div className='w-428'>
        <Chart>
          <ChartHeader>
            <ChartTitle>14 days</ChartTitle>
          </ChartHeader>
          <ColumnChart
            data={findings14}
            series={verdicts}
            xKey='timestamp'
            data-testid='column-chart-two-weeks'
          >
            <ColumnChartBody>
              <LineChartGrid />
              <ColumnChartXAxis tickFormatter={formatDate} />
              <LineChartYAxis tickFormatter={formatYTick} />
              <ColumnChartStack />
              <LineChartTooltip xTickFormatter={formatDateWithTimezone} />
            </ColumnChartBody>
          </ColumnChart>
        </Chart>
      </div>
    </div>
  );
};

const openVerdict = fn().mockName('openVerdict');

/**
 * Legend items become buttons when they get an `onClick` — here a verdict opens its list, as
 * on the Agentic Overview. The item's `data-key` carries the series key, so one handler serves
 * every item. Hover and keyboard focus fade the other verdicts out alike.
 */
export const ClickableLegend: StoryFn<typeof meta> = () => {
  const { formatDate, formatDateWithTimezone } = useChartTimeFormatters();
  const handleLegendClick = (event: MouseEvent<HTMLDivElement>) => {
    openVerdict(event.currentTarget.dataset.key);
  };
  return (
    <div className='w-800'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Click a verdict to open it</ChartTitle>
        </ChartHeader>
        <ColumnChart data={findings} series={verdicts} xKey='timestamp' data-testid='column-chart'>
          <LineChartLegend>
            {verdicts.map(s => (
              <LineChartLegendItem key={s.key} seriesKey={s.key} onClick={handleLegendClick}>
                <LineChartHoverPopoverDot color={s.color} />
                <span className='text-xs font-mono text-text-primary'>{s.label}</span>
                <span className='text-xs font-mono font-medium text-text-primary'>
                  {formatFullNumber(findingsTotals[s.key] ?? 0)}
                </span>
              </LineChartLegendItem>
            ))}
          </LineChartLegend>
          <ColumnChartBody>
            <LineChartGrid />
            <ColumnChartXAxis tickFormatter={formatDate} />
            <LineChartYAxis tickFormatter={formatYTick} />
            <ColumnChartStack />
            <LineChartTooltip xTickFormatter={formatDateWithTimezone} />
          </ColumnChartBody>
        </ColumnChart>
      </Chart>
    </div>
  );
};

/**
 * Loading: skeleton legend items over `LineChartEmpty`'s dashed plot frame.
 */
export const Loading: StoryFn<typeof meta> = () => (
  <div className='w-800'>
    <Chart aria-busy='true' aria-live='polite'>
      <ChartHeader>
        <ChartTitle>Findings by verdict</ChartTitle>
      </ChartHeader>
      <LineChartLegend>
        {verdicts.map(s => (
          <LineChartLegendItem key={s.key} seriesKey={s.key}>
            <Skeleton width='96px' height='16px' rounded={4} />
          </LineChartLegendItem>
        ))}
      </LineChartLegend>
      <LineChartEmpty />
    </Chart>
  </div>
);

/**
 * Empty: `LineChartEmpty` keeps the dashed plot frame and puts the message inside it.
 */
export const Empty: StoryFn<typeof meta> = () => (
  <div className='w-800'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Findings by verdict</ChartTitle>
      </ChartHeader>
      <LineChartEmpty>No findings in this period</LineChartEmpty>
    </Chart>
  </div>
);
