import figma from '@figma/code-connect';
import { Chart } from '../Chart/Chart';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import { HorizontalBar, type HorizontalBarDatum } from './HorizontalBar';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9667-10883';

const sampleData: HorizontalBarDatum[] = [
  { name: 'Critical', value: 42, color: 'red' },
  { name: 'High', value: 31, color: 'brand' },
  { name: 'Medium', value: 18, color: 'amber' },
];

figma.connect(HorizontalBar, figmaNodeUrl, {
  props: {
    title: figma.string('Title'),
  },
  example: ({ title }) => (
    <Chart>
      <ChartHeader>
        <ChartTitle>{title}</ChartTitle>
      </ChartHeader>
      <HorizontalBar data={sampleData} value={91} delta={{ value: 10, trend: 'up' }} />
    </Chart>
  ),
});
