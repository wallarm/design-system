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

const STEPS = [1, 2, 3, 4, 5];

export const Basic: StoryFn<typeof meta> = () => (
  <Timeline>
    {STEPS.map(step => (
      <TimelineItem key={step}>
        <TimelineConnector>
          <TimelineIndicator>{step}</TimelineIndicator>
          <TimelineSeparator />
        </TimelineConnector>
      </TimelineItem>
    ))}
  </Timeline>
);

const EVENTS = [
  { title: 'Order placed', description: 'The order was placed by the customer.' },
  { title: 'Order confirmed', description: 'Payment received, order confirmed.' },
  {
    title: 'Order shipped',
    description:
      'The package left the warehouse and is on its way. This step has the ' +
      'longest description of the three, to show the connecting line ' +
      'stretching to match a taller row.',
  },
];

export const WithContent: StoryFn<typeof meta> = () => (
  <Timeline>
    {EVENTS.map((event, index) => (
      <TimelineItem key={event.title}>
        <TimelineConnector>
          <TimelineIndicator>{index + 1}</TimelineIndicator>
          <TimelineSeparator />
        </TimelineConnector>
        <TimelineContent>
          <TimelineTitle>{event.title}</TimelineTitle>
          <TimelineDescription>{event.description}</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
    ))}
  </Timeline>
);

export const WithoutConnector: StoryFn<typeof meta> = () => (
  <Timeline>
    {EVENTS.map(event => (
      <TimelineItem key={event.title}>
        <TimelineContent>
          <TimelineTitle>{event.title}</TimelineTitle>
          <TimelineDescription>{event.description}</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
    ))}
  </Timeline>
);
