import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { AgentItem, Avatar, AvatarContent, AvatarFallback, AvatarName } from '../Avatar';
import { HStack } from '../Stack';
import { Text } from '../Text';
import { Timeline } from './Timeline';
import { TimelineConnector } from './TimelineConnector';
import { TimelineContent } from './TimelineContent';
import { TimelineDescription } from './TimelineDescription';
import { TimelineIndicator } from './TimelineIndicator';
import { TimelineItem } from './TimelineItem';
import { TimelineSeparator } from './TimelineSeparator';
import { TimelineTitle } from './TimelineTitle';

const DESCRIPTION = [
  'A vertical run of events in the order they happened — a timeline records what occurred, so reach for `Progress` when the question is how far along something is rather than what has already taken place.',
  '`TimelineConnector` and `TimelineContent` are each optional, and the last item looks after itself: its line and its bottom padding go without any special casing.',
].join(' ');

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
    docs: { description: { component: DESCRIPTION } },
  },
} satisfies Meta<typeof Timeline>;

export default meta;

/**
 * The rail on its own — numbered indicators with the line between them, and no line trailing
 * off the bottom of the last one.
 */
export const Basic: StoryFn<typeof meta> = () => (
  <Timeline data-testid='timeline'>
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

/**
 * Content beside the rail. The line stretches to whatever height the row turns out to need,
 * which is why the third step's long description does not break the rhythm.
 */
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

/**
 * The actor of an entry, composed in `TimelineContent`: an agent through `AgentItem`, a person
 * through `Avatar`, beside the same label. 20 px beside the text-sm rows, 16 px beside text-xs.
 */
export const WithAgent: StoryFn<typeof meta> = () => (
  <div className='max-w-[360px]'>
    <Timeline data-testid='timeline'>
      <TimelineItem>
        <TimelineConnector>
          <TimelineIndicator>1</TimelineIndicator>
          <TimelineSeparator />
        </TimelineConnector>
        <TimelineContent>
          <TimelineTitle>Rule proposed</TimelineTitle>
          <HStack gap={4}>
            <TimelineDescription>Proposed by</TimelineDescription>
            <AgentItem agent='trim' data-testid='timeline-agent'>
              <AvatarContent>
                <AvatarName>Trim</AvatarName>
              </AvatarContent>
            </AgentItem>
          </HStack>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineConnector>
          <TimelineIndicator>2</TimelineIndicator>
          <TimelineSeparator />
        </TimelineConnector>
        <TimelineContent>
          <TimelineTitle>Rule approved</TimelineTitle>
          <HStack gap={4}>
            <TimelineDescription>Approved by</TimelineDescription>
            <Avatar size='sm' data-testid='timeline-person'>
              <AvatarFallback name='Artem Miskevich' />
              <AvatarContent>
                <AvatarName>Artem Miskevich</AvatarName>
              </AvatarContent>
            </Avatar>
          </HStack>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineConnector>
          <TimelineIndicator>3</TimelineIndicator>
          <TimelineSeparator />
        </TimelineConnector>
        <TimelineContent>
          <TimelineTitle>Rule applied</TimelineTitle>
          <HStack gap={4}>
            <Text size='xs' color='secondary'>
              Verified by
            </Text>
            <AgentItem agent='radar' size={16} data-testid='timeline-agent-xs'>
              <AvatarContent>
                <AvatarName>Radar</AvatarName>
              </AvatarContent>
            </AgentItem>
          </HStack>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  </div>
);

/**
 * Content with no rail at all — effectively a `List` of titles and descriptions, for when the
 * order carries the sequence and a drawn line would only add furniture.
 */
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
