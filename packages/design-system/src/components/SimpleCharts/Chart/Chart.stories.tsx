import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { FilterX, Settings } from '../../../icons';
import { Button } from '../../Button';
import { Chart } from './Chart';
import { ChartActions } from './ChartActions';
import { ChartEmpty } from './ChartEmpty';
import { ChartHeader } from './ChartHeader';
import { ChartTitle } from './ChartTitle';

const meta = {
  title: 'Data display/SimpleCharts/Chart',
  component: Chart,
  subcomponents: {
    ChartHeader,
    ChartTitle,
    ChartActions,
    ChartEmpty,
  },
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7490-118206&m=dev',
    },
    docs: {
      description: {
        component:
          'Chart is a generic card container for simple charts. ' +
          'It provides the surface, border, default min-height (196px) and full-width block layout. ' +
          'Compose with `ChartHeader`, `ChartTitle` and `ChartActions` for the top bar, ' +
          'and place any chart content below. Use `ChartEmpty` as the body when there is no data.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Chart>;

export default meta;

export const Default: StoryFn<typeof meta> = () => (
  <div className='w-400'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Top 5 Endpoints</ChartTitle>
        <ChartActions>
          <Button variant='ghost' color='neutral' size='small' aria-label='Clear filter'>
            <FilterX />
          </Button>
          <Button variant='ghost' color='neutral' size='small' aria-label='Settings'>
            <Settings />
          </Button>
        </ChartActions>
      </ChartHeader>
      <ChartEmpty>chart content</ChartEmpty>
    </Chart>
  </div>
);

export const WithAlwaysVisibleActions: StoryFn<typeof meta> = () => (
  <div className='w-400'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Top 5 Endpoints</ChartTitle>
        <ChartActions alwaysVisible>
          <Button variant='ghost' color='neutral' size='small' aria-label='Clear filter'>
            <FilterX />
          </Button>
          <Button variant='ghost' color='neutral' size='small' aria-label='Settings'>
            <Settings />
          </Button>
        </ChartActions>
      </ChartHeader>
      <ChartEmpty>filtered chart content</ChartEmpty>
    </Chart>
  </div>
);

export const CustomSize: StoryFn<typeof meta> = () => (
  <Chart className='w-640 h-320'>
    <ChartHeader>
      <ChartTitle>Custom 640 × 320</ChartTitle>
    </ChartHeader>
    <ChartEmpty>tall chart content</ChartEmpty>
  </Chart>
);

export const LongTitle: StoryFn<typeof meta> = () => (
  <div className='w-300'>
    <Chart>
      <ChartHeader>
        <ChartTitle>
          A very long chart title that needs to be truncated so actions remain visible
        </ChartTitle>
        <ChartActions>
          <Button variant='ghost' color='neutral' size='small' aria-label='Clear filter'>
            <FilterX />
          </Button>
          <Button variant='ghost' color='neutral' size='small' aria-label='Settings'>
            <Settings />
          </Button>
        </ChartActions>
      </ChartHeader>
      <ChartEmpty>chart content</ChartEmpty>
    </Chart>
  </div>
);

export const Empty: StoryFn<typeof meta> = () => (
  <div className='w-400'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Top 5 Endpoints</ChartTitle>
      </ChartHeader>
      <ChartEmpty />
    </Chart>
  </div>
);

export const EmptyWithCustomMessage: StoryFn<typeof meta> = () => (
  <div className='w-400'>
    <Chart>
      <ChartHeader>
        <ChartTitle>Top 5 Endpoints</ChartTitle>
      </ChartHeader>
      <ChartEmpty>No endpoints match the current filter</ChartEmpty>
    </Chart>
  </div>
);
