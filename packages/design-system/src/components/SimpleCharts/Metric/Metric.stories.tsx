import type { FC, ReactNode } from 'react';

import type { Meta, StoryFn } from 'storybook-react-rsbuild';

import { Chart } from '../Chart/Chart';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import { Metric } from './Metric';
import { MetricCaption } from './MetricCaption';
import { MetricDelta } from './MetricDelta';
import { MetricHeader } from './MetricHeader';
import { MetricSkeleton } from './MetricSkeleton';
import { MetricSparkline, type MetricSparklinePoint } from './MetricSparkline';
import { MetricTotal } from './MetricTotal';
import { MetricValue } from './MetricValue';

const figmaUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11437-11939';

const sparklineFigmaUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12610-10640';

const DESCRIPTION = [
  "The family's compact stat — one number, optionally against a total and a change — for a card with no breakdown to draw; reach for `HorizontalBarStack` once that number splits into named parts.",
  'It is a brick set rather than a set of props: `MetricHeader` holds `MetricValue`, `MetricTotal` and `MetricDelta`, with `MetricCaption` beneath. On the delta, `sentiment` picks the colour and `trend` picks the arrow, on purpose independently — a number going up is not always good news.',
  "Add `MetricSparkline` after `Metric` to show the trend over the period; hover it for a point's date and value.",
].join(' ');

const meta = {
  title: 'Data Display/SimpleCharts/Metric',
  component: Metric,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: figmaUrl },
    docs: { description: { component: DESCRIPTION } },
  },
} satisfies Meta<typeof Metric>;

export default meta;

/** A single Metric composed on the Chart card, as it ships in product. */
const Card: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
  <div className='w-320'>
    <Chart>
      <ChartHeader>
        <ChartTitle>{title}</ChartTitle>
      </ChartHeader>
      {children}
    </Chart>
  </div>
);

/**
 * Every brick combination on its own card, mirroring the Figma options board: value alone,
 * value with a delta in each sentiment, and the three `MetricTotal` connectors: a slash, the
 * word "of", and the word "total" after the number.
 */
export const Gallery: StoryFn = () => (
  <div className='flex flex-wrap gap-16'>
    <Card title='Value only'>
      <Metric data-testid='metric'>
        <MetricHeader>
          <MetricValue>91</MetricValue>
        </MetricHeader>
      </Metric>
    </Card>

    <Card title='Negative — count rose'>
      <Metric>
        <MetricHeader>
          <MetricValue>91</MetricValue>
          <MetricDelta value={10} trend='up' sentiment='negative' />
        </MetricHeader>
      </Metric>
    </Card>

    <Card title='Positive — count fell'>
      <Metric>
        <MetricHeader>
          <MetricValue>74</MetricValue>
          <MetricDelta value={8} trend='down' sentiment='positive' />
        </MetricHeader>
      </Metric>
    </Card>

    <Card title='Neutral'>
      <Metric>
        <MetricHeader>
          <MetricValue>91</MetricValue>
          <MetricDelta value={10} trend='up' />
        </MetricHeader>
      </Metric>
    </Card>

    <Card title='Total — slash'>
      <Metric>
        <MetricHeader>
          <MetricValue>91</MetricValue>
          <MetricTotal connector='slash'>120</MetricTotal>
          <MetricDelta value={10} trend='up' sentiment='negative' />
        </MetricHeader>
      </Metric>
    </Card>

    <Card title='Total — of'>
      <Metric>
        <MetricHeader>
          <MetricValue>91</MetricValue>
          <MetricTotal connector='of'>120</MetricTotal>
          <MetricDelta value={10} trend='up' sentiment='negative' />
        </MetricHeader>
      </Metric>
    </Card>

    <Card title='Total — total'>
      <Metric>
        <MetricHeader>
          <MetricValue>91</MetricValue>
          <MetricTotal connector='total'>120</MetricTotal>
          <MetricDelta value={10} trend='up' sentiment='negative' />
        </MetricHeader>
      </Metric>
    </Card>

    <Card title='With caption'>
      <Metric>
        <MetricHeader>
          <MetricValue>91</MetricValue>
          <MetricDelta value={10} trend='up' sentiment='negative' />
        </MetricHeader>
        <MetricCaption>blocked today</MetricCaption>
      </Metric>
    </Card>

    <Card title='Everything'>
      <Metric>
        <MetricHeader>
          <MetricValue>91</MetricValue>
          <MetricTotal connector='of'>120</MetricTotal>
          <MetricDelta value={10} trend='up' sentiment='negative' />
        </MetricHeader>
        <MetricCaption>blocked today</MetricCaption>
      </Metric>
    </Card>
  </div>
);

