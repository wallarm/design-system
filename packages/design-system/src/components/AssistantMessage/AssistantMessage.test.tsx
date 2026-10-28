import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { TestIdProvider } from '../../utils/testId';
import { ChainOfThought, ChainOfThoughtStep } from '../ChainOfThought';
import { MessageAction, MessageActions } from '../MessageActions';
import { AssistantMessage } from './AssistantMessage';
import { AssistantMessageContent } from './AssistantMessageContent';

describe('AssistantMessage', () => {
  it('renders an article named "Wally" with its data-slot', () => {
    render(<AssistantMessage data-testid='msg' />);
    const root = screen.getByTestId('msg');
    expect(root).toBe(screen.getByRole('article', { name: 'Wally' }));
    expect(root).toHaveAttribute('data-slot', 'assistant-message');
  });

  it('lets the consumer override aria-label and set aria-busy', () => {
    render(<AssistantMessage data-testid='msg' aria-label='Assistant' aria-busy />);
    const root = screen.getByTestId('msg');
    expect(root).toHaveAttribute('aria-label', 'Assistant');
    expect(root).toHaveAttribute('aria-busy', 'true');
  });

  it('renders its children and merges className', () => {
    render(
      <AssistantMessage data-testid='msg' className='custom'>
        <AssistantMessageContent className='prose'>
          <p>Hello</p>
        </AssistantMessageContent>
      </AssistantMessage>,
    );
    expect(screen.getByTestId('msg')).toHaveClass('custom', 'group/message');
    const content = screen.getByTestId('msg--content');
    expect(content).toHaveAttribute('data-slot', 'assistant-message-content');
    expect(content).toHaveClass('prose', 'text-sm');
    expect(content).toHaveTextContent('Hello');
  });

  it('spaces and aligns the composed parts', () => {
    render(<AssistantMessage data-testid='msg' />);
    expect(screen.getByTestId('msg')).toHaveClass(
      '[&>[data-slot=chain-of-thought]]:mb-8',
      '[&>[data-slot=approval-card]]:mb-8',
      '[&>[data-slot=approval-card]]:self-stretch',
      '[&>[data-slot=message-actions]]:-ms-4',
    );
  });

  it('keeps the composed ChainOfThought interactive', async () => {
    render(
      <AssistantMessage data-testid='msg'>
        <ChainOfThought>
          <ChainOfThoughtStep label='Thought for 5s'>Reasoning</ChainOfThoughtStep>
        </ChainOfThought>
      </AssistantMessage>,
    );
    const row = screen.getByTestId('msg--chain-of-thought--step');
    expect(row).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(row);
    expect(row).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('AssistantMessage — test-id cascade', () => {
  it('derives --assistant-message slots from a parent cascade', () => {
    render(
      <TestIdProvider value='chat'>
        <AssistantMessage>
          <AssistantMessageContent>Hi</AssistantMessageContent>
          <MessageActions>
            <MessageAction aria-label='Copy'>C</MessageAction>
          </MessageActions>
        </AssistantMessage>
      </TestIdProvider>,
    );
    expect(screen.getByTestId('chat--assistant-message').tagName).toBe('ARTICLE');
    expect(screen.getByTestId('chat--assistant-message--content')).toHaveTextContent('Hi');
    expect(screen.getByTestId('chat--assistant-message--actions--action').tagName).toBe('BUTTON');
  });

  it('lets a consumer data-testid win on the content', () => {
    render(
      <AssistantMessage data-testid='msg'>
        <AssistantMessageContent data-testid='answer'>Hi</AssistantMessageContent>
      </AssistantMessage>,
    );
    expect(screen.getByTestId('answer')).toHaveTextContent('Hi');
  });

  it('keeps the DOM clean without a data-testid', () => {
    const { container } = render(
      <AssistantMessage>
        <AssistantMessageContent>Hi</AssistantMessageContent>
      </AssistantMessage>,
    );
    expect(container.querySelector('[data-testid]')).toBeNull();
  });
});
