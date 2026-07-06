import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Chart } from '../Chart/Chart';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import { Metric, type MetricProps } from './Metric';

const figmaUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11437-11939';

const meta = {
  title: 'Data display/SimpleCharts/Metric',
  component: Metric,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: figmaUrl },
    docs: {
      description: {
        component:
          'A headline value with an optional `/ total` denominator, an optional trend delta chip, and an optional caption — nothing else. The standalone stat sibling of `HorizontalBarStack` (same value/total/delta header, without the bar or legend). Composed inside a `Chart` card. The delta is the shared `ChartDelta`: `sentiment` sets the colour (positive → green, negative → w-orange, neutral → slate) independently of the `trend` arrow.',
      },
    },
  },
  args: {
    // Base for the derived slot ids (`metric--value`, `metric--delta`, …) used by e2e tests.
    'data-testid': 'metric',
  },
  argTypes: {
    delta: { control: false },
    caption: { control: 'text' },
    ref: { control: false },
    className: { control: 'text' },
  },
} satisfies Meta<typeof Metric>;

export default meta;

const Frame: StoryFn<MetricProps> = args => (
  <div className='w-400'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Findings</ChartTitle>
      </ChartHeader>
      <Metric {...args} />
    </Chart>
  </div>
);

// Count rose — read as bad → negative (w-orange) with an up arrow.
export const Default: StoryFn<MetricProps> = Frame.bind({});
Default.args = { value: 91, delta: { value: 10, trend: 'up', sentiment: 'negative' } };

// Count fell — read as good → positive (green) with a down arrow.
export const Positive: StoryFn<MetricProps> = Frame.bind({});
Positive.args = { value: 74, delta: { value: 8, trend: 'down', sentiment: 'positive' } };

// No judgement → neutral (slate). Sentiment defaults to neutral when omitted.
export const Neutral: StoryFn<MetricProps> = Frame.bind({});
Neutral.args = { value: 91, delta: { value: 10, trend: 'up' } };

// Value out of a total → "91 /120 total".
export const WithTotal: StoryFn<MetricProps> = Frame.bind({});
WithTotal.args = { value: 91, total: 120, delta: { value: 10, trend: 'up', sentiment: 'negative' } };

// Secondary caption under the value.
export const WithCaption: StoryFn<MetricProps> = Frame.bind({});
WithCaption.args = {
  value: 91,
  caption: 'Last 24 hours',
  delta: { value: 10, trend: 'up', sentiment: 'negative' },
};

export const NoDelta: StoryFn<MetricProps> = Frame.bind({});
NoDelta.args = { value: 91 };
