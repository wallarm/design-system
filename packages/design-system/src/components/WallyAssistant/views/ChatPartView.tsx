import type { FC, ReactNode } from 'react';

import { RefreshCcw } from '../../../icons';
import { useTestId } from '../../../utils/testId';
import { AssistantMessageContent, AssistantMessageError } from '../../AssistantMessage';
import { Button } from '../../Button';
import { useRenderEveryTime } from '../../Table/lib/useRenderEveryTime';
import { UserMessageBubble, UserMessageShowMore } from '../../UserMessage';
import { isLiveStep, isRunningStatus } from '../model/deriveChatState';
import type { ChatErrorPart, ChatMessage, ChatPart } from '../model/model';
import { ApprovalCardView } from './ApprovalCardView';
import { ChainOfThoughtView } from './ChainOfThoughtView';
import { MarkdownView, useChatView } from './ChatViewContext';

export interface ChatPartViewProps {
  part: ChatPart;
  message: ChatMessage;
  isLast: boolean;
  /** 'docked' when you render a docked approval in your own footer. Default 'inline'. */
  placement?: 'inline' | 'docked';
}

/** Reads the error's cascade, so its id is `<error>--retry`. */
const RetryButton: FC<{ message: ChatMessage; part: ChatErrorPart }> = ({ message, part }) => {
  const { labels, handlers } = useChatView();
  return (
    <Button
      variant='ghost'
      color='neutral'
      size='small'
      data-testid={useTestId('retry')}
      onClick={() => {
        if (message.role === 'assistant') handlers.current.onRetry?.(message, part);
      }}
    >
      <RefreshCcw />
      {labels.retry}
    </Button>
  );
};

/** An empty text or an empty chain counts as absent (model header): it renders nothing. */
export const isAbsentPart = (p: ChatPart): boolean =>
  (p.type === 'text' && !p.text) || (p.type === 'chain-of-thought' && !p.steps.length);

/** `working`: active, only approval or absent parts follow the block, and no step in it is live (§7.3). */
const isWorking = (message: ChatMessage, part: ChatPart): boolean => {
  if (part.type !== 'chain-of-thought' || part.steps.some(isLiveStep)) return false;
  const after = message.parts.slice((message.parts as readonly ChatPart[]).indexOf(part) + 1);
  return after.every(p => p.type === 'approval' || isAbsentPart(p));
};

/**
 * One part with its default L1 rendering. `renderPart` runs first for every part (custom and
 * unknown types included): `undefined` → the default, `null` → nothing, a node replaces it.
 */
export const ChatPartView: FC<ChatPartViewProps> = ({
  part,
  message,
  isLast,
  placement = 'inline',
}) => {
  const { status, labels, renderPart, hasRetry } = useChatView();
  const running = isRunningStatus(status);
  const active = running && isLast;
  const streaming = active && message.parts[message.parts.length - 1]?.id === part.id;

  let defaultNode: ReactNode = null;
  switch (part.type) {
    case 'text':
      defaultNode =
        message.role === 'user' ? (
          <UserMessageBubble
            showMore={
              <UserMessageShowMore
                showMoreLabel={labels.showMore}
                showLessLabel={labels.showLess}
              />
            }
          >
            {part.text}
          </UserMessageBubble>
        ) : (
          <AssistantMessageContent>
            <MarkdownView
              text={part.text}
              streaming={streaming}
              variant='answer'
              messageId={message.id}
              partId={part.id}
            />
          </AssistantMessageContent>
        );
      break;
    case 'chain-of-thought':
      defaultNode = (
        <ChainOfThoughtView
          part={part}
          message={message}
          active={active}
          working={active && isWorking(message, part)}
        />
      );
      break;
    case 'approval':
      defaultNode = <ApprovalCardView approval={part} message={message} disabled={!isLast} />;
      break;
    case 'error':
      defaultNode = (
        <AssistantMessageError
          action={part.retryable && hasRetry ? <RetryButton message={message} part={part} /> : null}
        >
          {part.text}
        </AssistantMessageError>
      );
      break;
    default:
      break;
  }

  const custom = useRenderEveryTime(() =>
    renderPart?.(part, {
      message,
      isLast,
      streaming,
      placement,
      defaultRender: () => defaultNode,
    }),
  );
  return custom === undefined ? defaultNode : custom;
};

ChatPartView.displayName = 'ChatPartView';