/**
 * `MetricSkeleton` in place of the stat while the card loads, so the number arriving does not
 * resize the card.
 */
export const Loading: StoryFn = () => (
  <Card title='Findings'>
    <MetricSkeleton data-testid='metric-skeleton' />
  </Card>
);

const attacks: MetricSparklinePoint[] = [
  { x: new Date(2026, 0, 1), value: 14 },
  { x: new Date(2026, 0, 2), value: 11 },
  { x: new Date(2026, 0, 3), value: 11 },
  { x: new Date(2026, 0, 4), value: 11 },
  { x: new Date(2026, 0, 5), value: 16 },
  { x: new Date(2026, 0, 6), value: 18 },
  { x: new Date(2026, 0, 7), value: 20 },
  { x: new Date(2026, 0, 8), value: 19 },
  { x: new Date(2026, 0, 9), value: 13 },
];

/**
 * `MetricSparkline` after `Metric` draws the trend over the period, edge to edge along the
 * card's bottom. Hover it for a ruler on the nearest point and a popover with its date and value.
 */
export const Sparkline: StoryFn = () => (
  <div className='w-400'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Attacks</ChartTitle>
      </ChartHeader>
      <Metric>
        <MetricHeader>
          <MetricValue>91</MetricValue>
          <MetricDelta value={10} trend='up' sentiment='positive' />
        </MetricHeader>
        <MetricCaption>last 9 days</MetricCaption>
      </Metric>
      <MetricSparkline data-testid='sparkline' data={attacks} label='Attacks' />
    </Chart>
  </div>
);
Sparkline.parameters = { design: { type: 'figma', url: sparklineFigmaUrl } };

/**
 * The sparkline's `color` is set per chart, on purpose apart from the delta's `sentiment`:
 * `brand` (default), `positive`, `negative`, and `neutral`.
 */
export const SparklineColors: StoryFn = () => (
  <div className='flex flex-wrap gap-16'>
    <div className='w-256'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Negative</ChartTitle>
        </ChartHeader>
        <Metric>
          <MetricHeader>
            <MetricValue>74</MetricValue>
            <MetricDelta value={5} trend='down' sentiment='negative' />
          </MetricHeader>
          <MetricCaption>last 9 days</MetricCaption>
        </Metric>
        <MetricSparkline data={attacks} color='negative' label='Attacks' />
      </Chart>
    </div>
    <div className='w-256'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Positive</ChartTitle>
        </ChartHeader>
        <Metric>
          <MetricHeader>
            <MetricValue>91</MetricValue>
            <MetricDelta value={10} trend='up' sentiment='positive' />
          </MetricHeader>
          <MetricCaption>last 9 days</MetricCaption>
        </Metric>
        <MetricSparkline data={attacks} color='positive' label='Attacks' />
      </Chart>
    </div>
    <div className='w-256'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Brand</ChartTitle>
        </ChartHeader>
        <Metric>
          <MetricHeader>
            <MetricValue>91</MetricValue>
            <MetricDelta value={10} trend='up' sentiment='positive' />
          </MetricHeader>
          <MetricCaption>last 9 days</MetricCaption>
        </Metric>
        <MetricSparkline data={attacks} label='Attacks' />
      </Chart>
    </div>
    <div className='w-256'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Neutral</ChartTitle>
        </ChartHeader>
        <Metric>
          <MetricHeader>
            <MetricValue>91</MetricValue>
            <MetricDelta value={10} trend='up' sentiment='positive' />
          </MetricHeader>
          <MetricCaption>last 9 days</MetricCaption>
        </Metric>
        <MetricSparkline data={attacks} color='neutral' label='Attacks' />
      </Chart>
    </div>
  </div>
);
SparklineColors.parameters = { design: { type: 'figma', url: sparklineFigmaUrl } };
