import type { FC, ReactNode } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Chart } from '../Chart/Chart';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import { Metric } from './Metric';
import { MetricCaption } from './MetricCaption';
import { MetricDelta } from './MetricDelta';
import { MetricHeader } from './MetricHeader';
import { MetricTotal } from './MetricTotal';
import { MetricValue } from './MetricValue';

const figmaUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11437-11939';

const meta = {
  title: 'Data display/SimpleCharts/Metric',
  component: Metric,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: figmaUrl },
    docs: {
      description: {
        component:
          'The family’s compact stat, composed as a brick set: `MetricHeader` (the shared value/total/delta row, also reused by `HorizontalBarStack`), `MetricValue`, `MetricTotal` (`/120` · `of 120` · `120 total`), `MetricDelta`, and `MetricCaption`. Body-only — composed inside a `Chart` card. The delta is the shared `ChartDelta`: `sentiment` sets the colour (positive → green, negative → red, neutral → slate) independently of the `trend` arrow.',
      },
    },
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
 * One gallery of the brick combinations, each on a Chart card — mirrors the Figma
 * "Metric Chart — options" board. Replaces the old one-story-per-config set.
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
