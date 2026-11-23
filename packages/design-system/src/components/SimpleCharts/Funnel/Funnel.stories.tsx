import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Text } from '../../Text';
import { Chart } from '../Chart/Chart';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import { MetricDelta } from '../Metric/MetricDelta';
import type { ChartColor } from '../types';
import { Funnel } from './Funnel';
import { FunnelSkeleton } from './FunnelSkeleton';
import { FunnelStep } from './FunnelStep';

interface Step {
  name: string;
  value: number;
  caption?: string;
}

const falsePositives: Step[] = [
  { name: 'Detected', value: 1284, caption: 'Hits flagged by detection in the last 7 days' },
  { name: 'Reviewed', value: 312, caption: 'Checked by the agent' },
  { name: 'Marked false', value: 96 },
];

const sixSteps: Step[] = [
  { name: 'Requests', value: 48200 },
  { name: 'Suspicious', value: 21400 },
  { name: 'Attacks', value: 9800 },
  { name: 'Grouped', value: 4100 },
  { name: 'Reviewed', value: 1700 },
  { name: 'Blocked', value: 620 },
];

// Stands in for a real action in stories that only need the interactive look.
const openList = () => undefined;

const EVERYDAY_HUES: ChartColor[] = ['blue', 'red', 'green', 'amber', 'purple'];
const RARE_HUES: ChartColor[] = ['brand', 'teal', 'cyan', 'indigo', 'pink', 'rose'];

const DESCRIPTION = [
  'A horizontal step funnel for a dashboard card: how a count narrows from stage to stage, left to right.',
  'You render a `FunnelStep` per stage, 2 to 6 of them; each takes a `name`, a `value` and optionally a `caption`, a `delta` and an `onClick`. The ribbon scales to the largest step and is decorative — the title cells carry the numbers.',
  'The root picks the hue with `color` and the ramp start with `start`. `FunnelSkeleton` covers the loading state.',
].join(' ');

