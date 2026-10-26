import {
  type ComponentType,
  createContext,
  createElement,
  type FC,
  type ReactNode,
  type RefObject,
  useContext,
} from 'react';
import {
  AssistantMessageMarkdown,
  type AssistantMessageMarkdownVariant,
} from '../../AssistantMessage';
import { type ChatLabels, DEFAULT_CHAT_LABELS } from '../model/labels';
import type {
  ChatApprovalPart,
  ChatApprovalResponse,
  ChatAssistantMessage,
  ChatErrorPart,
  ChatFeedback,
  ChatId,
  ChatMessage,
  ChatPart,
  ChatStatus,
  ChatStep,
} from '../model/model';

export interface ChatMarkdownProps {
  text: string;
  /** The text is still growing (the streaming answer's tail, or the body of a live step): use a streaming-safe parser. */
  streaming: boolean;
  /** 'chain-of-thought': Figma 494:4292 wants InlineCodeSnippet copyable={false} size='sm' text-secondary there. */
  variant: AssistantMessageMarkdownVariant;
  /** Absent for an ApprovalCardView rendered without a message (e.g. a CopilotKit HITL card). */
  messageId?: ChatId;
  /** The part's id — the step's id for chain-of-thought bodies — e.g. to resolve [1] citations from your store. */
  partId: ChatId;
}

export interface ChatPartRenderContext {
  message: ChatMessage;
  /** `message` is the last row. */
  isLast: boolean;
  /** This part is the growing tail of the streaming answer. */
  streaming: boolean;
  placement: 'inline' | 'docked';
  /** The DS rendering of this part (null for custom and unknown types). Wrap it, or return it as is. */
  defaultRender: () => ReactNode;
}

export interface ChatStepRenderContext {
  message: ChatMessage;
  /** The default body: `content` as markdown, then the nested steps (null when both are absent). */
  defaultRender: () => ReactNode;
}

/** Prebuilt nodes for the actions row; null when not applicable (no text, no onFeedback, no createdAt). */
export interface ChatMessageActionNodes {
  copy: ReactNode;
  like: ReactNode;
  dislike: ReactNode;
  timestamp: ReactNode;
}

/** Everything the data views read. WallyAssistant takes the same props; custom layouts pass them to ChatViewProvider. */
export interface ChatViewConfig {
  /** Default 'ready'. */
  status?: ChatStatus;
  labels?: Partial<ChatLabels>;
  /** Icon key → element from src/icons; wins over the built-in Figma 483:1899 table. */
  icons?: Readonly<Record<string, ReactNode>>;
  /** The markdown renderer, at module scope (never inline). Default: the DS `AssistantMessageMarkdown` (GFM,
   *  streaming-safe, no raw HTML, http/https/mailto/relative links only, no images). A replacement owns its own
   *  sanitizing. To change one element, wrap it at module scope:
   *  `const WallyMarkdown: FC<ChatMarkdownProps> = p => <AssistantMessageMarkdown {...p} components={MAP} />`. */
  markdown?: ComponentType<ChatMarkdownProps>;
  /** ISO → label. Default: DS formatRelativeTime (honours DateFormatProvider). Give it a new identity on your
   *  clock tick to refresh "2 min ago" — the DS runs no clock. */
  formatTimestamp?: (createdAt: string) => string;
  /** 'docked': the last message's approvals render in the footer. Default 'inline' here;
   *  WallyAssistant defaults to 'docked' (Figma). A custom layout passes the same value to
   *  `deriveChatState`, or the approval renders twice (provider 'inline') or never (provider 'docked'). */
  approvalPlacement?: 'docked' | 'inline';
  /** Called for every part, custom and unknown types included. undefined = the default; null = nothing.
   *  A render function: no hooks inside — put them in the components you return.
   *  While it is set, every part counts as rendered for the loader and the actions row (its output
   *  is unknown up front), so a running reply made only of parts it maps to nothing shows no loader. */
  renderPart?: (part: ChatPart, ctx: ChatPartRenderContext) => ReactNode | undefined;
  /** A step's collapsible body: rich tool output, or a card for one tool via `step.name`.
   *  undefined = the default; null = no body (the row isn't collapsible). No hooks inside. */
  renderStepContent?: (step: ChatStep, ctx: ChatStepRenderContext) => ReactNode | undefined;
  /** The actions row's children (Figma Wally order: Copy, ThumbsUp, ThumbsDown, Ellipsis, Timestamp).
   *  undefined = the default order; null = no row. No hooks inside. */
  renderMessageActions?: (
    message: ChatMessage,
    actions: ChatMessageActionNodes,
  ) => ReactNode | undefined;
  /** Absent → approval buttons are disabled. */
  onApprovalRespond?: (response: ChatApprovalResponse, approval: ChatApprovalPart) => void;
  /** Absent → no thumbs. Clicking the pressed thumb sends null. */
  onFeedback?: (message: ChatAssistantMessage, value: ChatFeedback | null) => void;
  /** Fired after Copy copied; Copy itself shows whenever the message has text. */
  onCopy?: (message: ChatMessage, text: string) => void;
  /** Absent → no Retry on error parts. */
  onRetry?: (message: ChatAssistantMessage, part: ChatErrorPart) => void;
}

export type ChatViewHandlers = Pick<
  ChatViewConfig,
  'onApprovalRespond' | 'onFeedback' | 'onCopy' | 'onRetry'
>;

/** Internal: render-time config plus a latest-value ref for the handlers (read only in event handlers). */
export interface ChatViewContextValue extends Pick<
  ChatViewConfig,
  'icons' | 'formatTimestamp' | 'renderPart' | 'renderStepContent' | 'renderMessageActions'
> {
  status: ChatStatus;
  labels: ChatLabels;
  markdown: ComponentType<ChatMarkdownProps>;
  approvalPlacement: 'docked' | 'inline';
  handlers: RefObject<ChatViewHandlers>;
  hasApprovalRespond: boolean;
  hasFeedback: boolean;
  hasCopy: boolean;
  hasRetry: boolean;
}

const NO_HANDLERS: RefObject<ChatViewHandlers> = { current: {} };

const DEFAULT_VALUE: ChatViewContextValue = {
  status: 'ready',
  labels: DEFAULT_CHAT_LABELS,
  markdown: AssistantMessageMarkdown,
  approvalPlacement: 'inline',
  handlers: NO_HANDLERS,
  hasApprovalRespond: false,
  hasFeedback: false,
  hasCopy: false,
  hasRetry: false,
};

export const ChatViewContext = createContext<ChatViewContextValue | null>(null);

/** The provider's config, or the defaults outside one (never throws). */
export const useChatView = (): ChatViewContextValue => useContext(ChatViewContext) ?? DEFAULT_VALUE;

/**
 * The configured markdown with primitive props only: its compiled body memoizes the element on
 * `text`, so an unchanged body is never re-rendered (re-parsed), even when the mapper rebuilds every
 * message and part object on each snapshot (§7.7).
 */
export const MarkdownView: FC<ChatMarkdownProps> = ({
  text,
  streaming,
  variant,
  messageId,
  partId,
}) => {
  const { markdown } = useChatView();
  return createElement(markdown, { text, streaming, variant, messageId, partId });
};
