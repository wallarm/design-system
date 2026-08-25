import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Chart } from '../Chart/Chart';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import { MetricDelta, MetricHeader, MetricValue } from '../Metric';
import type { ChartColor } from '../types';
import {
  HorizontalBarStack,
  type HorizontalBarStackDatum,
  type HorizontalBarStackProps,
} from './HorizontalBarStack';
import { HorizontalBarStackSkeleton } from './HorizontalBarStackSkeleton';

const figmaUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9667-10883';

const severityData: HorizontalBarStackDatum[] = [
  { name: 'Critical', value: 42, color: 'red' },
  { name: 'High', value: 31, color: 'brand' },
  { name: 'Medium', value: 18, color: 'amber' },
];

const DESCRIPTION = [
  'One total read as a few named parts in a single band — reach for `BarList` when each part deserves a row of its own, and `Metric` when there is no breakdown to show at all.',
  'The header is composed from the shared `Metric` bricks rather than configured, so a value and its delta read the same here as anywhere else in the family; hovering a segment or a legend item fades the rest.',
].join(' ');

const meta = {
  title: 'Data display/SimpleCharts/HorizontalBarStack',
  component: HorizontalBarStack,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: figmaUrl },
    docs: { description: { component: DESCRIPTION } },
  },
  args: {
    // Base for derived slot ids (`horizontal-bar-stack--bar`, `--legend-item`, …) used by e2e tests.
    'data-testid': 'horizontal-bar-stack',
  },
  argTypes: {
    data: { control: false },
    children: { control: false },
    selectedNames: { control: false },
    onSelect: { control: false },
    activeName: { control: false },
    onActiveNameChange: { control: false },
    ref: { control: false },
    className: { control: 'text' },
  },
} satisfies Meta<typeof HorizontalBarStack>;

export default meta;

const Frame: StoryFn<HorizontalBarStackProps> = args => (
  <div className='w-400'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Findings by severity</ChartTitle>
      </ChartHeader>
      <HorizontalBarStack {...args} />
    </Chart>
  </div>
);

/**
 * The full shape: a headline value with its delta, a three-part band, and the legend that
 * names the parts.
 */
export const Default: StoryFn<HorizontalBarStackProps> = Frame.bind({});
Default.args = {
  data: severityData,
  children: (
    <MetricHeader>
      <MetricValue>91</MetricValue>
      <MetricDelta value={10} trend='up' sentiment='negative' />
    </MetricHeader>
  ),
};

/**
 * The same without the delta — a value with no comparison to make yet.
 */
export const NoDelta: StoryFn<HorizontalBarStackProps> = Frame.bind({});
NoDelta.args = {
  data: severityData,
  children: (
    <MetricHeader>
      <MetricValue>91</MetricValue>
    </MetricHeader>
  ),
};

/**
 * No header at all: the band and its legend alone, for a card whose total is already stated
 * somewhere else.
 */
export const NoValue: StoryFn<HorizontalBarStackProps> = Frame.bind({});
NoValue.args = { data: severityData };

/**
 * A `total` above the sum of the parts fills the difference with a grey tail — 91 of 120,
 * where the 29 nobody has accounted for is part of what the card says.
 */
export const WithRemainder: StoryFn<HorizontalBarStackProps> = Frame.bind({});
WithRemainder.args = {
  data: severityData,
  total: 120,
  children: (
    <MetricHeader>
      <MetricValue>91</MetricValue>
      <MetricDelta value={4} trend='down' sentiment='positive' />
    </MetricHeader>
  ),
};

/**
 * `legend={false}` leaves the band on its own, for a card too small to carry names or one
 * whose legend is already nearby.
 */
export const LegendOff: StoryFn<HorizontalBarStackProps> = Frame.bind({});
LegendOff.args = {
  data: severityData,
  legend: false,
  children: (
    <MetricHeader>
      <MetricValue>91</MetricValue>
    </MetricHeader>
  ),
};

const PALETTE: ChartColor[] = ['red', 'brand', 'amber', 'blue', 'green', 'purple'];
/**
 * All six chart colours in one band, which is the check that they stay tellable apart at the
 * widths a real breakdown gives them.
 */
export const Palette: StoryFn<HorizontalBarStackProps> = Frame.bind({});
Palette.args = {
  data: PALETTE.map((color, i) => ({ name: color, value: 10 + i, color })),
  children: (
    <MetricHeader>
      <MetricValue>75</MetricValue>
    </MetricHeader>
  ),
};

/**
 * `HorizontalBarStackSkeleton` stands in while the card loads, holding the header and band
 * heights so nothing shifts when data arrives.
 */
export const Loading: StoryFn = () => (
  <div className='w-400'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Findings by severity</ChartTitle>
      </ChartHeader>
      <HorizontalBarStackSkeleton data-testid='horizontal-bar-stack-skeleton' />
    </Chart>
  </div>
);

/**
 * `onSelect` turns the legend into a filter — the chosen series stays bright, the rest fade,
 * and clicking it again clears. Hover always wins, so pointing at any series brings it forward
 * regardless of what is selected.
 */
export const Selectable: StoryFn<HorizontalBarStackProps> = () => {
  const [selected, setSelected] = useState<string | null>('Critical');
  return (
    <div className='w-400'>
      <Chart>
        <ChartHeader>
          <ChartTitle>Findings by severity</ChartTitle>
        </ChartHeader>
        <HorizontalBarStack
          data-testid='horizontal-bar-stack'
          data={severityData}
          selectedNames={selected ? [selected] : []}
          onSelect={name => setSelected(prev => (prev === name ? null : name))}
        >
          <MetricHeader>
            <MetricValue>91</MetricValue>
          </MetricHeader>
        </HorizontalBarStack>
      </Chart>
    </div>
  );
};
