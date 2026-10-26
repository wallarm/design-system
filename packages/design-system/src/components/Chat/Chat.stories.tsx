import { type MouseEvent, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import {
  Chat,
  type ChatBackground,
  ChatBody,
  ChatFooter,
  ChatGreeting,
  ChatHeader,
  ChatHeaderActions,
  ChatHeaderTitle,
  ChatSuggestion,
  ChatSuggestions,
  ChatTrigger,
} from '.';
import {
  Brain,
  Database,
  Ellipsis,
  History,
  Plus,
  Search,
  ShieldBan,
  ThumbsDown,
  ThumbsUp,
  X,
} from '../../icons';
import {
  ApprovalCard,
  ApprovalCardActions,
  ApprovalCardContent,
  type ApprovalCardStatus,
} from '../ApprovalCard';
import { AssistantMessage, AssistantMessageContent } from '../AssistantMessage';
import { Button } from '../Button';
import { ChainOfThought, ChainOfThoughtStep } from '../ChainOfThought';
import { ChatInput, ChatInputSubmit, ChatInputTextarea } from '../ChatInput';
import {
  ChatPermissions,
  ChatPermissionsContent,
  ChatPermissionsItem,
  type ChatPermissionsItemCheckedChangeDetails,
  ChatPermissionsTrigger,
} from '../ChatPermissions';
import { InlineCodeSnippet } from '../CodeSnippet';
import { Copyable, CopyableIcon } from '../Copyable';
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from '../Drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { MessageAction, MessageActions, MessageTimestamp } from '../MessageActions';
import {
  createListCollection,
  Select,
  SelectButton,
  SelectContent,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
} from '../Select';
import { Separator } from '../Separator';
import { HStack } from '../Stack';
import { UserMessage, UserMessageBubble } from '../UserMessage';

const DESCRIPTION = [
  'The Wally assistant panel: a header, a scrolling message log, and a footer gutter for suggestions, a docked approval card and the input.',
  '`Chat` is layout only — it holds no messages or agent state; the app renders `UserMessage`, `AssistantMessage` and `ChatInput` into `ChatBody` and `ChatFooter` from its own data.',
  'Header actions are composed from plain ghost `Button`s and vertical `Separator`s, so each one keeps its own `aria-label` and analytics attributes.',
  '`background` picks the decorative mesh: `strong` for an empty chat, `subtle` (default) once a conversation is running, `none` to drop it.',
  'Host the panel in a right-hand `Drawer` about 480px wide; `ChatBody` exposes its scroll element through `ref` for stick-to-bottom.',
].join(' ');

const meta = {
  title: 'AI/Chat',
  component: Chat,
  subcomponents: {
    ChatHeader,
    ChatHeaderTitle,
    ChatHeaderActions,
    ChatBody,
    ChatFooter,
    ChatGreeting,
    ChatSuggestions,
    ChatSuggestion,
    ChatTrigger,
  },
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
} satisfies Meta<typeof Chat>;

export default meta;

const SUGGESTIONS = [
  'Why was this request blocked?',
  'Show top attacked endpoints',
  'Explain this rule',
];

const threads = createListCollection({
  items: [
    { value: 'blocked', label: 'Blocked requests on /login' },
    { value: 'rules', label: 'Rule tuning for API v2' },
  ],
});

/**
 * Figma Default (2:42): the "Ask Wally" title with History, a More menu, a separator and Close.
 * Every action is a ghost neutral small `Button` with an `aria-label`.
 */
export const HeaderDefault: StoryFn<typeof meta> = () => (
  <div className='h-200 w-480'>
    <Chat data-testid='chat' background='none'>
      <ChatHeader>
        <ChatHeaderTitle />
        <ChatHeaderActions>
          <Button variant='ghost' color='neutral' size='small' aria-label='Chat history'>
            <History />
          </Button>
          <DropdownMenu positioning={{ placement: 'bottom-end' }}>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' color='neutral' size='small' aria-label='More actions'>
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Rename chat</DropdownMenuItem>
              <DropdownMenuItem>Delete chat</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Separator orientation='vertical' />
          <Button variant='ghost' color='neutral' size='small' aria-label='Close chat'>
            <X />
          </Button>
        </ChatHeaderActions>
      </ChatHeader>
      <ChatBody />
    </Chat>
  </div>
);

/**
 * Figma Variant2 (44:1465): children of `ChatHeaderTitle` follow a "/" joint — here a ghost thread
 * `Select` — and a New chat action leads the toolbar.
 */
export const HeaderWithThreadSelect: StoryFn<typeof meta> = () => (
  <div className='h-200 w-480'>
    <Chat data-testid='chat' background='none'>
      <ChatHeader>
        <ChatHeaderTitle>
          <Select collection={threads} defaultValue={['blocked']}>
            <SelectButton variant='ghost' size='small' placeholder='New chat' />
            <SelectPositioner>
              <SelectContent>
                {threads.items.map(item => (
                  <SelectOption key={item.value} item={item}>
                    <SelectOptionText>{item.label}</SelectOptionText>
                    <SelectOptionIndicator />
                  </SelectOption>
                ))}
              </SelectContent>
            </SelectPositioner>
          </Select>
        </ChatHeaderTitle>
        <ChatHeaderActions>
          <Button variant='ghost' color='neutral' size='small' aria-label='New chat'>
            <Plus />
          </Button>
          <Separator orientation='vertical' />
          <Button variant='ghost' color='neutral' size='small' aria-label='Chat history'>
            <History />
          </Button>
          <DropdownMenu positioning={{ placement: 'bottom-end' }}>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' color='neutral' size='small' aria-label='More actions'>
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Rename chat</DropdownMenuItem>
              <DropdownMenuItem>Delete chat</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Separator orientation='vertical' />
          <Button variant='ghost' color='neutral' size='small' aria-label='Close chat'>
            <X />
          </Button>
        </ChatHeaderActions>
      </ChatHeader>
      <ChatBody />
    </Chat>
  </div>
);

/**
 * The empty state (Figma 44:1464): the circle mark and a heading, with Large suggestion pills
 * centered under it, over the `strong` background.
 */
export const Greeting: StoryFn<typeof meta> = () => {
  const [picked, setPicked] = useState<string>();
  const handleSuggestionClick = (event: MouseEvent<HTMLButtonElement>) =>
    setPicked(event.currentTarget.value);

  return (
    <div className='h-640 w-480'>
      <Chat data-testid='chat' background='strong'>
        <ChatHeader>
          <ChatHeaderTitle />
          <ChatHeaderActions>
            <Button variant='ghost' color='neutral' size='small' aria-label='Chat history'>
              <History />
            </Button>
            <DropdownMenu positioning={{ placement: 'bottom-end' }}>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' color='neutral' size='small' aria-label='More actions'>
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Rename chat</DropdownMenuItem>
                <DropdownMenuItem>Delete chat</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Separator orientation='vertical' />
            <Button variant='ghost' color='neutral' size='small' aria-label='Close chat'>
              <X />
            </Button>
          </ChatHeaderActions>
        </ChatHeader>
        <ChatBody>
          <ChatGreeting title='How can I help you today?'>
            <ChatSuggestions placement='greeting' label='Suggestions'>
              {SUGGESTIONS.map((text, index) => (
                <ChatSuggestion
                  key={text}
                  data-testid={`chat--suggestion-${index}`}
                  value={text}
                  onClick={handleSuggestionClick}
                >
                  {text}
                </ChatSuggestion>
              ))}
            </ChatSuggestions>
          </ChatGreeting>
          {picked && (
            <p data-testid='chat--picked' className='sr-only'>
              Picked: {picked}
            </p>
          )}
        </ChatBody>
      </Chat>
    </div>
  );
};

/**
 * Both placements: `footer` (Figma 91:1167) right-aligns Medium pills under a visible label,
 * `greeting` (Figma 44:1706) centers Large pills. The pill size follows the placement.
 */
export const Suggestions: StoryFn<typeof meta> = () => (
  <HStack gap={24} align='start'>
    <div className='h-640 w-480'>
      <Chat data-testid='chat-footer-suggestions'>
        <ChatHeader>
          <ChatHeaderTitle />
          <ChatHeaderActions>
            <Button variant='ghost' color='neutral' size='small' aria-label='Chat history'>
              <History />
            </Button>
            <DropdownMenu positioning={{ placement: 'bottom-end' }}>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' color='neutral' size='small' aria-label='More actions'>
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Rename chat</DropdownMenuItem>
                <DropdownMenuItem>Delete chat</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Separator orientation='vertical' />
            <Button variant='ghost' color='neutral' size='small' aria-label='Close chat'>
              <X />
            </Button>
          </ChatHeaderActions>
        </ChatHeader>
        <ChatBody />
        <ChatFooter>
          <ChatSuggestions label='Suggestions'>
            {SUGGESTIONS.map((text, index) => (
              <ChatSuggestion
                key={text}
                data-testid={`chat-footer-suggestions--suggestion-${index}`}
              >
                {text}
              </ChatSuggestion>
            ))}
          </ChatSuggestions>
        </ChatFooter>
      </Chat>
    </div>
    <div className='h-640 w-480'>
      <Chat data-testid='chat-greeting-suggestions' background='strong'>
        <ChatHeader>
          <ChatHeaderTitle />
          <ChatHeaderActions>
            <Button variant='ghost' color='neutral' size='small' aria-label='Chat history'>
              <History />
            </Button>
            <DropdownMenu positioning={{ placement: 'bottom-end' }}>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' color='neutral' size='small' aria-label='More actions'>
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Rename chat</DropdownMenuItem>
                <DropdownMenuItem>Delete chat</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Separator orientation='vertical' />
            <Button variant='ghost' color='neutral' size='small' aria-label='Close chat'>
              <X />
            </Button>
          </ChatHeaderActions>
        </ChatHeader>
        <ChatBody>
          <ChatGreeting title='How can I help you today?'>
            <ChatSuggestions placement='greeting'>
              {SUGGESTIONS.map((text, index) => (
                <ChatSuggestion
                  key={text}
                  data-testid={`chat-greeting-suggestions--suggestion-${index}`}
                >
                  {text}
                </ChatSuggestion>
              ))}
            </ChatSuggestions>
          </ChatGreeting>
        </ChatBody>
      </Chat>
    </div>
  </HStack>
);

const BACKGROUNDS: ChatBackground[] = ['strong', 'subtle', 'none'];

/**
 * The three `background` values side by side: `strong` (Figma Main, 12%), `subtle` (Figma Chat,
 * 5%, the default) and `none`. The mesh is decorative and sits under every part.
 */
export const Backgrounds: StoryFn<typeof meta> = () => (
  <HStack gap={24} align='start'>
    {BACKGROUNDS.map(background => (
      <div key={background} className='h-640 w-360'>
        <Chat data-testid={`chat-${background}`} background={background}>
          <ChatHeader>
            <ChatHeaderTitle />
            <ChatHeaderActions>
              <Button variant='ghost' color='neutral' size='small' aria-label='Chat history'>
                <History />
              </Button>
              <DropdownMenu positioning={{ placement: 'bottom-end' }}>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' color='neutral' size='small' aria-label='More actions'>
                    <Ellipsis />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Rename chat</DropdownMenuItem>
                  <DropdownMenuItem>Delete chat</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Separator orientation='vertical' />
              <Button variant='ghost' color='neutral' size='small' aria-label='Close chat'>
                <X />
              </Button>
            </ChatHeaderActions>
          </ChatHeader>
          <ChatBody />
        </Chat>
      </div>
    ))}
  </HStack>
);

/**
 * Analytics attributes go on the interactive parts only: `data-analytics-id` on a `ChatSuggestion`
 * lands on its `<button>`; header actions are plain DS `Button`s and carry their own. Keep them off
 * the `Chat` root — a click anywhere inside would resolve to it.
 */
export const Analytics: StoryFn<typeof meta> = () => (
  <div className='h-640 w-480'>
    <Chat data-testid='chat'>
      <ChatHeader>
        <ChatHeaderTitle />
        <ChatHeaderActions>
          <Button
            variant='ghost'
            color='neutral'
            size='small'
            aria-label='Close chat'
            data-analytics-id='AI_CHAT_CLOSE'
          >
            <X />
          </Button>
        </ChatHeaderActions>
      </ChatHeader>
      <ChatBody />
      <ChatFooter>
        <ChatSuggestions label='Suggestions'>
          {SUGGESTIONS.map((text, index) => (
            <ChatSuggestion
              key={text}
              data-testid={`chat--suggestion-${index}`}
              data-analytics-id='AI_CHAT_SUGGESTION'
              data-analytics-props={JSON.stringify({ index })}
            >
              {text}
            </ChatSuggestion>
          ))}
        </ChatSuggestions>
      </ChatFooter>
    </Chat>
  </div>
);

/**
 * The app-header button that opens the panel (Figma 101:1034): the Wally mascot in a ghost small
 * `Button`, with an "Ask Wally" tooltip that doubles as its accessible name (`label`).
 */
export const Trigger: StoryFn<typeof meta> = () => <ChatTrigger data-testid='chat-trigger' />;

/**
 * `ChatTrigger` under `DrawerTrigger asChild`: the drawer owns the open state and `aria-expanded`,
 * the tooltip keeps its anchor through the shared trigger id.
 */
export const TriggerWithDrawer: StoryFn<typeof meta> = () => (
  <Drawer width={480}>
    <DrawerTrigger asChild>
      <ChatTrigger data-testid='chat-trigger' data-analytics-id='AI_CHAT_OPEN' />
    </DrawerTrigger>
    <DrawerContent>
      <Chat data-testid='chat'>
        <ChatHeader>
          <ChatHeaderTitle />
          <ChatHeaderActions>
            <Button variant='ghost' color='neutral' size='small' aria-label='Chat history'>
              <History />
            </Button>
            <DropdownMenu positioning={{ placement: 'bottom-end' }}>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' color='neutral' size='small' aria-label='More actions'>
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Rename chat</DropdownMenuItem>
                <DropdownMenuItem>Delete chat</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Separator orientation='vertical' />
            <Button variant='ghost' color='neutral' size='small' aria-label='Close chat'>
              <X />
            </Button>
          </ChatHeaderActions>
        </ChatHeader>
        <ChatBody />
      </Chat>
    </DrawerContent>
  </Drawer>
);

// ---------------------------------------------------------------------------
// Composed panels: every AI part together, with mock data only.
// ---------------------------------------------------------------------------

const QUESTION = 'Why were requests to /api/login blocked last night?';
const ANSWER_TEXT =
  'Wallarm blocked 1,204 SQL injection attempts against /api/login, mostly from 203.0.113.0/24.';
const FOLLOW_UPS = ['Deny 203.0.113.0/24', 'Show the matched rule'];

/**
 * The full empty panel: the greeting with Large suggestion pills over the `strong` background,
 * and the composer in the footer. A pill click would send its text as the first message.
 */
export const EmptyPanel: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState('');
  const handleSubmit = () => setValue('');

  return (
    <div className='h-640 w-480'>
      <Chat data-testid='chat' background='strong'>
        <ChatHeader>
          <ChatHeaderTitle />
          <ChatHeaderActions>
            <Button variant='ghost' color='neutral' size='small' aria-label='Chat history'>
              <History />
            </Button>
            <DropdownMenu positioning={{ placement: 'bottom-end' }}>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' color='neutral' size='small' aria-label='More actions'>
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Rename chat</DropdownMenuItem>
                <DropdownMenuItem>Delete chat</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Separator orientation='vertical' />
            <Button variant='ghost' color='neutral' size='small' aria-label='Close chat'>
              <X />
            </Button>
          </ChatHeaderActions>
        </ChatHeader>
        <ChatBody>
          <ChatGreeting title='How can I help you today?'>
            <ChatSuggestions placement='greeting' label='Suggestions'>
              {SUGGESTIONS.map((text, index) => (
                <ChatSuggestion key={text} data-testid={`chat--suggestion-${index}`}>
                  {text}
                </ChatSuggestion>
              ))}
            </ChatSuggestions>
          </ChatGreeting>
        </ChatBody>
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
 * A finished turn: the user's question, then Wally's answer with collapsed reasoning, rendered
 * markdown and a visible actions row; follow-up suggestions sit above the composer.
 */
export const Conversation: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState('');
  const handleSubmit = () => setValue('');

  return (
    <div className='h-640 w-480'>
      <Chat data-testid='chat'>
        <ChatHeader>
          <ChatHeaderTitle />
          <ChatHeaderActions>
            <Button variant='ghost' color='neutral' size='small' aria-label='Chat history'>
              <History />
            </Button>
            <DropdownMenu positioning={{ placement: 'bottom-end' }}>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' color='neutral' size='small' aria-label='More actions'>
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Rename chat</DropdownMenuItem>
                <DropdownMenuItem>Delete chat</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Separator orientation='vertical' />
            <Button variant='ghost' color='neutral' size='small' aria-label='Close chat'>
              <X />
            </Button>
          </ChatHeaderActions>
        </ChatHeader>
        <ChatBody>
          <UserMessage data-testid='chat--user-message-0'>
            <UserMessageBubble>{QUESTION}</UserMessageBubble>
            <MessageActions>
              <MessageTimestamp dateTime='2026-10-21T09:41:00Z'>2m ago</MessageTimestamp>
              <Copyable text={QUESTION}>
                <MessageAction aria-label='Copy'>
                  <CopyableIcon />
                </MessageAction>
              </Copyable>
            </MessageActions>
          </UserMessage>
          <AssistantMessage data-testid='chat--assistant-message-0'>
            <ChainOfThought>
              <ChainOfThoughtStep icon={<Brain />} label='Thought for 5s'>
                <p>
                  Look up blocked requests to /api/login for last night, then group them by source.
                </p>
              </ChainOfThoughtStep>
              <ChainOfThoughtStep icon={<Search />} label='Searched for blocked requests' />
              <ChainOfThoughtStep
                icon={<Database />}
                label='Queried attack events'
                metric='1,204'
              />
            </ChainOfThought>
            <AssistantMessageContent>
              <h3>SQL injection on the login endpoint</h3>
              <p>
                Wallarm blocked 1,204 SQL injection attempts, almost all against{' '}
                <InlineCodeSnippet code='/api/login' size='sm' />.
              </p>
              <ul>
                <li>
                  Most came from <InlineCodeSnippet code='203.0.113.0/24' size='sm' />.
                </li>
                <li>The peak was at 03:00 UTC.</li>
                <li>No request reached the application.</li>
              </ul>
            </AssistantMessageContent>
            <MessageActions visible>
              <Copyable text={ANSWER_TEXT}>
                <MessageAction aria-label='Copy' data-testid='chat--answer-copy'>
                  <CopyableIcon />
                </MessageAction>
              </Copyable>
              <MessageAction aria-label='Good response'>
                <ThumbsUp />
              </MessageAction>
              <MessageAction aria-label='Bad response'>
                <ThumbsDown />
              </MessageAction>
              <MessageTimestamp dateTime='2026-10-21T09:42:00Z'>1m ago</MessageTimestamp>
            </MessageActions>
          </AssistantMessage>
        </ChatBody>
        <ChatFooter>
          <ChatSuggestions label='Suggestions'>
            {FOLLOW_UPS.map((text, index) => (
              <ChatSuggestion key={text} data-testid={`chat--suggestion-${index}`}>
                {text}
              </ChatSuggestion>
            ))}
          </ChatSuggestions>
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
 * A reply in flight: `ChatBody` and the message carry `aria-busy`, the running step shimmers,
 * and the submit is Stop. Stop (or Esc in the textarea) ends the run in this demo.
 */
export const Streaming: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState('');
  const [isRunning, setIsRunning] = useState(true);
  const handleSubmit = () => setValue('');
  const handleStop = () => setIsRunning(false);

  return (
    <div className='h-640 w-480'>
      <Chat data-testid='chat'>
        <ChatHeader>
          <ChatHeaderTitle />
          <ChatHeaderActions>
            <Button variant='ghost' color='neutral' size='small' aria-label='Chat history'>
              <History />
            </Button>
            <DropdownMenu positioning={{ placement: 'bottom-end' }}>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' color='neutral' size='small' aria-label='More actions'>
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Rename chat</DropdownMenuItem>
                <DropdownMenuItem>Delete chat</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Separator orientation='vertical' />
            <Button variant='ghost' color='neutral' size='small' aria-label='Close chat'>
              <X />
            </Button>
          </ChatHeaderActions>
        </ChatHeader>
        <ChatBody aria-busy={isRunning}>
          <UserMessage data-testid='chat--user-message-0'>
            <UserMessageBubble>{QUESTION}</UserMessageBubble>
            <MessageActions>
              <MessageTimestamp dateTime='2026-10-21T09:41:00Z'>2m ago</MessageTimestamp>
              <Copyable text={QUESTION}>
                <MessageAction aria-label='Copy'>
                  <CopyableIcon />
                </MessageAction>
              </Copyable>
            </MessageActions>
          </UserMessage>
          <AssistantMessage data-testid='chat--assistant-message-0' aria-busy={isRunning}>
            <ChainOfThought>
              <ChainOfThoughtStep icon={<Search />} label='Searched for blocked requests' />
              <ChainOfThoughtStep
                icon={<Database />}
                label={isRunning ? 'Querying attack events...' : 'Stopped'}
                status={isRunning ? 'running' : 'done'}
              />
            </ChainOfThought>
            <AssistantMessageContent>
              <p>Wallarm blocked 1,204 SQL injection attempts, almost all against</p>
            </AssistantMessageContent>
          </AssistantMessage>
        </ChatBody>
        <ChatFooter>
          <ChatInput
            value={value}
            onValueChange={setValue}
            onSubmit={handleSubmit}
            isRunning={isRunning}
            onStop={handleStop}
          >
            <ChatInputTextarea />
            <ChatInputSubmit />
          </ChatInput>
        </ChatFooter>
      </Chat>
    </div>
  );
};

/**
 * Human-in-the-loop: the pending `ApprovalCard` is docked in `ChatFooter` above the composer
 * while the run waits. Allow or Reject resolves it in place (so its live region and focus work)
 * and the answer continues.
 */
export const ApprovalDocked: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<ApprovalCardStatus>('pending');
  const pending = status === 'pending';
  const handleSubmit = () => setValue('');
  const handleApprove = () => setStatus('approved');
  const handleReject = () => setStatus('rejected');

  return (
    <div className='h-640 w-480'>
      <Chat data-testid='chat'>
        <ChatHeader>
          <ChatHeaderTitle />
          <ChatHeaderActions>
            <Button variant='ghost' color='neutral' size='small' aria-label='Chat history'>
              <History />
            </Button>
            <DropdownMenu positioning={{ placement: 'bottom-end' }}>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' color='neutral' size='small' aria-label='More actions'>
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Rename chat</DropdownMenuItem>
                <DropdownMenuItem>Delete chat</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Separator orientation='vertical' />
            <Button variant='ghost' color='neutral' size='small' aria-label='Close chat'>
              <X />
            </Button>
          </ChatHeaderActions>
        </ChatHeader>
        <ChatBody aria-busy={pending}>
          <UserMessage data-testid='chat--user-message-0'>
            <UserMessageBubble>{QUESTION}</UserMessageBubble>
            <MessageActions>
              <MessageTimestamp dateTime='2026-10-21T09:41:00Z'>2m ago</MessageTimestamp>
              <Copyable text={QUESTION}>
                <MessageAction aria-label='Copy'>
                  <CopyableIcon />
                </MessageAction>
              </Copyable>
            </MessageActions>
          </UserMessage>
          <AssistantMessage data-testid='chat--assistant-message-0'>
            <ChainOfThought>
              <ChainOfThoughtStep icon={<Search />} label='Searched for blocked requests' />
              <ChainOfThoughtStep
                icon={<ShieldBan />}
                label='Proposed a denylist entry'
                status={pending ? 'running' : 'done'}
              />
            </ChainOfThought>
            {!pending && (
              <AssistantMessageContent>
                <p>
                  {status === 'approved'
                    ? 'Done. 203.0.113.0/24 is now denied on all applications.'
                    : 'Okay, I left the denylist unchanged.'}
                </p>
              </AssistantMessageContent>
            )}
          </AssistantMessage>
        </ChatBody>
        <ChatFooter>
          <ApprovalCard status={status}>
            <ApprovalCardContent>
              <p>
                Add <InlineCodeSnippet code='203.0.113.0/24' size='sm' /> to the denylist on all
                applications
              </p>
            </ApprovalCardContent>
            <ApprovalCardActions>
              <Button data-testid='chat--approve' onClick={handleApprove}>
                Allow
              </Button>
              <Button
                variant='secondary'
                color='neutral'
                data-testid='chat--reject'
                onClick={handleReject}
              >
                Reject
              </Button>
            </ApprovalCardActions>
          </ApprovalCard>
          <ChatInput
            value={value}
            onValueChange={setValue}
            onSubmit={handleSubmit}
            isRunning={pending}
          >
            <ChatInputTextarea />
            <ChatInputSubmit />
          </ChatInput>
        </ChatFooter>
      </Chat>
    </div>
  );
};

/** After the decision the docked card collapses to a one-line status and the answer completes. */
export const ApprovalResolved: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState('');
  const handleSubmit = () => setValue('');

  return (
    <div className='h-640 w-480'>
      <Chat data-testid='chat'>
        <ChatHeader>
          <ChatHeaderTitle />
          <ChatHeaderActions>
            <Button variant='ghost' color='neutral' size='small' aria-label='Chat history'>
              <History />
            </Button>
            <DropdownMenu positioning={{ placement: 'bottom-end' }}>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' color='neutral' size='small' aria-label='More actions'>
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Rename chat</DropdownMenuItem>
                <DropdownMenuItem>Delete chat</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Separator orientation='vertical' />
            <Button variant='ghost' color='neutral' size='small' aria-label='Close chat'>
              <X />
            </Button>
          </ChatHeaderActions>
        </ChatHeader>
        <ChatBody>
          <UserMessage data-testid='chat--user-message-0'>
            <UserMessageBubble>{QUESTION}</UserMessageBubble>
            <MessageActions>
              <MessageTimestamp dateTime='2026-10-21T09:41:00Z'>2m ago</MessageTimestamp>
              <Copyable text={QUESTION}>
                <MessageAction aria-label='Copy'>
                  <CopyableIcon />
                </MessageAction>
              </Copyable>
            </MessageActions>
          </UserMessage>
          <AssistantMessage data-testid='chat--assistant-message-0'>
            <ChainOfThought>
              <ChainOfThoughtStep icon={<Search />} label='Searched for blocked requests' />
              <ChainOfThoughtStep icon={<ShieldBan />} label='Proposed a denylist entry' />
            </ChainOfThought>
            <AssistantMessageContent>
              <p>Done. 203.0.113.0/24 is now denied on all applications.</p>
            </AssistantMessageContent>
          </AssistantMessage>
        </ChatBody>
        <ChatFooter>
          {/* Content and actions render only while pending; a resolved card shows just its status row. */}
          <ApprovalCard status='approved' />
          <ChatInput value={value} onValueChange={setValue} onSubmit={handleSubmit}>
            <ChatInputTextarea />
            <ChatInputSubmit />
          </ChatInput>
        </ChatFooter>
      </Chat>
    </div>
  );
};