const meta = {
  title: 'Data Display/SimpleCharts/Funnel',
  component: Funnel,
  subcomponents: { FunnelStep, FunnelSkeleton },
  parameters: {
    layout: 'padded',
    docs: { description: { component: DESCRIPTION } },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Funnel>;

export default meta;

/**
 * The card as designed: three steps in a 465px card. Every step here has an action, so
 * its title cell is a button — hover it, or tab to it and press Enter. The analytics
 * attributes go on `FunnelStep` and land on that button.
 */
export const Default: StoryFn<typeof meta> = () => {
  const [opened, setOpened] = useState<string | null>(null);

  return (
    <div className='flex w-465 flex-col gap-8'>
      <Chart>
        <ChartHeader>
          <ChartTitle>False positives</ChartTitle>
        </ChartHeader>
        <Funnel data-testid='funnel'>
          {falsePositives.map(step => (
            <FunnelStep
              key={step.name}
              name={step.name}
              value={step.value}
              caption={step.caption}
              data-analytics-id='false-positives-step'
              onClick={() => setOpened(step.name)}
            />
          ))}
        </Funnel>
      </Chart>
      <Text size='xs' color='secondary' data-testid='funnel-opened'>
        {opened ? `Opened: ${opened}` : 'Click a step to open its list'}
      </Text>
    </div>
  );
};

/** Without an `onClick` a step is plain text: no hover, no focus stop. */
export const Static: StoryFn<typeof meta> = () => (
  <div className='w-465'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Anomalies</ChartTitle>
      </ChartHeader>
      <Funnel data-testid='funnel'>
        <FunnelStep name='Sessions' value={860} caption='Seen this week' />
        <FunnelStep name='Anomalous' value={214} />
        <FunnelStep name='Confirmed' value={38} />
      </Funnel>
    </Chart>
  </div>
);

/**
 * The hue is not semantic. Blue, red, green, amber and purple are the everyday set;
 * the second group is for rare cases.
 */
export const Hues: StoryFn<typeof meta> = () => (
  <div className='grid grid-cols-2 gap-16'>
    {[...EVERYDAY_HUES, ...RARE_HUES].map(color => (
      <Chart key={color}>
        <ChartHeader>
          <ChartTitle>{color}</ChartTitle>
        </ChartHeader>
        <Funnel color={color}>
          {falsePositives.map(step => (
            <FunnelStep key={step.name} name={step.name} value={step.value} />
          ))}
        </Funnel>
      </Chart>
    ))}
  </div>
);

/** `start='gray'`: the first step in slate, the rest in the hue at full strength. */
export const GrayStart: StoryFn<typeof meta> = () => (
  <div className='w-465'>
    <Chart>
      <ChartHeader>
        <ChartTitle>False positives</ChartTitle>
      </ChartHeader>
      <Funnel start='gray' data-testid='funnel'>
        {falsePositives.map(step => (
          <FunnelStep key={step.name} name={step.name} value={step.value} />
        ))}
      </Funnel>
    </Chart>
  </div>
);

/**
 * Two to six steps. The ramp adds one palette step per stage, so more steps start
 * lighter. Steps share the width equally and never go under 120px — size the card
 * for the count.
 */
export const StepCounts: StoryFn<typeof meta> = () => (
  <div className='flex flex-col gap-16'>
    {[2, 3, 4, 5, 6].map(count => (
      <div key={count} style={{ width: Math.max(count * 155, 310) }}>
        <Chart>
          <ChartHeader>
            <ChartTitle>{count} steps</ChartTitle>
          </ChartHeader>
          <Funnel>
            {sixSteps.slice(0, count).map(step => (
              <FunnelStep key={step.name} name={step.name} value={step.value} />
            ))}
          </Funnel>
        </Chart>
      </div>
    ))}
  </div>
);

/** Steps do not have to shrink: a later step can count another unit and be bigger. */
export const BiggerLaterStep: StoryFn<typeof meta> = () => (
  <div className='w-465'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Rules from groups</ChartTitle>
      </ChartHeader>
      <Funnel color='purple' data-testid='funnel'>
        <FunnelStep name='Attacks' value={540} />
        <FunnelStep name='Groups' value={42} />
        <FunnelStep name='Rules' value={180} caption='Several rules per group' />
      </Funnel>
    </Chart>
  </div>
);

/** A step is never thinner than a 1px hairline, and a zero draws the same line with the label 0. */
export const TinyStep: StoryFn<typeof meta> = () => (
  <div className='w-620'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Escalations</ChartTitle>
      </ChartHeader>
      <Funnel color='red' data-testid='funnel'>
        <FunnelStep name='Events' value={1000} />
        <FunnelStep name='Incidents' value={100} />
        <FunnelStep name='Escalated' value={1} />
        <FunnelStep name='Breaches' value={0} />
      </Funnel>
    </Chart>
  </div>
);

/**
 * Names stay on one line, captions on two, and a value shows what fits. Numbers from
 * 1,000 up are rounded and abbreviated.
 */
export const LongContent: StoryFn<typeof meta> = () => (
  <div className='w-465'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Long content</ChartTitle>
      </ChartHeader>
      <Funnel color='green' data-testid='funnel'>
        <FunnelStep
          name='Requests inspected by the detection layer'
          value={59614283}
          caption='Every request that reached the node during the selected period, including retries'
        />
        <FunnelStep
          name='Matched at least one rule'
          value={1284096}
          delta={<MetricDelta value={12840} trend='up' sentiment='negative' />}
          caption='Counted once per request'
        />
        <FunnelStep name='Blocked' value={98431} />
      </Funnel>
    </Chart>
  </div>
);

/** The delta is optional and sits right after the value. What it compares is up to the product. */
export const WithDelta: StoryFn<typeof meta> = () => (
  <div className='w-465'>
    <Chart>
      <ChartHeader>
        <ChartTitle>False positives</ChartTitle>
      </ChartHeader>
      <Funnel data-testid='funnel'>
        <FunnelStep name='Detected' value={842} />
        <FunnelStep
          name='Reviewed'
          value={312}
          delta={<MetricDelta value={24} trend='up' sentiment='positive' />}
        />
        <FunnelStep
          name='Marked false'
          value={96}
          delta={<MetricDelta value={8} trend='down' sentiment='negative' />}
        />
      </Funnel>
    </Chart>
  </div>
);

/** Loading: an empty plot with only the step dividers, the same height as the funnel. */
export const Loading: StoryFn<typeof meta> = () => (
  <div className='w-465'>
    <Chart>
      <ChartHeader>
        <ChartTitle>False positives</ChartTitle>
      </ChartHeader>
      <FunnelSkeleton data-testid='funnel-skeleton' />
    </Chart>
  </div>
);

/** With no steps the funnel shows the family's "No data" frame in its place. */
export const Empty: StoryFn<typeof meta> = () => (
  <div className='w-465'>
    <Chart>
      <ChartHeader>
        <ChartTitle>False positives</ChartTitle>
      </ChartHeader>
      <Funnel data-testid='funnel' />
    </Chart>
  </div>
);

/**
 * On the dark theme every shade flips to 1000 minus it, so the ramp still runs from
 * faint to strong against the dark card.
 */
export const Dark: StoryFn<typeof meta> = () => (
  <div data-theme='dark' className='flex w-962 flex-col gap-16 bg-bg-page-bg p-16'>
    <div className='grid grid-cols-2 gap-16'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Tint</ChartTitle>
        </ChartHeader>
        <Funnel>
          {falsePositives.map(step => (
            <FunnelStep key={step.name} name={step.name} value={step.value} onClick={openList} />
          ))}
        </Funnel>
      </Chart>
      <Chart>
        <ChartHeader>
          <ChartTitle>Gray start</ChartTitle>
        </ChartHeader>
        <Funnel start='gray' color='red'>
          {falsePositives.map(step => (
            <FunnelStep key={step.name} name={step.name} value={step.value} />
          ))}
        </Funnel>
      </Chart>
    </div>
    <Chart>
      <ChartHeader>
        <ChartTitle>6 steps</ChartTitle>
      </ChartHeader>
      <Funnel>
        {sixSteps.map(step => (
          <FunnelStep key={step.name} name={step.name} value={step.value} />
        ))}
      </Funnel>
    </Chart>
  </div>
);
