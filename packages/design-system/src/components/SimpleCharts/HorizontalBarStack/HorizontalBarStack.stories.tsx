import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Chart } from '../Chart/Chart';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
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

const meta = {
  title: 'Data display/SimpleCharts/HorizontalBarStack',
  component: HorizontalBarStack,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: figmaUrl },
    docs: {
      description: {
        component:
          'A single proportional segmented bar with a headline value, an optional delta badge, and a horizontal legend. The legend is interactive: hovering an item or segment fades the rest (hover-sync), and passing `onSelect` makes items clickable filters — `selectedNames` marks the active one and dims the rest. Same interaction contract as `PieChart`. Composed inside a `Chart` card.',
      },
    },
  },
  args: {
    // Base for derived slot ids (`horizontal-bar-stack--bar`, `--legend-item`, …) used by e2e tests.
    'data-testid': 'horizontal-bar-stack',
  },
  argTypes: {
    data: { control: false },
    delta: { control: false },
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

export const Default: StoryFn<HorizontalBarStackProps> = Frame.bind({});
Default.args = {
  data: severityData,
  value: 91,
  delta: { value: 10, trend: 'up', sentiment: 'negative' },
};

export const NoDelta: StoryFn<HorizontalBarStackProps> = Frame.bind({});
NoDelta.args = { data: severityData, value: 91 };

export const NoValue: StoryFn<HorizontalBarStackProps> = Frame.bind({});
NoValue.args = { data: severityData };

export const WithRemainder: StoryFn<HorizontalBarStackProps> = Frame.bind({});
WithRemainder.args = {
  data: severityData,
  value: 91,
  total: 120,
  delta: { value: 4, trend: 'down', sentiment: 'positive' },
};

export const LegendOff: StoryFn<HorizontalBarStackProps> = Frame.bind({});
LegendOff.args = { data: severityData, value: 91, legend: false };

const PALETTE: ChartColor[] = ['red', 'brand', 'amber', 'blue', 'green', 'purple'];
export const Palette: StoryFn<HorizontalBarStackProps> = Frame.bind({});
Palette.args = {
  data: PALETTE.map((color, i) => ({ name: color, value: 10 + i, color })),
  value: 75,
};

/** Card-load shimmer — swap the chart for `HorizontalBarStackSkeleton` while data loads. */
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
 * Click a legend item to filter to that series; click the active one again to clear
 * ("remove filter"). Hovering any item or segment fades the rest (hover-sync).
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
          value={91}
          selectedNames={selected ? [selected] : []}
          onSelect={name => setSelected(prev => (prev === name ? null : name))}
        />
      </Chart>
    </div>
  );
};