const TOOLS = [
  { name: 'search_attacks', description: 'Search attacks and blocked requests' },
  { name: 'get_api_inventory', description: 'Read the discovered API endpoints' },
  { name: 'propose_add_to_denylist', description: 'Propose adding IPs to the denylist' },
];

/** The per-conversation tool permissions sit inside the composer, between textarea and submit. */
export const Permissions: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState('');
  const [allowed, setAllowed] = useState<Record<string, boolean>>({
    search_attacks: true,
    get_api_inventory: true,
    propose_add_to_denylist: false,
  });
  const handleSubmit = () => setValue('');
  const handlePermissionChange = ({ checked, name }: ChatPermissionsItemCheckedChangeDetails) =>
    setAllowed(prev => ({ ...prev, [name]: checked }));

  return (
    <div className='h-640 w-480'>
      <Chat data-testid='chat' background='strong'>
        <ChatHeader>
          <ChatHeaderTitle />
          <ChatHeaderActions>
            <Button variant='ghost' color='neutral' size='small' aria-label='Chat history'>
              <History />
            </Button>
            <DropdownMenu positioning={{ placement: 'bottom-end' }}>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' color='neutral' size='small' aria-label='More actions'>
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Rename chat</DropdownMenuItem>
                <DropdownMenuItem>Delete chat</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Separator orientation='vertical' />
            <Button variant='ghost' color='neutral' size='small' aria-label='Close chat'>
              <X />
            </Button>
          </ChatHeaderActions>
        </ChatHeader>
        <ChatBody>
          <ChatGreeting title='How can I help you today?' />
        </ChatBody>
        <ChatFooter>
          <ChatInput value={value} onValueChange={setValue} onSubmit={handleSubmit}>
            <ChatInputTextarea />
            <ChatPermissions>
              <ChatPermissionsTrigger />
              <ChatPermissionsContent>
                {TOOLS.map(tool => (
                  <ChatPermissionsItem
                    key={tool.name}
                    name={tool.name}
                    data-testid={`chat--permission-${tool.name}`}
                    title={tool.name}
                    description={tool.description}
                    checked={allowed[tool.name]}
                    onCheckedChange={handlePermissionChange}
                  />
                ))}
              </ChatPermissionsContent>
            </ChatPermissions>
            <ChatInputSubmit />
          </ChatInput>
        </ChatFooter>
      </Chat>
    </div>
  );
};

