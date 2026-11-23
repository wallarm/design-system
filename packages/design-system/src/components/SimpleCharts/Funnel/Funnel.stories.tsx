import { type FC, type ReactNode, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Chart, ChartEmpty, ChartHeader, ChartTitle } from '../Chart';
import { MetricDelta } from '../Metric';
import type { FunnelColor } from './constants';
import { Funnel } from './Funnel';
import { FunnelSkeleton } from './FunnelSkeleton';
import { FunnelStep } from './FunnelStep';

const DESCRIPTION = [
  'A horizontal funnel for a flow that narrows from step to step — a title cell per stage (name, count, optional delta and caption) above one smooth ribbon scaled to the largest step. Reach for `BarList` when the rows are independent categories rather than consecutive stages.',
  'Pass `FunnelStep` elements as direct children (2–6 of them); the ramp runs light to dark in the chosen `color`, or starts from gray with `start="gray"`. A step with `onClick` becomes a real button.',
].join(' ');

const meta = {
  title: 'Data Display/SimpleCharts/Funnel',
  component: Funnel,
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
  args: {
    // Base for derived slot ids (`funnel--step`, `funnel--step--delta`, `funnel--ribbon`) used by e2e tests.
    'data-testid': 'funnel',
  },
  argTypes: {
    children: { control: false },
    ref: { control: false },
    className: { control: 'text' },
    color: {
      control: 'select',
      options: [
        'blue',
        'red',
        'green',
        'amber',
        'purple',
        'brand',
        'teal',
        'cyan',
        'indigo',
        'pink',
        'rose',
      ],
    },
    start: { control: 'inline-radio' },
  },
} satisfies Meta<typeof Funnel>;

export default meta;

interface Datum {
  name: string;
  value: number;
  caption?: string;
}

const falsePositives: Datum[] = [
  { name: 'Detected', value: 1200, caption: 'All flagged requests' },
  { name: 'Reviewed', value: 430, caption: 'Checked by an analyst' },
  { name: 'Confirmed FP', value: 310, caption: 'Marked as false positive' },
];

const sixSteps: Datum[] = [
  { name: 'Visited', value: 5000, caption: 'Opened the console' },
  { name: 'Signed up', value: 3200, caption: 'Created an account' },
  { name: 'Connected', value: 2100, caption: 'Added a first node' },
  { name: 'Configured', value: 1400, caption: 'Set up a policy' },
  { name: 'Blocking', value: 800, caption: 'Switched to blocking' },
  { name: 'Retained', value: 450, caption: 'Active after 30 days' },
];

const steps = (data: Datum[]) =>
  data.map(d => <FunnelStep key={d.name} name={d.name} value={d.value} caption={d.caption} />);

const Card: FC<{ title?: string; wide?: boolean; children: ReactNode }> = ({
  title = 'False positives',
  wide,
  children,
}) => (
  <Chart className={wide ? 'w-[760px]' : 'w-[465px]'}>
    <ChartHeader>
      <ChartTitle>{title}</ChartTitle>
    </ChartHeader>
    {children}
  </Chart>
);

/**
 * Three steps with captions and a delta on the last one. Every step is a button — click one
 * and the line under the card records it. Each button carries `data-analytics-id` and
 * `data-analytics-props` for click tracking.
 */
export const Default: StoryFn<typeof meta> = args => {
  const [last, setLast] = useState<string>('none');
  return (
    <div className='flex flex-col gap-8'>
      <Card>
        <Funnel {...args}>
          {falsePositives.map((d, i) => (
            <FunnelStep
              key={d.name}
              name={d.name}
              value={d.value}
              caption={d.caption}
              delta={
                i === 2 ? <MetricDelta value={12} sentiment='negative' trend='up' /> : undefined
              }
              data-analytics-id={`FUNNEL_STEP_${d.name.toUpperCase().replace(/\W+/g, '_')}`}
              data-analytics-props={JSON.stringify({ feature: 'funnel', step: i + 1 })}
              onClick={() => setLast(d.name)}
            />
          ))}
        </Funnel>
      </Card>
      <p data-testid='funnel-last-action' className='text-xs text-text-secondary'>
        Last action: {last}
      </p>
    </div>
  );
};

/**
 * The five main hues. The ramp always runs from a light tint to the hue's strong end.
 */
export const AllHues: StoryFn<typeof meta> = args => (
  <div className='flex flex-col gap-16'>
    {(['blue', 'red', 'green', 'amber', 'purple'] as const satisfies FunnelColor[]).map(color => (
      <Card key={color} title={color}>
        <Funnel {...args} color={color} data-testid={`funnel-${color}`}>
          {steps(falsePositives)}
        </Funnel>
      </Card>
    ))}
  </div>
);

