import type { MouseEvent } from 'react';
import { fn } from 'storybook/test';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { formatFullNumber } from '../../../utils/abbreviateNumber';
import { Skeleton } from '../../Skeleton';
import { Chart } from '../Chart/Chart';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import type { LineChartDatum, LineChartSeries } from '../LineChart/LineChartContext';
import { LineChartHoverPopoverDot } from '../LineChart/LineChartHoverPopoverDot';
import { LineChartLegend } from '../LineChart/LineChartLegend';
import { LineChartLegendItem } from '../LineChart/LineChartLegendItem';
import { BarChart } from './BarChart';
import { BarChartBody } from './BarChartBody';
import { BarChartEmpty } from './BarChartEmpty';
import { BarChartGrid } from './BarChartGrid';
import { BarChartStack } from './BarChartStack';
import { BarChartTooltip } from './BarChartTooltip';
import { BarChartXAxis } from './BarChartXAxis';
import { BarChartYAxis } from './BarChartYAxis';

const DESCRIPTION = [
  'Horizontal stacked bars in the SimpleCharts family — a bar per category (an application, a host, an endpoint), split by series, with a legend over the plot that carries each series and its total.',
  'Categories run down the left in the order you pass them; parts stack from the axis outwards in legend order, the first series on the axis. Every row is 28px, so the chart grows with the number of categories.',
  'Hover a bar for its breakdown; hover a legend item to fade the other series out.',
].join(' ');

