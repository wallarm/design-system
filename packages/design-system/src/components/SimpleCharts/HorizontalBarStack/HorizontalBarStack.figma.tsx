import figma from '@figma/code-connect';
import { Chart } from '../Chart/Chart';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import { MetricDelta, MetricHeader, MetricValue } from '../Metric';
import { HorizontalBarStack, type HorizontalBarStackDatum } from './HorizontalBarStack';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9667-10883';

const sampleData: HorizontalBarStackDatum[] = [
  { name: 'Critical', value: 42, color: 'red' },
  { name: 'High', value: 31, color: 'brand' },
  { name: 'Medium', value: 18, color: 'amber' },
];

figma.connect(HorizontalBarStack, figmaNodeUrl, {
  props: {
    // `title` is intentionally rendered only via the external `ChartTitle` (the card frame
    // shown in `example` below) — it is NOT a prop on `HorizontalBarStack` itself. Do not add a
    // `title` prop to `HorizontalBarStackProps` to satisfy this mapping.
    title: figma.string('Title'),
  },
  example: ({ title }) => (
    <Chart>
      <ChartHeader>
        <ChartTitle>{title}</ChartTitle>
      </ChartHeader>
      <HorizontalBarStack data={sampleData}>
        <MetricHeader>
          <MetricValue>91</MetricValue>
          <MetricDelta value={10} trend='up' sentiment='negative' />
        </MetricHeader>
      </HorizontalBarStack>
    </Chart>
  ),
});
