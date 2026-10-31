import { type FC, type ReactNode, type Ref, useEffect, useRef, useState } from 'react';
import { Quote } from '../../icons';
import { TestIdProvider, useTestId } from '../../utils/testId';
import { Badge } from '../Badge';
import {
  Chat,
  ChatFooter,
  ChatHeader,
  ChatHeaderActions,
  ChatHeaderTitle,
  type ChatProps,
  ChatSuggestion,
  ChatSuggestions,
} from '../Chat';
import { ChatInput, ChatInputSubmit, ChatInputTextarea } from '../ChatInput';
import {
  ChatPermissions,
  ChatPermissionsContent,
  ChatPermissionsItem,
  ChatPermissionsTrigger,
} from '../ChatPermissions';
import {
  loadPrismAdapter,
  type PrismLanguage,
  plainAdapter,
  type SyntaxAdapter,
  useAdapter,
} from '../CodeSnippet';
import { AdapterContext, type AdapterContextValue } from '../CodeSnippet/CodeSnippetContext';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '../Conversation';
import { Separator } from '../Separator';
import { TagClose } from '../Tag';
import { deriveChatState } from './model/deriveChatState';
import { type ChatLabels, DEFAULT_CHAT_LABELS } from './model/labels';
import type {
  ChatContextItem,
  ChatMessage,
  ChatStatus,
  ChatSuggestionItem,
  ChatToolPermission,
} from './model/model';
import { ChatMessageView } from './views/ChatMessageView';
import { ChatPartView } from './views/ChatPartView';
import type { ChatViewConfig } from './views/ChatViewContext';
import { ChatViewProvider } from './views/ChatViewProvider';
import { resolveIcon } from './views/stepIcons';

/** DOM attribute names WallyAssistant keeps for its own props (now or later); they never reach the root. */
export type WallyAssistantReservedProps =
  | 'children'
  | 'onSubmit'
  | 'onCopy'
  | 'title'
  | 'defaultValue'
  | 'onError';

/** WallyAssistant's own props (everything that isn't a `Chat` root attribute). */
export interface WallyAssistantOwnProps extends Omit<ChatViewConfig, 'status'> {
  // ── data (a ChatSnapshot spreads straight in)
  messages: readonly ChatMessage[];
  /** Default 'ready'. */
  status?: ChatStatus;
  suggestions?: readonly ChatSuggestionItem[];
  permissions?: readonly ChatToolPermission[];
  context?: readonly ChatContextItem[];

  // ── draft: controlled when `value` is set; otherwise internal and cleared after a send
  value?: string;
  onValueChange?: (value: string) => void;
  /** Disables the textarea, Send and the suggestion pills (e.g. `!agent.isReady`). */
  disabled?: boolean;
  /** Focus management, e.g. focus the input after a thread switch. */
  textareaRef?: Ref<HTMLTextAreaElement>;

  // ── composer callbacks: a missing callback hides or disables its control
  /** Trimmed text. Not called when empty, while running, while an approval is pending, or when disabled. */
  onSubmit: (text: string) => void;
  /** Stop button, and Esc in the textarea while running (also inside a Drawer/Dialog: ChatInput
   *  claims that Esc from the layer, so no host recipe is needed). */
  onStop?: () => void;
  /** Default: onSubmit(suggestion.prompt ?? suggestion.label). */
  onSuggestionSelect?: (suggestion: ChatSuggestionItem) => void;
  /** Absent, or no permissions → no permissions button in the input. */
  onPermissionChange?: (permission: ChatToolPermission, allowed: boolean) => void;
  /** Absent → context chips aren't removable. */
  onContextRemove?: (item: ChatContextItem) => void;

  // ── slots: undefined = default, null = none, a node replaces it
  header?: ReactNode;
  /** ChatHeaderTitle children, e.g. a thread Select (Figma Variant2). */
  headerTitle?: ReactNode;
  /** New chat, history, close: your Buttons, so analytics land on them. */
  headerActions?: ReactNode;
  /** Replaces the greeting and its pills (e.g. a history-loading state). */
  emptyState?: ReactNode;
  /** Top of ChatFooter, above the suggestions (banners). */
  footerStart?: ReactNode;
  /** Extra toolbar items in the input, between permissions and Send. */
  inputTools?: ReactNode;
  /** Replaces the whole ChatInput composition (you wire value and submit yourself). */
  input?: ReactNode;
}

export interface WallyAssistantProps
  extends Omit<ChatProps, WallyAssistantReservedProps>, WallyAssistantOwnProps {}

const Pill: FC<{
  index: number;
  item: ChatSuggestionItem;
  disabled?: boolean;
  onSelect: () => void;
}> = ({ index, item, disabled, onSelect }) => (
  <ChatSuggestion
    data-testid={useTestId(`suggestion-${index}`)}
    disabled={disabled}
    onClick={onSelect}
  >
    {item.label}
  </ChatSuggestion>
);