const meta = {
  title: 'Data Display/SimpleCharts/Horizontal Stacked Bars Chart',
  component: BarChart,
  subcomponents: {
    BarChartBody,
    BarChartEmpty,
    BarChartGrid,
    BarChartStack,
    BarChartTooltip,
    BarChartXAxis,
    BarChartYAxis,
  },
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BarChart>;

export default meta;

const verdicts: LineChartSeries[] = [
  { key: 'malicious', label: 'Malicious anomaly', color: 'red' },
  { key: 'truePositive', label: 'True positive', color: 'brand' },
  { key: 'falsePositive', label: 'False positive', color: 'amber' },
  { key: 'benign', label: 'Benign anomaly', color: 'green' },
];

const toRows = (rows: [string, number, number, number, number][]): LineChartDatum[] =>
  rows.map(([application, malicious, truePositive, falsePositive, benign]) => ({
    application,
    malicious,
    truePositive,
    falsePositive,
    benign,
  }));

// Sorted by total, largest first — the chart keeps the order it is given.
const findings = toRows([
  ['Payments API', 12, 40, 34, 4],
  ['Checkout', 6, 14, 52, 4],
  ['Auth service', 4, 6, 38, 4],
  ['Search', 3, 8, 22, 6],
  ['Admin panel', 5, 0, 12, 10],
]);

const totalsOf = (data: LineChartDatum[]) =>
  Object.fromEntries(
    verdicts.map(s => [s.key, data.reduce((sum, d) => sum + Number(d[s.key] ?? 0), 0)]),
  );

const findingsTotals = totalsOf(findings);

const formatValueTick = (value: unknown) => formatFullNumber(Number(value));

const Legend = ({
  totals,
  onClick,
}: {
  totals?: Record<string, number>;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
}) => (
  <LineChartLegend>
    {verdicts.map(s => (
      <LineChartLegendItem key={s.key} seriesKey={s.key} onClick={onClick}>
        <LineChartHoverPopoverDot color={s.color} />
        <span className='text-xs font-mono text-text-primary'>{s.label}</span>
        {totals && (
          <span className='text-xs font-mono font-medium text-text-primary'>
            {formatFullNumber(totals[s.key] ?? 0)}
          </span>
        )}
      </LineChartLegendItem>
    ))}
  </LineChartLegend>
);

/**
 * Findings by application: the legend carries each verdict and its total, a bar per application
 * stacks the verdicts from the axis outwards in legend order. Hover a bar for the application's
 * breakdown, or a legend item to fade the other verdicts out.
 */
export const Default: StoryFn<typeof meta> = () => (
  <div className='w-600'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Findings by application</ChartTitle>
      </ChartHeader>
      <BarChart data={findings} series={verdicts} yKey='application' data-testid='bar-chart'>
        <Legend totals={findingsTotals} />
        <BarChartBody>
          <BarChartGrid />
          <BarChartXAxis tickFormatter={formatValueTick} />
          <BarChartYAxis />
          <BarChartStack />
          <BarChartTooltip />
        </BarChartBody>
      </BarChart>
    </Chart>
  </div>
);

const hosts = toRows([
  ['api.payments.example.com', 18, 22, 40, 6],
  ['checkout.example.com', 4, 12, 30, 8],
  ['internal-admin.eu-west-1.example.com', 2, 4, 18, 12],
  ['cdn.example.com', 0, 0, 6, 20],
]);

/**
 * The label gutter is 96px by default; a longer category is cut with an ellipsis, and the
 * hover popover shows it in full. Pass `width` to `BarChartYAxis` to widen the gutter.
 */
export const LongLabels: StoryFn<typeof meta> = () => (
  <div className='flex flex-col gap-16 w-600'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Default gutter — 96px</ChartTitle>
      </ChartHeader>
      <BarChart data={hosts} series={verdicts} yKey='application' data-testid='bar-chart-narrow'>
        <BarChartBody>
          <BarChartGrid />
          <BarChartXAxis tickFormatter={formatValueTick} />
          <BarChartYAxis />
          <BarChartStack />
          <BarChartTooltip />
        </BarChartBody>
      </BarChart>
    </Chart>
    <Chart>
      <ChartHeader>
        <ChartTitle>Wide gutter — 200px</ChartTitle>
      </ChartHeader>
      <BarChart data={hosts} series={verdicts} yKey='application' data-testid='bar-chart-wide'>
        <BarChartBody>
          <BarChartGrid />
          <BarChartXAxis tickFormatter={formatValueTick} />
          <BarChartYAxis width={200} />
          <BarChartStack />
          <BarChartTooltip />
        </BarChartBody>
      </BarChart>
    </Chart>
  </div>
);

const twoRows = findings.slice(0, 2);
const tenRows = toRows([
  ['Payments API', 12, 40, 34, 4],
  ['Checkout', 6, 14, 52, 4],
  ['Auth service', 4, 6, 38, 4],
  ['Search', 3, 8, 22, 6],
  ['Admin panel', 5, 0, 12, 10],
  ['Notifications', 2, 6, 14, 3],
  ['Reports', 1, 4, 12, 6],
  ['Billing', 3, 2, 8, 4],
  ['Webhooks', 0, 3, 9, 2],
  ['Profile', 1, 1, 4, 5],
]);

/**
 * Every row is 28px — a 16px bar and 12px between bars — so the card grows with the number
 * of categories instead of squeezing them. Two categories make a short card, ten a tall one.
 */
export const RowCount: StoryFn<typeof meta> = () => (
  <div className='flex flex-col gap-16 w-600'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Top 2 applications</ChartTitle>
      </ChartHeader>
      <BarChart data={twoRows} series={verdicts} yKey='application' data-testid='bar-chart-two'>
        <BarChartBody>
          <BarChartGrid />
          <BarChartXAxis tickFormatter={formatValueTick} />
          <BarChartYAxis />
          <BarChartStack />
          <BarChartTooltip />
        </BarChartBody>
      </BarChart>
    </Chart>
    <Chart>
      <ChartHeader>
        <ChartTitle>Top 10 applications</ChartTitle>
      </ChartHeader>
      <BarChart data={tenRows} series={verdicts} yKey='application' data-testid='bar-chart-ten'>
        <Legend totals={totalsOf(tenRows)} />
        <BarChartBody>
          <BarChartGrid />
          <BarChartXAxis tickFormatter={formatValueTick} />
          <BarChartYAxis />
          <BarChartStack />
          <BarChartTooltip />
        </BarChartBody>
      </BarChart>
    </Chart>
  </div>
);

const openVerdict = fn().mockName('openVerdict');

/**
 * Legend items become buttons when they get an `onClick` — here a verdict opens its list. The
 * item's `data-key` carries the series key, so one handler serves every item. Hover and
 * keyboard focus fade the other verdicts out alike.
 */
export const ClickableLegend: StoryFn<typeof meta> = () => {
  const handleLegendClick = (event: MouseEvent<HTMLDivElement>) => {
    openVerdict(event.currentTarget.dataset.key);
  };
  return (
    <div className='w-600'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Click a verdict to open it</ChartTitle>
        </ChartHeader>
        <BarChart data={findings} series={verdicts} yKey='application' data-testid='bar-chart'>
          <Legend totals={findingsTotals} onClick={handleLegendClick} />
          <BarChartBody>
            <BarChartGrid />
            <BarChartXAxis tickFormatter={formatValueTick} />
            <BarChartYAxis />
            <BarChartStack />
            <BarChartTooltip />
          </BarChartBody>
        </BarChart>
      </Chart>
    </div>
  );
};

/**
 * Loading: skeleton legend items over `BarChartEmpty`'s bare frame — the dashed value grid and
 * the category axis. `rows` sizes it for the bars to come, so the card does not jump on load.
 */
export const Loading: StoryFn<typeof meta> = () => (
  <div className='w-600'>
    <Chart aria-busy='true' aria-live='polite'>
      <ChartHeader>
        <ChartTitle>Findings by application</ChartTitle>
      </ChartHeader>
      <LineChartLegend>
        {verdicts.map(s => (
          <LineChartLegendItem key={s.key} seriesKey={s.key}>
            <Skeleton width='96px' height='16px' rounded={4} />
          </LineChartLegendItem>
        ))}
      </LineChartLegend>
      <BarChartEmpty rows={findings.length} data-testid='bar-chart-empty' />
    </Chart>
  </div>
);

/**
 * Empty: `BarChartEmpty` keeps the plot frame and centres the message on it.
 */
export const Empty: StoryFn<typeof meta> = () => (
  <div className='w-600'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Findings by application</ChartTitle>
      </ChartHeader>
      <BarChartEmpty data-testid='bar-chart-empty'>No findings in this period</BarChartEmpty>
    </Chart>
  </div>
);
