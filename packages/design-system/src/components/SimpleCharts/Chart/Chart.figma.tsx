import figma from '@figma/code-connect';
import { FilterX, Settings } from '../../../icons';
import { Button } from '../../Button';
import { Chart } from './Chart';
import { ChartActions } from './ChartActions';
import { ChartHeader } from './ChartHeader';
import { ChartTitle } from './ChartTitle';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7490-118206&m=dev';

figma.connect(Chart, figmaNodeUrl, {
  props: {
    title: figma.string('Title'),
  },
  example: ({ title }) => (
    <Chart>
      <ChartHeader>
        <ChartTitle>{title}</ChartTitle>
        <ChartActions>
          <Button variant='ghost' color='neutral' size='small' aria-label='Clear filter'>
            <FilterX />
          </Button>
          <Button variant='ghost' color='neutral' size='small' aria-label='Settings'>
            <Settings />
          </Button>
        </ChartActions>
      </ChartHeader>
    </Chart>
  ),
});
