import type { FC } from 'react';

import { ThumbsDown, ThumbsUp } from '../../../icons';
import { formatRelativeTime } from '../../../utils/formatDateTime';
import { useTestId } from '../../../utils/testId';
import { AssistantMessage, AssistantMessageLoader } from '../../AssistantMessage';
import { Copyable, CopyableIcon } from '../../Copyable';
import { useDateFormat } from '../../DateFormatProvider';
import { MessageAction, MessageActions, MessageTimestamp } from '../../MessageActions';
import { useRenderEveryTime } from '../../Table/lib/useRenderEveryTime';
import { UserMessage } from '../../UserMessage';
import {
  copyTextOf,
  getDockedApprovals,
  hasPendingApproval,
  isRunningStatus,
} from '../model/deriveChatState';
import type { ChatAssistantMessage, ChatFeedback, ChatMessage, ChatPart } from '../model/model';
import { ChatPartView, isAbsentPart } from './ChatPartView';
import { useChatView } from './ChatViewContext';

export interface ChatMessageViewProps {
  message: ChatMessage;
  /** Position in the rendered rows: drives the test id (`user-message-{index}` / `assistant-message-{index}`). */
  index: number;
  /** The last row: loader, streaming, docked approvals, always-visible actions. */
  isLast: boolean;
}

const KNOWN_PARTS: ReadonlySet<string> = new Set<ChatPart['type']>([
  'text',
  'chain-of-thought',
  'approval',
  'error',
]);

const CopyAction: FC<{ message: ChatMessage; text: string }> = ({ message, text }) => {
  const { labels, handlers } = useChatView();
  return (
    <Copyable text={text} onCopied={() => handlers.current.onCopy?.(message, text)}>
      <MessageAction aria-label={labels.copy} data-testid={useTestId('copy')}>
        <CopyableIcon />
      </MessageAction>
    </Copyable>
  );
};

const FeedbackAction: FC<{ message: ChatAssistantMessage; value: ChatFeedback }> = ({
  message,
  value,
}) => {
  const { labels, handlers } = useChatView();
  const positive = value === 'positive';
  const pressed = message.feedback === value;
  return (
    <MessageAction
      aria-label={positive ? labels.feedbackPositive : labels.feedbackNegative}
      aria-pressed={pressed}
      data-testid={useTestId(positive ? 'like' : 'dislike')}
      onClick={() => handlers.current.onFeedback?.(message, pressed ? null : value)}
    >
      {positive ? <ThumbsUp /> : <ThumbsDown />}
    </MessageAction>
  );
};

const TimestampAction: FC<{ createdAt: string }> = ({ createdAt }) => {
  const { formatTimestamp } = useChatView();
  const dateFormat = useDateFormat();
  return (
    <MessageTimestamp dateTime={createdAt}>
      {formatTimestamp
        ? formatTimestamp(createdAt)
        : // oxlint-disable-next-line react/purity -- Relative timestamps intentionally refresh with the clock on parent updates, like FormatDateTime.
          formatRelativeTime(new Date(createdAt), new Date(), dateFormat)}
    </MessageTimestamp>
  );
};

const ActionsRow: FC<{ message: ChatMessage; visible: boolean }> = ({ message, visible }) => {
  const { labels, renderMessageActions, hasFeedback } = useChatView();
  const text = copyTextOf(message);
  const assistant = message.role === 'assistant' ? message : null;
  const copy = text ? <CopyAction message={message} text={text} /> : null;
  const like =
    assistant && hasFeedback ? <FeedbackAction message={assistant} value='positive' /> : null;
  const dislike =
    assistant && hasFeedback ? <FeedbackAction message={assistant} value='negative' /> : null;
  const timestamp = message.createdAt ? <TimestampAction createdAt={message.createdAt} /> : null;

  const custom = useRenderEveryTime(() =>
    renderMessageActions?.(message, { copy, like, dislike, timestamp }),
  );
  if (custom === null) return null;

  return (
    <MessageActions aria-label={labels.messageActions} visible={visible}>
      {custom !== undefined ? (
        custom
      ) : assistant ? (
        <>
          {copy}
          {like}
          {dislike}
          {timestamp}
        </>
      ) : (
        <>
          {timestamp}
          {copy}
        </>
      )}
    </MessageActions>
  );
};

/**
 * One message row: `UserMessage` or `AssistantMessage`, each part through `ChatPartView` as a
 * direct child (so the built part spacing applies), the loader while the reply has nothing to
 * show yet, and the actions row once the turn is over.
 */
export const ChatMessageView: FC<ChatMessageViewProps> = ({ message, index, isLast }) => {
  const { status, labels, approvalPlacement, renderPart } = useChatView();
  const testId = useTestId(`${message.role}-message-${index}`);

  const docked: readonly ChatPart[] =
    isLast && approvalPlacement === 'docked' ? getDockedApprovals(message) : [];
  const parts = message.parts.filter((p: ChatPart) => !isAbsentPart(p) && !docked.includes(p));
  // With renderPart set every part counts as rendering: its output isn't known yet (see its JSDoc).
  const renders = (p: ChatPart) => renderPart != null || KNOWN_PARTS.has(p.type);
  const rendersAny = parts.some(renders);
  const showActions =
    parts.some(p => p.type !== 'approval' && renders(p)) &&
    !(isLast && (isRunningStatus(status) || hasPendingApproval(message)));
  const items = parts.map(p => (
    <ChatPartView key={p.id} part={p} message={message} isLast={isLast} />
  ));

  if (message.role === 'user') {
    if (!rendersAny) return null;
    return (
      <UserMessage aria-label={labels.you} data-testid={testId}>
        {items}
        {showActions && <ActionsRow message={message} visible={false} />}
      </UserMessage>
    );
  }
  if (message.role !== 'assistant') return null;

  const busy = isLast && isRunningStatus(status) && !hasPendingApproval(message);
  const loading = busy && !rendersAny;
  if (!rendersAny && !loading) return null;

  return (
    <AssistantMessage
      aria-label={labels.assistant}
      aria-busy={busy || undefined}
      data-testid={testId}
    >
      {loading && <AssistantMessageLoader>{labels.working}</AssistantMessageLoader>}
      {items}
      {showActions && <ActionsRow message={message} visible={isLast} />}
    </AssistantMessage>
  );
};

ChatMessageView.displayName = 'ChatMessageView';
