import { type FC, type ReactNode, useLayoutEffect, useRef } from 'react';

import { AssistantMessageMarkdown } from '../../AssistantMessage';
import { DEFAULT_CHAT_LABELS } from '../model/labels';
import {
  type ChatViewConfig,
  ChatViewContext,
  type ChatViewContextValue,
  type ChatViewHandlers,
} from './ChatViewContext';

export interface ChatViewProviderProps extends ChatViewConfig {
  children: ReactNode;
}

/**
 * Hands the data-view config (labels, icons, markdown, render seams, callbacks) to every
 * `ChatMessageView`, `ChatPartView`, `ChainOfThoughtView` and `ApprovalCardView` below it.
 * Renders no DOM. Handler callbacks are read through a latest-value ref, so inline handlers
 * never re-render the log; keep `labels`, `icons`, `markdown`, `formatTimestamp` and the render
 * callbacks stable (module scope or memoized) in long threads. Per snapshot, a message's views
 * (and `renderPart` for its parts) re-render unless the message keeps its identity, so keep
 * unchanged messages by reference (structural sharing) when you use `renderPart`; markdown bodies
 * are memoized on `text` and are spared either way. Give `deriveChatState` the same
 * `approvalPlacement` as this provider: one hides the docked approvals in the message, the other
 * lists them for your footer.
 */
export const ChatViewProvider: FC<ChatViewProviderProps> = ({
  children,
  status = 'ready',
  labels,
  icons,
  markdown = AssistantMessageMarkdown,
  formatTimestamp,
  approvalPlacement = 'inline',
  renderPart,
  renderStepContent,
  renderMessageActions,
  onApprovalRespond,
  onFeedback,
  onCopy,
  onRetry,
}) => {
  const handlers = useRef<ChatViewHandlers>({});
  useLayoutEffect(() => {
    handlers.current = { onApprovalRespond, onFeedback, onCopy, onRetry };
  });

  const value: ChatViewContextValue = {
    status,
    labels: { ...DEFAULT_CHAT_LABELS, ...labels },
    icons,
    markdown,
    formatTimestamp,
    approvalPlacement,
    renderPart,
    renderStepContent,
    renderMessageActions,
    handlers,
    hasApprovalRespond: onApprovalRespond != null,
    hasFeedback: onFeedback != null,
    hasCopy: onCopy != null,
    hasRetry: onRetry != null,
  };

  return <ChatViewContext value={value}>{children}</ChatViewContext>;
};

ChatViewProvider.displayName = 'ChatViewProvider';
