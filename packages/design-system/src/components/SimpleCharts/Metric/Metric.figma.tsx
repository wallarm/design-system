import figma from '@figma/code-connect';
import { Chart } from '../Chart/Chart';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import { Metric } from './Metric';
import { MetricCaption } from './MetricCaption';
import { MetricDelta } from './MetricDelta';
import { MetricHeader } from './MetricHeader';
import { MetricTotal } from './MetricTotal';
import { MetricValue } from './MetricValue';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=11437-11939';

figma.connect(Metric, figmaNodeUrl, {
  props: {
    // `title` is rendered only via the external `ChartTitle` (the card frame shown in
    // `example`) — it is NOT a prop on `Metric`. Do not add a `title` prop to `MetricProps`.
    title: figma.string('Title'),
  },
  example: ({ title }) => (
    <Chart>
      <ChartHeader>
        <ChartTitle>{title}</ChartTitle>
      </ChartHeader>
      <Metric>
        <MetricHeader>
          <MetricValue>91</MetricValue>
          <MetricTotal connector='of'>120</MetricTotal>
          <MetricDelta value={10} trend='up' sentiment='negative' />
        </MetricHeader>
        <MetricCaption>blocked today</MetricCaption>
      </Metric>
    </Chart>
  ),
});
