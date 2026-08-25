import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { FilterX, Settings } from '../../../icons';
import { Button } from '../../Button';
import { Chart } from './Chart';
import { ChartActions } from './ChartActions';
import { ChartEmpty } from './ChartEmpty';
import { ChartHeader } from './ChartHeader';
import { ChartTitle } from './ChartTitle';

const DESCRIPTION = [
  'The card every chart in the family sits in: the surface, the 32px title bar, and actions that appear on hover — it draws no data itself, so reach for `BarList`, `PieChart`, `LineChart`, `HorizontalBarStack` or `Metric` for the chart inside it.',
  'Worth knowing before composing one: `ChartActions` takes no layout space while hidden, so the title has the full header width until you hover.',
].join(' ');

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
    docs: { description: { component: DESCRIPTION } },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Chart>;

export default meta;

/**
 * The frame with everything it owns — title, hover-revealed actions, and a body slot standing
 * in for the chart.
 */
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

/**
 * `alwaysVisible` pins the actions open, which is what a card does while a filter is applied:
 * the control that clears it must not need hovering to be found.
 */
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

/**
 * The card is a full-width block with a minimum height; give it a width and height directly
 * when a dashboard slot demands a particular size.
 */
export const CustomSize: StoryFn<typeof meta> = () => (
  <Chart className='w-640 h-320'>
    <ChartHeader>
      <ChartTitle>Custom 640 × 320</ChartTitle>
    </ChartHeader>
    <ChartEmpty>tall chart content</ChartEmpty>
  </Chart>
);

/**
 * `ChartTitle` stays on one line and truncates, so the actions keep their place however long
 * the title runs.
 */
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

/**
 * `ChartEmpty` centres a default 'No data' in the body — the frame and the title stay, so the
 * card does not vanish from the grid when its data does.
 */
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

/**
 * Pass children to say why it is empty. A card emptied by a filter should say so, since the
 * fix is different from having no data at all.
 */
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