const ContextChip: FC<{
  index: number;
  item: ChatContextItem;
  icons: ChatViewConfig['icons'];
  label: string;
  onRemove?: (item: ChatContextItem) => void;
}> = ({ index, item, icons, label, onRemove }) => {
  const chipId = useTestId(`context-${index}`);
  return (
    <Badge type='secondary' color='blue' data-testid={chipId}>
      {resolveIcon(item.icon, icons, <Quote />)}
      {item.label}
      {item.removable !== false && onRemove && (
        <TestIdProvider value={chipId}>
          <TagClose
            aria-label={label}
            className='rounded-4 focus-visible:ring-3 focus-visible:ring-focus-primary'
            onClick={() => onRemove(item)}
          />
        </TestIdProvider>
      )}
    </Badge>
  );
};

const PermissionItem: FC<{
  index: number;
  item: ChatToolPermission;
  onChange: (permission: ChatToolPermission, allowed: boolean) => void;
}> = ({ index, item, onChange }) => (
  <ChatPermissionsItem
    data-testid={useTestId(`item-${index}`)}
    name={item.id}
    title={item.title}
    description={item.description}
    checked={item.allowed}
    onCheckedChange={({ checked }) => onChange(item, checked)}
  />
);

const PermissionsMenu: FC<{
  items: readonly ChatToolPermission[];
  labels: ChatLabels;
  onChange: (permission: ChatToolPermission, allowed: boolean) => void;
}> = ({ items, labels, onChange }) => {
  const row = (p: ChatToolPermission) => (
    <PermissionItem key={p.id} index={items.indexOf(p)} item={p} onChange={onChange} />
  );
  const allowed = items.filter(p => p.allowed);
  const others = items.filter(p => !p.allowed);
  return (
    <ChatPermissions>
      <ChatPermissionsTrigger aria-label={labels.permissions} />
      <ChatPermissionsContent label={labels.permissionsHeading}>
        {allowed.map(row)}
        {allowed.length > 0 && others.length > 0 && <Separator spacing={4} />}
        {others.map(row)}
      </ChatPermissionsContent>
    </ChatPermissions>
  );
};

let prism: SyntaxAdapter<PrismLanguage> | undefined;
/** Prism behind a stable adapter: the lazy chunk loads on the first highlight of a closed fence (an open
 *  fence renders as 'text', which stays on the plain adapter). Unknown languages come back plain. */
const LAZY_PRISM: AdapterContextValue = {
  adapter: {
    name: 'prism',
    highlight: async (code, language) => {
      if (language === 'text') return plainAdapter.highlight(code, language);
      prism ??= await loadPrismAdapter();
      return prism.highlight(code, language as PrismLanguage);
    },
    getSupportedLanguages: () => prism?.getSupportedLanguages() ?? [],
  },
};

/**
 * The closed Wally panel (Figma 2:42): data and callbacks in, the whole chat out. Built only from
 * exported pieces — `ChatViewProvider`, `deriveChatState`, `Chat*`, `Conversation*`,
 * `ChatMessageView`, `ChatPartView`, `ChatInput*` — so a custom layout can reuse every rule.
 * Send stays blocked while the last message has a pending approval; a resolved card stays docked
 * until the next message. Code blocks highlight with a lazy Prism adapter unless an outer
 * `CodeSnippetAdapterProvider` supplies one (that one wins).
 */
