import { Fragment, useEffect, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '.';
import { AssistantMessage, AssistantMessageContent } from '../AssistantMessage';
import {
  Chat,
  ChatFooter,
  ChatHeader,
  ChatHeaderTitle,
  ChatSuggestion,
  ChatSuggestions,
} from '../Chat';
import { ChatInput, ChatInputSubmit, ChatInputTextarea } from '../ChatInput';
import { MessageActions, MessageTimestamp } from '../MessageActions';
import { UserMessage, UserMessageBubble } from '../UserMessage';

const DESCRIPTION = [
  'Stick-to-bottom for the Wally log: `Conversation` takes `ChatBody`’s place between `ChatHeader` and `ChatFooter`, and `ConversationContent` renders the built `ChatBody` (`role=log`) as the scroller.',
  'While an answer streams the view follows it; once the reader scrolls up it stops following and `ConversationScrollButton` appears. Scrolling back down, clicking the button or changing `autoScrollKey` (pass the last user message id) re-sticks.',
  '`ConversationEmptyState` is the greeting for an empty chat, rendered inside the scroller.',
  'The scroll button is the stock small icon-only Button, floated at the bottom centre.',
].join(' ');

const meta = {
  title: 'AI/Conversation',
  component: Conversation,
  subcomponents: { ConversationContent, ConversationEmptyState, ConversationScrollButton },
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
} satisfies Meta<typeof Conversation>;

export default meta;

const TOPICS = ['/api/login', '/api/orders', '/graphql', '/api/users', '/checkout', '/search'];

const HISTORY = TOPICS.map((path, index) => ({
  id: `u${index}`,
  question: `Why were requests to ${path} blocked?`,
  answer: [
    `Wallarm blocked ${120 * (index + 1)} attack attempts against ${path} in the last 24 hours.`,
    'Most of them were SQL injection probes from a single /24 network; none reached the application.',
  ],
}));

const ANSWER = [
  'Wallarm blocked 1,204 SQL injection attempts against /api/login last night.',
  'Almost all of them came from 203.0.113.0/24, peaking at 03:00 UTC.',
  'The matched rule is "SQLi in query parameters"; it has been in blocking mode since June.',
  'No request reached the application, and no credentials were exposed.',
  'You can deny the network in IP lists, or keep monitoring: the rate is already dropping.',
];

/**
 * A long history that opens at the latest message. Sending a message appends a turn and changes
 * `autoScrollKey`, so the view re-sticks even after the reader scrolled up.
 */
export const Default: StoryFn<typeof meta> = () => {
  const [turns, setTurns] = useState(HISTORY);
  const [value, setValue] = useState('');
  const lastId = turns[turns.length - 1]?.id;

  const handleSubmit = (question: string) => {
    setTurns(previous => [
      ...previous,
      { id: `u${previous.length}`, question, answer: ANSWER.slice(0, 2) },
    ]);
    setValue('');
  };

  return (
    <div className='h-640 w-480'>
      <Chat data-testid='chat'>
        <ChatHeader>
          <ChatHeaderTitle />
        </ChatHeader>
        <Conversation autoScrollKey={lastId}>
          <ConversationContent>
            {turns.map((turn, index) => (
              <Fragment key={turn.id}>
                <UserMessage data-testid={`conversation--user-message-${index}`}>
                  <UserMessageBubble>{turn.question}</UserMessageBubble>
                  <MessageActions>
                    <MessageTimestamp dateTime='2026-10-21T09:41:00Z'>2m ago</MessageTimestamp>
                  </MessageActions>
                </UserMessage>
                <AssistantMessage data-testid={`conversation--assistant-message-${index}`}>
                  <AssistantMessageContent>
                    {turn.answer.map(paragraph => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </AssistantMessageContent>
                  <MessageActions visible>
                    <MessageTimestamp dateTime='2026-10-21T09:42:00Z'>1m ago</MessageTimestamp>
                  </MessageActions>
                </AssistantMessage>
              </Fragment>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <ChatFooter>
          <ChatInput value={value} onValueChange={setValue} onSubmit={handleSubmit}>
            <ChatInputTextarea />
            <ChatInputSubmit />
          </ChatInput>
        </ChatFooter>
      </Chat>
    </div>
  );
};

/** `ConversationEmptyState` with greeting pills, over the `strong` background. */
export const Empty: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    setValue('');
  };

  return (
    <div className='h-640 w-480'>
      <Chat data-testid='chat' background='strong'>
        <ChatHeader>
          <ChatHeaderTitle />
        </ChatHeader>
        <Conversation>
          <ConversationContent>
            <ConversationEmptyState>
              <ChatSuggestions placement='greeting' label='Suggestions'>
                <ChatSuggestion data-testid='chat--suggestion-0'>
                  Why was this request blocked?
                </ChatSuggestion>
                <ChatSuggestion data-testid='chat--suggestion-1'>
                  Show top attacked endpoints
                </ChatSuggestion>
              </ChatSuggestions>
            </ConversationEmptyState>
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <ChatFooter>
          <ChatInput value={value} onValueChange={setValue} onSubmit={handleSubmit}>
            <ChatInputTextarea />
            <ChatInputSubmit />
          </ChatInput>
        </ChatFooter>
      </Chat>
    </div>
  );
};

/**
 * A paragraph streams in every 600ms. The view follows the growing answer; scroll up and it stops
 * following and the scroll button appears.
 */
export const Streaming: StoryFn<typeof meta> = () => {
  const [count, setCount] = useState(1);
  const streaming = count < ANSWER.length;

  useEffect(() => {
    if (!streaming) return;
    const timer = setInterval(() => setCount(value => value + 1), 600);
    return () => clearInterval(timer);
  }, [streaming]);

  return (
    <div className='h-640 w-480'>
      <Chat data-testid='chat'>
        <ChatHeader>
          <ChatHeaderTitle />
        </ChatHeader>
        <Conversation>
          <ConversationContent aria-busy={streaming}>
            {HISTORY.map((turn, index) => (
              <Fragment key={turn.id}>
                <UserMessage data-testid={`conversation--user-message-${index}`}>
                  <UserMessageBubble>{turn.question}</UserMessageBubble>
                  <MessageActions>
                    <MessageTimestamp dateTime='2026-10-21T09:41:00Z'>2m ago</MessageTimestamp>
                  </MessageActions>
                </UserMessage>
                <AssistantMessage data-testid={`conversation--assistant-message-${index}`}>
                  <AssistantMessageContent>
                    {turn.answer.map(paragraph => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </AssistantMessageContent>
                  <MessageActions visible>
                    <MessageTimestamp dateTime='2026-10-21T09:42:00Z'>1m ago</MessageTimestamp>
                  </MessageActions>
                </AssistantMessage>
              </Fragment>
            ))}
            <AssistantMessage data-testid='conversation--streaming-message' aria-busy={streaming}>
              <AssistantMessageContent>
                {ANSWER.slice(0, count).map(paragraph => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </AssistantMessageContent>
            </AssistantMessage>
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </Chat>
    </div>
  );
};

/**
 * `data-analytics-id` on `ConversationScrollButton` lands on its `<button>`. Scroll the log up to
 * reveal it. Keep analytics off the `Conversation` root — a click anywhere inside would resolve to it.
 */
export const Analytics: StoryFn<typeof meta> = () => (
  <div className='h-640 w-480'>
    <Chat data-testid='chat'>
      <ChatHeader>
        <ChatHeaderTitle />
      </ChatHeader>
      <Conversation>
        <ConversationContent>
          {HISTORY.map((turn, index) => (
            <Fragment key={turn.id}>
              <UserMessage data-testid={`conversation--user-message-${index}`}>
                <UserMessageBubble>{turn.question}</UserMessageBubble>
                <MessageActions>
                  <MessageTimestamp dateTime='2026-10-21T09:41:00Z'>2m ago</MessageTimestamp>
                </MessageActions>
              </UserMessage>
              <AssistantMessage data-testid={`conversation--assistant-message-${index}`}>
                <AssistantMessageContent>
                  {turn.answer.map(paragraph => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </AssistantMessageContent>
                <MessageActions visible>
                  <MessageTimestamp dateTime='2026-10-21T09:42:00Z'>1m ago</MessageTimestamp>
                </MessageActions>
              </AssistantMessage>
            </Fragment>
          ))}
        </ConversationContent>
        <ConversationScrollButton data-analytics-id='WALLY_SCROLL_TO_LATEST' />
      </Conversation>
    </Chat>
  </div>
);
