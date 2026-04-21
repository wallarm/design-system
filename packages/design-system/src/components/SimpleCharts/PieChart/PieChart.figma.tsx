import figma from '@figma/code-connect';
import { Settings } from '../../../icons';
import type { BadgeColor } from '../../Badge';
import { Badge } from '../../Badge';
import { Button } from '../../Button';
import { Chart } from '../Chart/Chart';
import { ChartActions } from '../Chart/ChartActions';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import { LegendDot } from './LegendDot';
import { PieChart } from './PieChart';
import { PieChartCenter, PieChartCenterLabel, PieChartCenterValue } from './PieChartCenter';
import type { PieChartDatum } from './PieChartContext';
import { PieChartDonut } from './PieChartDonut';
import { PieChartLegend } from './PieChartLegend';
import { PieChartLegendItem } from './PieChartLegendItem';
import { PieChartLegendPercent } from './PieChartLegendPercent';
import { PieChartLegendValue } from './PieChartLegendValue';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7490-122167&m=dev';

const sampleData: Array<PieChartDatum & { badgeColor: BadgeColor }> = [
  { name: '4XX', value: 35, color: 'amber', badgeColor: 'amber' },
  { name: '2XX', value: 30, color: 'green', badgeColor: 'green' },
  { name: '5XX', value: 15, color: 'red', badgeColor: 'red' },
  { name: '3XX', value: 12, color: 'blue', badgeColor: 'blue' },
  { name: '1XX', value: 8, color: 'slate', badgeColor: 'slate' },
];

const sampleTotal = sampleData.reduce((sum, d) => sum + d.value, 0);

figma.connect(PieChart, figmaNodeUrl, {
  props: {
    title: figma.string('Title'),
    state: figma.enum('State', {
      Default: 'default',
      Hovered: 'hovered',
      Filtered: 'filtered',
    }),
  },
  example: ({ title, state }) => (
    <Chart>
      <ChartHeader>
        <ChartTitle>{title}</ChartTitle>
        <ChartActions>
          <Button variant='ghost' color='neutral' size='small' aria-label='Settings'>
            <Settings />
          </Button>
        </ChartActions>
      </ChartHeader>
      <PieChart data={sampleData} total={sampleTotal}>
        <PieChartDonut>
          <PieChartCenter>
            <PieChartCenterValue>{sampleTotal}</PieChartCenterValue>
            <PieChartCenterLabel>requests</PieChartCenterLabel>
          </PieChartCenter>
        </PieChartDonut>
        <PieChartLegend>
          {sampleData.map(d => (
            <PieChartLegendItem
              key={d.name}
              name={d.name}
              selected={state === 'filtered' && d.name === sampleData[0]?.name}
            >
              <Badge color={d.badgeColor} type='secondary' textVariant='code'>
                {d.name}
              </Badge>
              <PieChartLegendValue>
                {d.value}
                <LegendDot />
                <PieChartLegendPercent />
              </PieChartLegendValue>
            </PieChartLegendItem>
          ))}
        </PieChartLegend>
      </PieChart>
    </Chart>
  ),
});
