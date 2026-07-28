import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Timeline } from './Timeline';
import { TimelineConnector } from './TimelineConnector';
import { TimelineContent } from './TimelineContent';
import { TimelineDescription } from './TimelineDescription';
import { TimelineIndicator } from './TimelineIndicator';
import { TimelineItem } from './TimelineItem';
import { TimelineSeparator } from './TimelineSeparator';
import { TimelineTitle } from './TimelineTitle';

const meta = {
  title: 'Data Display/Timeline',
  component: Timeline,
  subcomponents: {
    TimelineItem,
    TimelineConnector,
    TimelineIndicator,
    TimelineSeparator,
    TimelineContent,
    TimelineTitle,
    TimelineDescription,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Vertical sequence of steps or events. Compose with TimelineItem, ' +
          'TimelineConnector (wrapping TimelineIndicator + TimelineSeparator), ' +
          'and TimelineContent (wrapping TimelineTitle + TimelineDescription). ' +
          'TimelineConnector and TimelineContent are each independently optional.',
      },
    },
  },
} satisfies Meta<typeof Timeline>;

export default meta;

export const Basic: StoryFn<typeof meta> = () => (
  <Timeline>
    <TimelineItem>
      <TimelineConnector>
        <TimelineIndicator>1</TimelineIndicator>
        <TimelineSeparator />
      </TimelineConnector>
    </TimelineItem>
    <TimelineItem>
      <TimelineConnector>
        <TimelineIndicator>2</TimelineIndicator>
        <TimelineSeparator />
      </TimelineConnector>
    </TimelineItem>
    <TimelineItem>
      <TimelineConnector>
        <TimelineIndicator>3</TimelineIndicator>
        <TimelineSeparator />
      </TimelineConnector>
    </TimelineItem>
    <TimelineItem>
      <TimelineConnector>
        <TimelineIndicator>4</TimelineIndicator>
        <TimelineSeparator />
      </TimelineConnector>
    </TimelineItem>
    <TimelineItem>
      <TimelineConnector>
        <TimelineIndicator>5</TimelineIndicator>
        <TimelineSeparator />
      </TimelineConnector>
    </TimelineItem>
  </Timeline>
);

export const WithContent: StoryFn<typeof meta> = () => (
  <div className='max-w-[360px]'>
    <Timeline>
      <TimelineItem>
        <TimelineConnector>
          <TimelineIndicator>1</TimelineIndicator>
          <TimelineSeparator />
        </TimelineConnector>
        <TimelineContent>
          <TimelineTitle>Order placed</TimelineTitle>
          <TimelineDescription>The order was placed by the customer.</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineConnector>
          <TimelineIndicator>2</TimelineIndicator>
          <TimelineSeparator />
        </TimelineConnector>
        <TimelineContent>
          <TimelineTitle>Order confirmed</TimelineTitle>
          <TimelineDescription>Payment received, order confirmed.</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineConnector>
          <TimelineIndicator>3</TimelineIndicator>
          <TimelineSeparator />
        </TimelineConnector>
        <TimelineContent>
          <TimelineTitle>Order shipped</TimelineTitle>
          <TimelineDescription>
            The package left the warehouse and is on its way. This step has the longest description
            of the three, to show the connecting line stretching to match a taller row.
          </TimelineDescription>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  </div>
);

export const WithoutConnector: StoryFn<typeof meta> = () => (
  <Timeline>
    <TimelineItem>
      <TimelineContent>
        <TimelineTitle>Order placed</TimelineTitle>
        <TimelineDescription>The order was placed by the customer.</TimelineDescription>
      </TimelineContent>
    </TimelineItem>
    <TimelineItem>
      <TimelineContent>
        <TimelineTitle>Order confirmed</TimelineTitle>
        <TimelineDescription>Payment received, order confirmed.</TimelineDescription>
      </TimelineContent>
    </TimelineItem>
    <TimelineItem>
      <TimelineContent>
        <TimelineTitle>Order shipped</TimelineTitle>
        <TimelineDescription>
          The package left the warehouse and is on its way. This step has the longest description of
          the three, to show the connecting line stretching to match a taller row.
        </TimelineDescription>
      </TimelineContent>
    </TimelineItem>
  </Timeline>
);