/**
 * The real host: `ChatTrigger` opens a 480px right-hand `Drawer` holding the conversation, and
 * Close is a `DrawerClose`. Esc in the textarea while running stops the reply instead of closing
 * the drawer; ChatInput handles that itself, so the host needs no `onEscapeKeyDown`.
 */
export const InDrawer: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState('');
  const [isRunning, setIsRunning] = useState(true);
  const handleSubmit = () => setValue('');
  const handleStop = () => setIsRunning(false);

  return (
    <Drawer width={480}>
      <DrawerTrigger asChild>
        <ChatTrigger data-testid='chat-trigger' />
      </DrawerTrigger>
      <DrawerContent>
        <Chat data-testid='chat'>
          <ChatHeader>
            <ChatHeaderTitle />
            <ChatHeaderActions>
              <Button variant='ghost' color='neutral' size='small' aria-label='Chat history'>
                <History />
              </Button>
              <DropdownMenu positioning={{ placement: 'bottom-end' }}>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' color='neutral' size='small' aria-label='More actions'>
                    <Ellipsis />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Rename chat</DropdownMenuItem>
                  <DropdownMenuItem>Delete chat</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Separator orientation='vertical' />
              <DrawerClose asChild>
                <Button variant='ghost' color='neutral' size='small' aria-label='Close chat'>
                  <X />
                </Button>
              </DrawerClose>
            </ChatHeaderActions>
          </ChatHeader>
          <ChatBody aria-busy={isRunning}>
            <UserMessage data-testid='chat--user-message-0'>
              <UserMessageBubble>{QUESTION}</UserMessageBubble>
              <MessageActions>
                <MessageTimestamp dateTime='2026-10-21T09:41:00Z'>2m ago</MessageTimestamp>
                <Copyable text={QUESTION}>
                  <MessageAction aria-label='Copy'>
                    <CopyableIcon />
                  </MessageAction>
                </Copyable>
              </MessageActions>
            </UserMessage>
            <AssistantMessage data-testid='chat--assistant-message-0' aria-busy={isRunning}>
              <ChainOfThought>
                <ChainOfThoughtStep icon={<Brain />} label='Thought for 5s'>
                  <p>
                    Look up blocked requests to /api/login for last night, then group them by
                    source.
                  </p>
                </ChainOfThoughtStep>
                <ChainOfThoughtStep icon={<Search />} label='Searched for blocked requests' />
                <ChainOfThoughtStep
                  icon={<Database />}
                  label='Queried attack events'
                  metric='1,204'
                />
              </ChainOfThought>
              <AssistantMessageContent>
                <h3>SQL injection on the login endpoint</h3>
                <p>
                  Wallarm blocked 1,204 SQL injection attempts, almost all against{' '}
                  <InlineCodeSnippet code='/api/login' size='sm' />.
                </p>
                <ul>
                  <li>
                    Most came from <InlineCodeSnippet code='203.0.113.0/24' size='sm' />.
                  </li>
                  <li>The peak was at 03:00 UTC.</li>
                  <li>No request reached the application.</li>
                </ul>
              </AssistantMessageContent>
              {!isRunning && (
                <MessageActions visible>
                  <Copyable text={ANSWER_TEXT}>
                    <MessageAction aria-label='Copy' data-testid='chat--answer-copy'>
                      <CopyableIcon />
                    </MessageAction>
                  </Copyable>
                  <MessageAction aria-label='Good response'>
                    <ThumbsUp />
                  </MessageAction>
                  <MessageAction aria-label='Bad response'>
                    <ThumbsDown />
                  </MessageAction>
                  <MessageTimestamp dateTime='2026-10-21T09:42:00Z'>1m ago</MessageTimestamp>
                </MessageActions>
              )}
            </AssistantMessage>
          </ChatBody>
          <ChatFooter>
            <ChatInput
              value={value}
              onValueChange={setValue}
              onSubmit={handleSubmit}
              isRunning={isRunning}
              onStop={handleStop}
            >
              <ChatInputTextarea />
              <ChatInputSubmit />
            </ChatInput>
          </ChatFooter>
        </Chat>
      </DrawerContent>
    </Drawer>
  );
};
