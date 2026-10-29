import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import {
  type ChatAssistantMessage,
  type ChatFeedback,
  ChatMessageView,
  ChatPartView,
  type ChatSnapshot,
  type ChatToolPermission,
  type ChatViewConfig,
  ChatViewProvider,
  copyTextOf,
  deriveChatState,
  WallyAssistant,
} from '.';
import { Ellipsis, History, Paperclip, Plus, X } from '../../icons';
import { Button } from '../Button';
import { Chat, ChatFooter, ChatHeader, ChatHeaderTitle, ChatTrigger } from '../Chat';
import { ChatInput, ChatInputSubmit, ChatInputTextarea } from '../ChatInput';
import {
  ConversationContent,
  Conversation as ConversationRoot,
  ConversationScrollButton,
} from '../Conversation';
import { Copyable, CopyableIcon } from '../Copyable';
import { Drawer, DrawerClose, DrawerContent, DrawerTitle, DrawerTrigger } from '../Drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { MessageAction } from '../MessageActions';
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
import { APPROVAL_PENDING, CONVERSATION, EMPTY, ERROR_TURN, useMockWally } from './mocks';

const DESCRIPTION = [
  'The closed Wally panel: pass a `ChatSnapshot` (messages, status, suggestions, permissions, context) and callbacks, and it renders the whole Figma chat — header, stick-to-bottom log, greeting, chain of thought, docked approval and input.',
  'It holds no agent state: the app folds its stream into a new snapshot on every delta. Send is blocked while the last message has a pending approval (typing still works), and a resolved card stays docked until the next message.',
  'Every rule lives in exported pieces — `ChatViewProvider`, `deriveChatState`, `ChatMessageView`, `ChatPartView` — so a custom layout reuses them (Custom Layout). Seams like `renderPart`, `renderStepContent` and `renderMessageActions` hand back the default rendering.',
  'Stories are driven by `useMockWally()` from `WallyAssistant/mocks` and keep feedback and permissions in app state. Messages render with the default `AssistantMessageMarkdown`, and fenced code highlights with the lazy Prism adapter WallyAssistant mounts unless the app provides a `CodeSnippetAdapterProvider`.',
].join(' ');

const meta = {
  title: 'AI/WallyAssistant',
  component: WallyAssistant,
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
} satisfies Meta<typeof WallyAssistant>;

export default meta;

// --- story data and config -----------------------------------------------------------------------------

/** Fixed (UTC) clock text, so screenshots don't drift. */
const fixedTime = (iso: string) => new Date(iso).toISOString().slice(11, 16);

/**
 * Merges app-held feedback into an assistant message, caching one object per (message, feedback)
 * pair so a streaming delta doesn't hand untouched rows a new identity (§7.2).
 */
const merged = new WeakMap<
  ChatAssistantMessage,
  { feedback: ChatFeedback | null; message: ChatAssistantMessage }
>();
const withFeedback = (
  m: ChatAssistantMessage,
  feedback: ChatFeedback | null,
): ChatAssistantMessage => {
  const hit = merged.get(m);
  if (hit && hit.feedback === feedback) return hit.message;
  const message = { ...m, feedback };
  merged.set(m, { feedback, message });
  return message;
};

interface AttackSummary {
  total: number;
  blocked: number;
}

const OVERRIDES: ChatSnapshot = {
  ...CONVERSATION,
  messages: [
    ...CONVERSATION.messages,
    {
      role: 'user',
      id: 'u3',
      createdAt: '2026-10-21T09:02:00.000Z',
      parts: [{ type: 'text', id: 'u3:text', text: 'Summarize the attacks' }],
    },
    {
      role: 'assistant',
      id: 'u3:reply',
      createdAt: '2026-10-21T09:02:04.000Z',
      parts: [
        {
          type: 'chain-of-thought',
          id: 'u3:reply:cot:0',
          steps: [
            {
              id: 'search',
              kind: 'tool',
              name: 'search_attacks',
              icon: 'query',
              status: 'done',
              label: 'Searched attacks',
              metric: '3 sources',
            },
          ],
        },
        {
          type: 'custom',
          id: 'u3:reply:summary',
          kind: 'wallarm.attack-summary',
          data: { total: 1204, blocked: 1019 } satisfies AttackSummary,
        },
        {
          type: 'text',
          id: 'u3:reply:text',
          text: 'Most of it is SQL injection from `203.0.113.7`.',
        },
      ],
    },
  ],
};

const SOURCES = [
  { ip: '203.0.113.7', attacks: 185 },
  { ip: '198.51.100.4', attacks: 610 },
  { ip: '192.0.2.10', attacks: 409 },
];

