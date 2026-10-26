import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { UserMessage, UserMessageBubble, UserMessageShowMore } from '.';
import { Copyable, CopyableIcon } from '../Copyable';
import { MessageAction, MessageActions, MessageTimestamp } from '../MessageActions';

const DESCRIPTION = [
  'A message the user sent to Wally: an `<article>` named "You" that right-aligns a light-brand bubble.',
  'The bubble keeps the text’s whitespace and clamps it to 11 lines; when it overflows, a fade appears with a Show more / Show less toggle that reports `aria-expanded` and points `aria-controls` at the text.',
  'The toggle is `UserMessageShowMore`, rendered by default — pass your own instance through `showMore` for custom labels or `data-*` attributes, or `null` for none.',
  'Put a `MessageActions` row (timestamp, then Copy) after the bubble; it is revealed when the message is hovered or focused.',
].join(' ');

const meta = {
  title: 'AI/UserMessage',
  component: UserMessage,
  subcomponents: { UserMessageBubble, UserMessageShowMore },
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
  decorators: [
    Story => (
      <div className='w-420'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UserMessage>;

export default meta;

const LONG = Array.from(
  { length: 16 },
  (_, i) =>
    `Line ${i + 1}: check the blocked requests from 203.0.113.${i + 1} against the API inventory.`,
).join('\n');

/** A one-line question: the bubble hugs its text and is 44px tall. */
export const Short: StoryFn<typeof meta> = () => (
  <UserMessage data-testid='short'>
    <UserMessageBubble>Show me blocked attacks for the last 24 hours</UserMessageBubble>
  </UserMessage>
);

/** Line breaks and indentation in the text are kept as typed. */
export const Multiline: StoryFn<typeof meta> = () => (
  <UserMessage data-testid='multiline'>
    <UserMessageBubble>
      {
        'Compare these two endpoints:\n  - POST /api/v1/login\n  - POST /api/v2/login\n\nWhich one gets more attacks?'
      }
    </UserMessageBubble>
  </UserMessage>
);

/**
 * Text longer than 11 lines is clamped under a fade with Show more. Click it to expand;
 * the same button then reads Show less and collapses the text again.
 */
export const LongCollapsed: StoryFn<typeof meta> = () => (
  <UserMessage data-testid='long'>
    <UserMessageBubble>{LONG}</UserMessageBubble>
  </UserMessage>
);

/** With the user actions row — timestamp, then Copy — revealed on hover or focus. */
export const WithActions: StoryFn<typeof meta> = () => {
  const text = 'Show me blocked attacks for the last 24 hours';

  return (
    <UserMessage data-testid='with-actions'>
      <UserMessageBubble>{text}</UserMessageBubble>
      <MessageActions>
        <MessageTimestamp dateTime='2026-10-21T09:41:00Z'>2m ago</MessageTimestamp>
        <Copyable text={text}>
          <MessageAction aria-label='Copy'>
            <CopyableIcon />
          </MessageAction>
        </Copyable>
      </MessageActions>
    </UserMessage>
  );
};

/**
 * Pass your own `UserMessageShowMore` to `showMore` for custom labels or analytics:
 * `data-analytics-id` lands on the real `<button>`.
 */
export const CustomShowMore: StoryFn<typeof meta> = () => (
  <UserMessage data-testid='custom'>
    <UserMessageBubble
      showMore={
        <UserMessageShowMore
          showMoreLabel='Expand'
          showLessLabel='Collapse'
          data-analytics-id='WALLY_USER_MESSAGE_TOGGLE'
        />
      }
    >
      {LONG}
    </UserMessageBubble>
  </UserMessage>
);