/**
 * `start="gray"` makes the first step slate and puts the rest on the hue's strong end — for a
 * funnel whose entry is context rather than a result.
 */
export const GrayStart: StoryFn<typeof meta> = args => (
  <Card>
    <Funnel {...args} start='gray'>
      {steps(falsePositives)}
    </Funnel>
  </Card>
);

/**
 * From two to six steps. Give the card enough width that each column stays around 120px; a
 * narrower card scrolls horizontally instead of hiding steps.
 */
export const StepsByCount: StoryFn<typeof meta> = args => (
  <div className='flex flex-col gap-16'>
    {[2, 3, 4, 5, 6].map(n => (
      <Card key={n} title={`${n} steps`} wide={n > 3}>
        <Funnel {...args} data-testid={`funnel-${n}`}>
          {steps(sixSteps.slice(0, n))}
        </Funnel>
      </Card>
    ))}
  </div>
);

/**
 * A later step may exceed an earlier one — the ribbon is scaled to the largest step, not the first.
 */
export const BiggerLaterStep: StoryFn<typeof meta> = args => (
  <Card>
    <Funnel {...args}>
      {steps([
        { name: 'Scanned', value: 400, caption: 'Endpoints checked' },
        { name: 'Findings', value: 1200, caption: 'One endpoint, many issues' },
        { name: 'Fixed', value: 300, caption: 'Resolved findings' },
      ])}
    </Funnel>
  </Card>
);

/**
 * A step that is a sliver of the first (1000 → 100 → 1) still keeps a visible minimum body.
 */
export const TinyStep: StoryFn<typeof meta> = args => (
  <Card>
    <Funnel {...args}>
      {steps([
        { name: 'Requests', value: 1000, caption: 'All traffic' },
        { name: 'Suspicious', value: 100, caption: 'Matched a rule' },
        { name: 'Blocked', value: 1, caption: 'Stopped at the edge' },
      ])}
    </Funnel>
  </Card>
);

/**
 * Long names truncate to one line and captions to two, so the cells keep their height.
 */
export const LongContent: StoryFn<typeof meta> = args => (
  <Card>
    <Funnel {...args}>
      {steps([
        {
          name: 'Detected by the signature engine and the anomaly model',
          value: 1234567,
          caption:
            'Every request flagged by any detection source during the selected period, before triage',
        },
        {
          name: 'Reviewed by an analyst on the security team',
          value: 430000,
          caption:
            'Requests that an analyst opened, read and assigned a verdict to during the review window',
        },
        {
          name: 'Confirmed as a false positive after review',
          value: 310000,
          caption: 'Marked as false positive and excluded from future alerts for this application',
        },
      ])}
    </Funnel>
  </Card>
);

/**
 * `delta` takes a `MetricDelta`, shown right after the value — any step can carry one.
 */
export const WithDelta: StoryFn<typeof meta> = args => (
  <Card>
    <Funnel {...args}>
      <FunnelStep
        name='Detected'
        value={1200}
        caption='All flagged requests'
        delta={<MetricDelta value={5} sentiment='positive' trend='up' />}
      />
      <FunnelStep
        name='Reviewed'
        value={430}
        caption='Checked by an analyst'
        delta={<MetricDelta value={8} sentiment='negative' trend='down' />}
      />
      <FunnelStep
        name='Confirmed FP'
        value={310}
        caption='Marked as false positive'
        delta={<MetricDelta value={12} sentiment='negative' trend='up' />}
      />
    </Funnel>
  </Card>
);

/**
 * `FunnelSkeleton` holds the frame and the step dividers while the data loads.
 */
export const Loading: StoryFn<typeof meta> = () => (
  <Card>
    <FunnelSkeleton data-testid='funnel-skeleton' />
  </Card>
);

/**
 * With no steps to draw, show `ChartEmpty` inside the card instead.
 */
export const Empty: StoryFn<typeof meta> = () => (
  <Card>
    <ChartEmpty>No data for this period</ChartEmpty>
  </Card>
);

/**
 * The ramp, dividers and cells follow the `data-theme="dark"` ancestor.
 */
export const DarkTheme: StoryFn<typeof meta> = args => (
  <div data-theme='dark' className='bg-bg-surface-1 p-16'>
    <Card>
      <Funnel {...args}>{steps(falsePositives)}</Funnel>
    </Card>
  </div>
);