const threads = createListCollection({
  items: [
    { value: 'attacks', label: 'Top attacks today' },
    { value: 'rules', label: 'Rule tuning for API v2' },
  ],
});

// Render seams stay at module scope so their identity is stable (ChatViewProvider memoizes on it).
const renderPart: ChatViewConfig['renderPart'] = part => {
  if (part.type !== 'custom' || part.kind !== 'wallarm.attack-summary') return undefined;
  const { total, blocked } = part.data as AttackSummary;
  return (
    <div
      data-testid='attack-summary'
      className='rounded-8 border border-border-primary-light p-12 text-sm text-text-primary'
    >
      {blocked} of {total} attacks blocked
    </div>
  );
};

const renderStepContent: ChatViewConfig['renderStepContent'] = step =>
  step.name === 'search_attacks' ? (
    <table data-testid='search-table' className='text-xs text-text-secondary'>
      <tbody>
        {SOURCES.map(s => (
          <tr key={s.ip}>
            <td className='pr-12 font-mono'>{s.ip}</td>
            <td>{s.attacks}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : undefined;

// Overrides: tagged Copy with a German label, an Ellipsis menu, then the default like/dislike/timestamp.
const renderMessageActions: ChatViewConfig['renderMessageActions'] = (m, a) =>
  m.role === 'user' ? undefined : (
    <>
      <Copyable text={copyTextOf(m)}>
        <MessageAction aria-label='Kopieren' data-analytics-id='wally.copy'>
          <CopyableIcon />
        </MessageAction>
      </Copyable>
      {a.like}
      {a.dislike}
      <DropdownMenu positioning={{ placement: 'bottom-end' }}>
        <DropdownMenuTrigger asChild>
          <MessageAction aria-label='More actions' data-analytics-id='wally.more'>
            <Ellipsis />
          </MessageAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem data-analytics-id='wally.report'>Report {m.id}</DropdownMenuItem>
          <DropdownMenuItem>Share</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {a.timestamp}
    </>
  );

// Analytics: the default actions, with Copy swapped for one carrying `data-analytics-id`.
const renderAnalyticsActions: ChatViewConfig['renderMessageActions'] = (m, a) =>
  m.role === 'user' ? undefined : (
    <>
      <Copyable text={copyTextOf(m)}>
        <MessageAction aria-label='Copy' data-analytics-id='wally.copy'>
          <CopyableIcon />
        </MessageAction>
      </Copyable>
      {a.like}
      {a.dislike}
      {a.timestamp}
    </>
  );

// --- stories ------------------------------------------------------------------------------------

/** No messages: the greeting with Large suggestion pills on the strong background. A pill starts a run. */
export const Empty: StoryFn<typeof meta> = () => {
  const wally = useMockWally({ initial: EMPTY });
  const [feedback, setFeedback] = useState<Record<string, ChatFeedback | null>>({});
  const [permissions, setPermissions] = useState(EMPTY.permissions);
  const messages = wally.snapshot.messages.map(m =>
    m.role === 'assistant' && m.id in feedback ? withFeedback(m, feedback[m.id] ?? null) : m,
  );

  const handleFeedback = (message: ChatAssistantMessage, value: ChatFeedback | null) => {
    setFeedback(f => ({ ...f, [message.id]: value }));
  };

  const handlePermissionChange = (permission: ChatToolPermission, allowed: boolean) => {
    setPermissions(list => list?.map(x => (x.id === permission.id ? { ...x, allowed } : x)));
  };

  return (
    <div className='h-640 w-480'>
      <WallyAssistant
        data-testid='wally'
        {...wally.snapshot}
        messages={messages}
        permissions={permissions}
        formatTimestamp={fixedTime}
        onSubmit={wally.send}
        onStop={wally.stop}
        onApprovalRespond={wally.respond}
        onFeedback={handleFeedback}
        onPermissionChange={handlePermissionChange}
      />
    </div>
  );
};

/** Two finished turns: folded chain of thought, answers with Copy, thumbs and timestamps, follow-up pills and the permissions button. */
export const Conversation: StoryFn<typeof meta> = () => {
  const wally = useMockWally({ initial: CONVERSATION });
  const [feedback, setFeedback] = useState<Record<string, ChatFeedback | null>>({});
  const [permissions, setPermissions] = useState(CONVERSATION.permissions);
  const messages = wally.snapshot.messages.map(m =>
    m.role === 'assistant' && m.id in feedback ? withFeedback(m, feedback[m.id] ?? null) : m,
  );

  const handleFeedback = (message: ChatAssistantMessage, value: ChatFeedback | null) => {
    setFeedback(f => ({ ...f, [message.id]: value }));
  };

  const handlePermissionChange = (permission: ChatToolPermission, allowed: boolean) => {
    setPermissions(list => list?.map(x => (x.id === permission.id ? { ...x, allowed } : x)));
  };

  return (
    <div className='h-640 w-480'>
      <WallyAssistant
        data-testid='wally'
        {...wally.snapshot}
        messages={messages}
        permissions={permissions}
        formatTimestamp={fixedTime}
        onSubmit={wally.send}
        onStop={wally.stop}
        onApprovalRespond={wally.respond}
        onFeedback={handleFeedback}
        onPermissionChange={handlePermissionChange}
      />
    </div>
  );
};

/**
 * The whole Wally script from `useMockWally()`: send a message or click a pill to watch the loader,
 * a live reasoning step, three tool steps with the Working row between them, the streamed answer,
 * then the fold under "Worked for 12s". Stop cancels the run. `speed` scales every delay (0 = instant).
 */
export const StreamingSimulation: StoryFn<{ speed: number }> = ({ speed }) => {
  const wally = useMockWally({ initial: CONVERSATION, speed });
  const [feedback, setFeedback] = useState<Record<string, ChatFeedback | null>>({});
  const [permissions, setPermissions] = useState(CONVERSATION.permissions);
  const messages = wally.snapshot.messages.map(m =>
    m.role === 'assistant' && m.id in feedback ? withFeedback(m, feedback[m.id] ?? null) : m,
  );

  const handleFeedback = (message: ChatAssistantMessage, value: ChatFeedback | null) => {
    setFeedback(f => ({ ...f, [message.id]: value }));
  };

  const handlePermissionChange = (permission: ChatToolPermission, allowed: boolean) => {
    setPermissions(list => list?.map(x => (x.id === permission.id ? { ...x, allowed } : x)));
  };

  return (
    <div className='h-640 w-480'>
      <WallyAssistant
        data-testid='wally'
        {...wally.snapshot}
        messages={messages}
        permissions={permissions}
        formatTimestamp={fixedTime}
        onSubmit={wally.send}
        onStop={wally.stop}
        onApprovalRespond={wally.respond}
        onFeedback={handleFeedback}
        onPermissionChange={handlePermissionChange}
      />
    </div>
  );
};
StreamingSimulation.args = { speed: 1 };
StreamingSimulation.argTypes = {
  speed: { control: { type: 'range', min: 0, max: 3, step: 0.25 } },
};

/** A pending approval docked above the input: Send is blocked (typing still works). Allow or Reject goes through `onApprovalRespond`, and the next snapshot resolves the card in place. */
export const Approval: StoryFn<typeof meta> = () => {
  const wally = useMockWally({ initial: APPROVAL_PENDING });
  const [feedback, setFeedback] = useState<Record<string, ChatFeedback | null>>({});
  const [permissions, setPermissions] = useState(APPROVAL_PENDING.permissions);
  const messages = wally.snapshot.messages.map(m =>
    m.role === 'assistant' && m.id in feedback ? withFeedback(m, feedback[m.id] ?? null) : m,
  );

  const handleFeedback = (message: ChatAssistantMessage, value: ChatFeedback | null) => {
    setFeedback(f => ({ ...f, [message.id]: value }));
  };

  const handlePermissionChange = (permission: ChatToolPermission, allowed: boolean) => {
    setPermissions(list => list?.map(x => (x.id === permission.id ? { ...x, allowed } : x)));
  };

  return (
    <div className='h-640 w-480'>
      <WallyAssistant
        data-testid='wally'
        {...wally.snapshot}
        messages={messages}
        permissions={permissions}
        formatTimestamp={fixedTime}
        onSubmit={wally.send}
        onStop={wally.stop}
        onApprovalRespond={wally.respond}
        onFeedback={handleFeedback}
        onPermissionChange={handlePermissionChange}
      />
    </div>
  );
};

/** A run that failed before any output: `AssistantMessageError` with Retry, wired to `onRetry`. */
const ErrorStory: StoryFn<typeof meta> = () => {
  const wally = useMockWally({ initial: ERROR_TURN });
  const [feedback, setFeedback] = useState<Record<string, ChatFeedback | null>>({});
  const [permissions, setPermissions] = useState(ERROR_TURN.permissions);
  const [retries, setRetries] = useState(0);
  const messages = wally.snapshot.messages.map(m =>
    m.role === 'assistant' && m.id in feedback ? withFeedback(m, feedback[m.id] ?? null) : m,
  );

  const handleFeedback = (message: ChatAssistantMessage, value: ChatFeedback | null) => {
    setFeedback(f => ({ ...f, [message.id]: value }));
  };

  const handlePermissionChange = (permission: ChatToolPermission, allowed: boolean) => {
    setPermissions(list => list?.map(x => (x.id === permission.id ? { ...x, allowed } : x)));
  };

  const handleRetry = () => {
    setRetries(n => n + 1);
  };

  return (
    <div className='h-640 w-480'>
      <WallyAssistant
        data-testid='wally'
        {...wally.snapshot}
        messages={messages}
        permissions={permissions}
        formatTimestamp={fixedTime}
        onSubmit={wally.send}
        onStop={wally.stop}
        onApprovalRespond={wally.respond}
        onFeedback={handleFeedback}
        onPermissionChange={handlePermissionChange}
        onRetry={handleRetry}
        footerStart={
          retries ? <p className='text-xs text-text-secondary'>Retried {retries}×</p> : null
        }
      />
    </div>
  );
};

export { ErrorStory as Error };

/**
 * Every seam at once: `renderPart` draws a `custom` attack summary, `renderStepContent` puts a table
 * under `search_attacks`, `renderMessageActions` adds a tagged Copy and an Ellipsis menu, a thread
 * `Select` in `headerTitle`, an attach button in `inputTools`, and German `labels`.
 */
export const Overrides: StoryFn<typeof meta> = () => {
  const wally = useMockWally({ initial: OVERRIDES });
  const [feedback, setFeedback] = useState<Record<string, ChatFeedback | null>>({});
  const [permissions, setPermissions] = useState(OVERRIDES.permissions);
  const messages = wally.snapshot.messages.map(m =>
    m.role === 'assistant' && m.id in feedback ? withFeedback(m, feedback[m.id] ?? null) : m,
  );

  const handleFeedback = (message: ChatAssistantMessage, value: ChatFeedback | null) => {
    setFeedback(f => ({ ...f, [message.id]: value }));
  };

  const handlePermissionChange = (permission: ChatToolPermission, allowed: boolean) => {
    setPermissions(list => list?.map(x => (x.id === permission.id ? { ...x, allowed } : x)));
  };

  return (
    <div className='h-640 w-480'>
      <WallyAssistant
        data-testid='wally'
        {...wally.snapshot}
        messages={messages}
        permissions={permissions}
        formatTimestamp={fixedTime}
        onSubmit={wally.send}
        onStop={wally.stop}
        onApprovalRespond={wally.respond}
        onFeedback={handleFeedback}
        onPermissionChange={handlePermissionChange}
        renderPart={renderPart}
        renderStepContent={renderStepContent}
        renderMessageActions={renderMessageActions}
        headerTitle={
          <Select collection={threads} defaultValue={['attacks']}>
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
        }
        inputTools={
          <Button variant='ghost' color='neutral' size='small' aria-label='Datei anhängen'>
            <Paperclip />
          </Button>
        }
        labels={{
          placeholder: 'Frag Wally...',
          input: 'Nachricht an Wally',
          send: 'Senden',
          stop: 'Antwort stoppen',
          disclaimer: 'Wally kann sich irren; bitte prüfen.',
          suggestions: 'Vorschläge',
          feedbackPositive: 'Gute Antwort',
          feedbackNegative: 'Schlechte Antwort',
        }}
      />
    </div>
  );
};

/** A full-page chat with a centered 768px column, built from `ChatViewProvider`, `deriveChatState`, `Chat`, `Conversation*`, `ChatMessageView`, docked `ChatPartView` and its own `ChatInput` — proof the open parts reuse every rule. */
export const CustomLayout: StoryFn<typeof meta> = () => {
  const wally = useMockWally({ initial: CONVERSATION });
  const [draft, setDraft] = useState('');
  const { messages, status } = wally.snapshot;
  const state = deriveChatState(messages, status, 'docked');
  const last = state.rows[state.rows.length - 1];

  const handleSubmit = (text: string) => {
    if (state.awaitingApproval) return;
    wally.send(text);
    setDraft('');
  };

  return (
    <ChatViewProvider
      status={status}
      approvalPlacement='docked'
      formatTimestamp={fixedTime}
      onApprovalRespond={wally.respond}
    >
      <div className='h-screen'>
        <Chat data-testid='wally' background={state.empty ? 'strong' : 'subtle'}>
          <ChatHeader>
            <ChatHeaderTitle label='Wally workspace' />
          </ChatHeader>
          <ConversationRoot autoScrollKey={state.lastUserMessageId}>
            <ConversationContent aria-busy={state.busy} contentClassName='mx-auto w-full max-w-768'>
              {state.rows.map((m, i) => (
                <ChatMessageView
                  key={m.id}
                  message={m}
                  index={i}
                  isLast={i === state.rows.length - 1}
                />
              ))}
            </ConversationContent>
            <ConversationScrollButton />
          </ConversationRoot>
          <ChatFooter className='mx-auto w-full max-w-768'>
            {last &&
              state.dockedApprovals.map(a => (
                <ChatPartView key={a.id} part={a} message={last} isLast placement='docked' />
              ))}
            <ChatInput
              value={draft}
              onValueChange={setDraft}
              onSubmit={handleSubmit}
              onStop={wally.stop}
              isRunning={state.running}
            >
              <ChatInputTextarea />
              <ChatInputSubmit disabled={state.awaitingApproval && !state.running} />
            </ChatInput>
          </ChatFooter>
        </Chat>
      </div>
    </ChatViewProvider>
  );
};
CustomLayout.parameters = { layout: 'fullscreen' };

/** Hosted in a 480px Drawer opened by `ChatTrigger`. Esc in the textarea while a reply streams stops it without closing the drawer — ChatInput handles that itself, no host recipe needed. */
export const InDrawer: StoryFn<typeof meta> = () => {
  const wally = useMockWally({ initial: CONVERSATION });

  return (
    <Drawer width={480}>
      <DrawerTrigger asChild>
        <ChatTrigger data-testid='chat-trigger' />
      </DrawerTrigger>
      <DrawerContent>
        {/* Names the dialog "Wally" (Ark points aria-labelledby at the title); hidden because
            the panel header already shows it. */}
        <div className='sr-only'>
          <DrawerTitle>Wally</DrawerTitle>
        </div>
        <WallyAssistant
          data-testid='wally'
          {...wally.snapshot}
          formatTimestamp={fixedTime}
          onSubmit={wally.send}
          onStop={wally.stop}
          onApprovalRespond={wally.respond}
          headerActions={
            <>
              <Button variant='ghost' color='neutral' size='small' aria-label='New chat'>
                <Plus />
              </Button>
              <Button variant='ghost' color='neutral' size='small' aria-label='Chat history'>
                <History />
              </Button>
              <Separator orientation='vertical' />
              <DrawerClose asChild>
                <Button variant='ghost' color='neutral' size='small' aria-label='Close chat'>
                  <X />
                </Button>
              </DrawerClose>
            </>
          }
        />
      </DrawerContent>
    </Drawer>
  );
};

/** Analytics attributes land on real nodes: the root `<section>`, header-action Buttons and a tagged Copy from `renderMessageActions` (like, dislike and timestamp stay default). Closed targets (pills, Send, approval options) report through their callbacks — see ANALYTICS_GAPS.md. */
export const Analytics: StoryFn<typeof meta> = () => {
  const wally = useMockWally({ initial: CONVERSATION });
  const [feedback, setFeedback] = useState<Record<string, ChatFeedback | null>>({});
  const [permissions, setPermissions] = useState(CONVERSATION.permissions);
  const messages = wally.snapshot.messages.map(m =>
    m.role === 'assistant' && m.id in feedback ? withFeedback(m, feedback[m.id] ?? null) : m,
  );

  const handleFeedback = (message: ChatAssistantMessage, value: ChatFeedback | null) => {
    setFeedback(f => ({ ...f, [message.id]: value }));
  };

  const handlePermissionChange = (permission: ChatToolPermission, allowed: boolean) => {
    setPermissions(list => list?.map(x => (x.id === permission.id ? { ...x, allowed } : x)));
  };

  return (
    <div className='h-640 w-480'>
      <WallyAssistant
        data-testid='wally'
        data-analytics-id='wally.panel'
        data-analytics-props='{"surface":"story"}'
        {...wally.snapshot}
        messages={messages}
        permissions={permissions}
        formatTimestamp={fixedTime}
        onSubmit={wally.send}
        onStop={wally.stop}
        onApprovalRespond={wally.respond}
        onFeedback={handleFeedback}
        onPermissionChange={handlePermissionChange}
        headerActions={
          <Button
            variant='ghost'
            color='neutral'
            size='small'
            aria-label='New chat'
            data-analytics-id='wally.new-chat'
          >
            <Plus />
          </Button>
        }
        renderMessageActions={renderAnalyticsActions}
      />
    </div>
  );
};
