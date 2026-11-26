import { type FC, type ReactNode, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Button } from '../../Button';
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

const MAIN_HUES = ['blue', 'red', 'green', 'amber', 'purple'] as const satisfies FunnelColor[];
const RARE_HUES = [
  'brand',
  'teal',
  'cyan',
  'indigo',
  'pink',
  'rose',
] as const satisfies FunnelColor[];

/** One row per hue: gray start on the left, tint on the right. */
const HueGrid: FC<{ hues: readonly FunnelColor[] }> = ({ hues }) => (
  <div className='grid grid-cols-2 gap-16'>
    {hues.map(color =>
      (['gray', 'tint'] as const).map(start => (
        <Card key={`${color}-${start}`} title={`${color} · ${start}`}>
          <Funnel color={color} start={start} data-testid={`funnel-${color}-${start}`}>
            {steps(falsePositives)}
          </Funnel>
        </Card>
      )),
    )}
  </div>
);

/**
 * Every `color`, at the default `start="tint"`. Use the everyday hues first; the rare ones are for
 * a funnel that has to match something already on the page. Colour is not semantic — red is just
 * a hue here, not danger. Halos are the step colour at 32% and 16%.
 */
export const Colors: StoryFn<typeof meta> = () => (
  <div className='flex flex-col gap-24'>
    {(
      [
        ['Everyday', MAIN_HUES],
        ['Rare', RARE_HUES],
      ] as const
    ).map(([label, hues]) => (
      <section key={label} className='flex flex-col gap-12'>
        <h3 className='text-sm font-medium text-text-primary'>{label}</h3>
        <div className='grid grid-cols-2 gap-16'>
          {hues.map(color => (
            <Card key={color} title={color}>
              <Funnel color={color} data-testid={`funnel-${color}`}>
                {steps(falsePositives)}
              </Funnel>
            </Card>
          ))}
        </div>
      </section>
    ))}
  </div>
);

/**
 * The first step: `start="gray"` (option) draws it in slate/300 and the rest in the hue at 600 —
 * for a funnel whose entry is context rather than a result. `start="tint"` (default) runs one
 * palette step per stage, light to dark, ending on 600.
 */
export const GrayStart: StoryFn<typeof meta> = args => (
  <div className='flex gap-16'>
    <Card title='gray'>
      <Funnel {...args} start='gray'>
        {steps(falsePositives)}
      </Funnel>
    </Card>
    <Card title='tint'>
      <Funnel {...args} start='tint'>
        {steps(falsePositives)}
      </Funnel>
    </Card>
  </div>
);

/**
 * From two to six steps, one palette step per stage and 600 always in: 500→600, 400→600,
 * 400→700, 300→700, 200→700. Switch `color` in the controls to see each hue's ramp. Give the
 * card enough width that each column stays around 120px; a narrower card scrolls horizontally
 * instead of hiding steps.
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
 * `FunnelSkeleton` holds the card while the data loads: the step dividers, a shimmer per title line and a funnel silhouette in place of the ribbon, at the loaded height so nothing jumps.
 */
export const Loading: StoryFn<typeof meta> = () => (
  <Card>
    <FunnelSkeleton data-testid='funnel-skeleton' />
  </Card>
);

/**
 * The entrance plays when the data arrives: swap `FunnelSkeleton` for `Funnel` and each band grows
 * from its left edge, one step after another, with the labels fading in just behind. Press the
 * button to load (or reload) the data. Under `prefers-reduced-motion` the funnel appears at once.
 */
export const Entrance: StoryFn<typeof meta> = args => {
  const [loads, setLoads] = useState(0);
  const handleLoad = () => setLoads(n => n + 1);
  return (
    <div className='flex flex-col items-start gap-8'>
      <Card>
        {loads === 0 ? (
          <FunnelSkeleton data-testid='funnel-skeleton' />
        ) : (
          // A new key remounts the funnel, so every load replays the entrance.
          <Funnel key={loads} {...args}>
            {steps(falsePositives)}
          </Funnel>
        )}
      </Card>
      <Button data-testid='funnel-load' variant='outline' color='neutral' onClick={handleLoad}>
        {loads === 0 ? 'Load data' : 'Reload'}
      </Button>
    </div>
  );
};

/**
 * With no steps to draw, show `ChartEmpty` inside the card instead.
 */
export const Empty: StoryFn<typeof meta> = () => (
  <Card>
    <ChartEmpty>No data for this period</ChartEmpty>
  </Card>
);

/**
 * Every hue in both starts, plus a six-step ramp, under a `data-theme="dark"` ancestor. Each
 * shade flips to 1000 minus it: 600 → 400, 200 → 800, slate/300 → slate/700.
 */
export const DarkTheme: StoryFn<typeof meta> = () => (
  <div data-theme='dark' className='flex flex-col gap-16 bg-bg-surface-1 p-16'>
    <HueGrid hues={[...MAIN_HUES, ...RARE_HUES]} />
    <Card title='6 steps' wide>
      <Funnel data-testid='funnel-dark-6'>{steps(sixSteps)}</Funnel>
    </Card>
  </div>
);
