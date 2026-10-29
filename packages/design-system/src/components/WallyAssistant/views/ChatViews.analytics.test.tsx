import type { ReactNode } from 'react';

import { describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { ThumbsUp } from '../../../icons';
import { captureAnalyticsClicks } from '../../../testUtils/captureAnalyticsClicks';
import { TestIdProvider } from '../../../utils/testId';
import { ApprovalCardActions } from '../../ApprovalCard';
import { Button } from '../../Button';
import { MessageAction } from '../../MessageActions';
import type { ChatApprovalPart, ChatAssistantMessage, ChatErrorPart } from '../model/model';
import { ApprovalCardView } from './ApprovalCardView';
import { ChainOfThoughtView } from './ChainOfThoughtView';
import { ChatMessageView } from './ChatMessageView';
import type { ChatViewConfig } from './ChatViewContext';
import { ChatViewProvider } from './ChatViewProvider';

rs.mock('../../../utils/copyText', () => ({ copyText: rs.fn(() => Promise.resolve()) }));

const PROPS = '{"tool":"denylist","ip":"203.0.113.42"}';
const approval: ChatApprovalPart = {
  type: 'approval',
  id: 'a',
  status: 'pending',
  content: 'Run x',
};
const answer: ChatAssistantMessage = {
  role: 'assistant',
  id: 'r',
  parts: [{ type: 'text', id: 't', text: 'Answer' }],
};

const view = (ui: ReactNode, config: ChatViewConfig = {}) =>
  render(
    <ChatViewProvider {...config}>
      <TestIdProvider value='w'>{ui}</TestIdProvider>
    </ChatViewProvider>,
  );

describe('Chat data views — analytics (docs/metrics/contract.md)', () => {
  it('view roots forward data-analytics-* verbatim to the real root', () => {
    view(
      <>
        <ApprovalCardView
          approval={approval}
          data-analytics-id='CARD'
          data-analytics-props={PROPS}
        />
        <ChainOfThoughtView
          part={{
            type: 'chain-of-thought',
            id: 'c',
            steps: [{ id: 's', status: 'done', label: 's' }],
          }}
          message={answer}
          data-analytics-id='COT'
        />
      </>,
    );
    const card = screen.getByTestId('w--approval-card');
    expect(card).toHaveAttribute('data-analytics-id', 'CARD');
    expect(card.getAttribute('data-analytics-props')).toBe(PROPS);
    expect(screen.getByTestId('w--chain-of-thought').tagName).toBe('OL');
    expect(screen.getByTestId('w--chain-of-thought')).toHaveAttribute('data-analytics-id', 'COT');
  });

  it('a Button in ApprovalCardView children keeps its attributes and owns the click', async () => {
    const spy = captureAnalyticsClicks();
    view(
      <ApprovalCardView approval={approval} data-analytics-id='CARD'>
        <ApprovalCardActions>
          <Button data-testid='allow' data-analytics-id='ALLOW' data-analytics-props={PROPS}>
            Allow
          </Button>
        </ApprovalCardActions>
      </ApprovalCardView>,
    );
    expect(screen.getByTestId('allow').getAttribute('data-analytics-props')).toBe(PROPS);
    await userEvent.click(screen.getByTestId('allow'));
    expect(spy).toHaveBeenCalledWith('ALLOW');
    expect(spy).not.toHaveBeenCalledWith('CARD');
  });

  it('a MessageAction returned from renderMessageActions keeps its attributes', async () => {
    const spy = captureAnalyticsClicks();
    view(<ChatMessageView message={answer} index={1} isLast />, {
      renderMessageActions: () => (
        <MessageAction aria-label='Like' data-testid='like' data-analytics-id='wally.like'>
          <ThumbsUp />
        </MessageAction>
      ),
    });
    await userEvent.click(screen.getByTestId('like'));
    expect(spy).toHaveBeenCalledWith('wally.like');
  });

  it('closed target → callback: approval options call onApprovalRespond(response, approval)', async () => {
    const onApprovalRespond = rs.fn();
    view(<ApprovalCardView approval={approval} />, { onApprovalRespond });
    await userEvent.click(screen.getByTestId('w--approval-card--option-allow-always'));
    expect(onApprovalRespond).toHaveBeenCalledWith(
      { approvalId: 'a', optionId: 'allow-always', kind: 'allow-always', approved: true },
      approval,
    );
  });

  it('closed target → callback: Copy calls onCopy(message, text)', async () => {
    const onCopy = rs.fn();
    view(<ChatMessageView message={answer} index={1} isLast />, { onCopy });
    await userEvent.click(screen.getByTestId('w--assistant-message-1--actions--copy'));
    expect(onCopy).toHaveBeenCalledWith(answer, 'Answer');
  });

  it('closed target → callback: thumbs call onFeedback(message, value)', async () => {
    const onFeedback = rs.fn();
    view(<ChatMessageView message={answer} index={1} isLast />, { onFeedback });
    await userEvent.click(screen.getByTestId('w--assistant-message-1--actions--dislike'));
    expect(onFeedback).toHaveBeenCalledWith(answer, 'negative');
  });

  it('closed target → callback: Retry calls onRetry(message, part)', async () => {
    const onRetry = rs.fn();
    const error: ChatErrorPart = { type: 'error', id: 'e', text: 'Failed', retryable: true };
    const message: ChatAssistantMessage = { role: 'assistant', id: 'r', parts: [error] };
    view(<ChatMessageView message={message} index={1} isLast />, { onRetry });
    await userEvent.click(screen.getByTestId('w--assistant-message-1--error--retry'));
    expect(onRetry).toHaveBeenCalledWith(message, error);
  });
});
