import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Chart } from '../Chart/Chart';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import type { ChartColor } from '../types';
import { HorizontalBar, type HorizontalBarDatum, type HorizontalBarProps } from './HorizontalBar';

const figmaUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9667-10883';

const severityData: HorizontalBarDatum[] = [
  { name: 'Critical', value: 42, color: 'red' },
  { name: 'High', value: 31, color: 'brand' },
  { name: 'Medium', value: 18, color: 'amber' },
];

const meta = {
  title: 'Data display/SimpleCharts/HorizontalBar',
  component: HorizontalBar,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: figmaUrl },
    docs: {
      description: {
        component:
          'A single proportional segmented bar with a headline value, an optional delta badge, and an optional horizontal legend. Composed inside a `Chart` card.',
      },
    },
  },
  argTypes: {
    data: { control: false },
    delta: { control: false },
    ref: { control: false },
    className: { control: 'text' },
  },
} satisfies Meta<typeof HorizontalBar>;

export default meta;

const Frame: StoryFn<HorizontalBarProps> = args => (
  <div className='w-400'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Findings by severity</ChartTitle>
      </ChartHeader>
      <HorizontalBar {...args} />
    </Chart>
  </div>
);

export const Default: StoryFn<HorizontalBarProps> = Frame.bind({});
Default.args = { data: severityData, value: 91, delta: { value: 10, trend: 'up' } };

export const NoDelta: StoryFn<HorizontalBarProps> = Frame.bind({});
NoDelta.args = { data: severityData, value: 91 };

export const NoValue: StoryFn<HorizontalBarProps> = Frame.bind({});
NoValue.args = { data: severityData };

export const WithRemainder: StoryFn<HorizontalBarProps> = Frame.bind({});
WithRemainder.args = {
  data: severityData,
  value: 91,
  total: 120,
  delta: { value: 4, trend: 'down' },
};

export const LegendOff: StoryFn<HorizontalBarProps> = Frame.bind({});
LegendOff.args = { data: severityData, value: 91, legend: false };

const PALETTE: ChartColor[] = ['red', 'brand', 'amber', 'blue', 'green', 'purple'];
export const Palette: StoryFn<HorizontalBarProps> = Frame.bind({});
Palette.args = {
  data: PALETTE.map((color, i) => ({ name: color, value: 10 + i, color })),
  value: 75,
};

export const Empty: StoryFn<HorizontalBarProps> = Frame.bind({});
Empty.args = { data: [] };