export const WallyAssistant: FC<WallyAssistantProps> = ({
  messages,
  status = 'ready',
  suggestions,
  permissions,
  context,
  value,
  onValueChange,
  disabled,
  textareaRef,
  onSubmit,
  onStop,
  onSuggestionSelect,
  onPermissionChange,
  onContextRemove,
  header,
  headerTitle,
  headerActions,
  emptyState,
  footerStart,
  inputTools,
  input,
  labels: labelsProp,
  icons,
  markdown,
  formatTimestamp,
  approvalPlacement = 'docked',
  renderPart,
  renderStepContent,
  renderMessageActions,
  onApprovalRespond,
  onFeedback,
  onCopy,
  onRetry,
  background,
  ...rest
}) => {
  const [innerDraft, setInnerDraft] = useState('');
  const labels: ChatLabels = { ...DEFAULT_CHAT_LABELS, ...labelsProp };
  const state = deriveChatState(messages, status, approvalPlacement);
  const lastRow = state.rows[state.rows.length - 1];
  const draft = value ?? innerDraft;
  const footerRef = useRef<HTMLDivElement>(null);
  // ponytail: an outer lazy provider reads as null until its adapter resolves, so Prism covers that window
  // (and may load once); it is the same provider node either way, so nothing remounts.
  const outerAdapter = useAdapter();
  // Focus is inside a docked approval card. React ignores the blur a removed node fires, so this
  // stays true when the focused card leaves the dock (another approval of the turn is still
  // pending) and remounts inline — a new instance that can't run ApprovalCard's own handoff.
  // Checked after every commit; a no-op unless focus fell to <body> from the dock.
  const dockFocus = useRef(false);

  useEffect(() => {
    if (!dockFocus.current) return;
    const active = document.activeElement;
    if (active && active !== document.body) return;
    dockFocus.current = false;
    footerRef.current
      ?.querySelector<HTMLElement>('[data-slot="approval-card"] button:not(:disabled)')
      ?.focus({ preventScroll: true });
  });

  const setDraft = (next: string) => {
    if (value === undefined) setInnerDraft(next);
    onValueChange?.(next);
  };

  const submit = (text: string) => {
    const trimmed = text.trim();
    // Enter still requests a submit while an approval is pending: guard here too.
    if (!trimmed || disabled || state.running || state.awaitingApproval) return;
    onSubmit(trimmed);
    if (value === undefined) setInnerDraft('');
  };

  const pills = (placement: 'greeting' | 'footer') =>
    suggestions?.length ? (
      <ChatSuggestions placement={placement} label={labels.suggestions}>
        {suggestions.map((s, i) => (
          <Pill
            key={s.id}
            index={i}
            item={s}
            disabled={disabled}
            onSelect={() =>
              onSuggestionSelect ? onSuggestionSelect(s) : submit(s.prompt ?? s.label)
            }
          />
        ))}
      </ChatSuggestions>
    ) : null;

  return (
    <ChatViewProvider
      status={status}
      labels={labelsProp}
      icons={icons}
      markdown={markdown}
      formatTimestamp={formatTimestamp}
      approvalPlacement={approvalPlacement}
      renderPart={renderPart}
      renderStepContent={renderStepContent}
      renderMessageActions={renderMessageActions}
      onApprovalRespond={onApprovalRespond}
      onFeedback={onFeedback}
      onCopy={onCopy}
      onRetry={onRetry}
    >
      <AdapterContext value={outerAdapter ?? LAZY_PRISM}>
        <Chat
          aria-label={labels.region}
          {...rest}
          background={background ?? (state.empty ? 'strong' : 'subtle')}
        >
          {header !== undefined ? (
            header
          ) : (
            <ChatHeader>
              <ChatHeaderTitle label={labels.title}>{headerTitle}</ChatHeaderTitle>
              {headerActions != null && <ChatHeaderActions>{headerActions}</ChatHeaderActions>}
            </ChatHeader>
          )}
          <Conversation autoScrollKey={state.lastUserMessageId}>
            <ConversationContent aria-label={labels.log} aria-busy={state.busy}>
              {state.empty ? (
                emptyState !== undefined ? (
                  emptyState
                ) : (
                  <ConversationEmptyState title={labels.greeting}>
                    {pills('greeting')}
                  </ConversationEmptyState>
                )
              ) : (
                state.rows.map((m, i) => (
                  <ChatMessageView
                    key={m.id}
                    message={m}
                    index={i}
                    isLast={i === state.rows.length - 1}
                  />
                ))
              )}
            </ConversationContent>
            <ConversationScrollButton label={labels.scrollToBottom} />
          </Conversation>
          <ChatFooter
            ref={footerRef}
            onFocus={e => {
              dockFocus.current =
                e.target instanceof Element && !!e.target.closest('[data-slot="approval-card"]');
            }}
            onBlur={e => {
              if (!e.currentTarget.contains(e.relatedTarget)) dockFocus.current = false;
            }}
          >
            {footerStart}
            {!state.empty && !state.running && !state.awaitingApproval && pills('footer')}
            {lastRow &&
              state.dockedApprovals.map(a => (
                <ChatPartView key={a.id} part={a} message={lastRow} isLast placement='docked' />
              ))}
            {input !== undefined ? (
              input
            ) : (
              <ChatInput
                value={draft}
                onValueChange={setDraft}
                onSubmit={submit}
                onStop={onStop}
                isRunning={state.running}
                disabled={disabled}
                disclaimer={labels.disclaimer}
                context={
                  context?.length
                    ? context.map((item, i) => (
                        <ContextChip
                          key={item.id}
                          index={i}
                          item={item}
                          icons={icons}
                          label={labels.removeContext(item.label)}
                          onRemove={onContextRemove}
                        />
                      ))
                    : undefined
                }
              >
                <ChatInputTextarea
                  ref={textareaRef}
                  placeholder={labels.placeholder}
                  aria-label={labels.input}
                />
                {permissions?.length && onPermissionChange ? (
                  <PermissionsMenu
                    items={permissions}
                    labels={labels}
                    onChange={onPermissionChange}
                  />
                ) : null}
                {inputTools}
                <ChatInputSubmit
                  sendLabel={labels.send}
                  stopLabel={labels.stop}
                  // Stop stays usable while the reply streams.
                  disabled={state.awaitingApproval && !state.running}
                />
              </ChatInput>
            )}
          </ChatFooter>
        </Chat>
      </AdapterContext>
    </ChatViewProvider>
  );
};

WallyAssistant.displayName = 'WallyAssistant';
