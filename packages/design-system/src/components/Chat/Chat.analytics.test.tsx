import { describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Drawer, DrawerTrigger } from '../Drawer';
import { Chat } from './Chat';
import { ChatSuggestion } from './ChatSuggestion';
import { ChatSuggestions } from './ChatSuggestions';
import { ChatTrigger } from './ChatTrigger';

describe('Chat — analytics & test ids (docs/metrics/contract.md)', () => {
  const PROPS = '{"surface":"wally","index":2}';

  it('lands data-analytics-* on the ChatSuggestion <button>, verbatim, and captures clicks', async () => {
    const spy = captureAnalyticsClicks();
    render(
      <Chat data-testid='chat'>
        <ChatSuggestions>
          <ChatSuggestion data-analytics-id='AI_CHAT_SUGGESTION' data-analytics-props={PROPS}>
            Explain this rule
          </ChatSuggestion>
        </ChatSuggestions>
      </Chat>,
    );
    const button = screen.getByTestId('chat--suggestion');
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('data-analytics-id', 'AI_CHAT_SUGGESTION');
    expect(button.getAttribute('data-analytics-props')).toBe(PROPS);
    await userEvent.click(button);
    expect(spy).toHaveBeenCalledWith('AI_CHAT_SUGGESTION');
  });

  it('keeps the analytics id off the suggestions group', () => {
    render(
      <Chat data-testid='chat'>
        <ChatSuggestions>
          <ChatSuggestion data-analytics-id='AI_CHAT_SUGGESTION'>A</ChatSuggestion>
        </ChatSuggestions>
      </Chat>,
    );
    expect(screen.getByTestId('chat--suggestions')).not.toHaveAttribute('data-analytics-id');
  });

  it('forwards ref, id, aria-* and the consumer onClick to the button', async () => {
    const onClick = rs.fn();
    const ref = { current: null as HTMLButtonElement | null };
    render(
      <ChatSuggestion ref={ref} id='sugg' aria-describedby='hint' data-testid='s' onClick={onClick}>
        A
      </ChatSuggestion>,
    );
    const button = screen.getByTestId('s');
    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute('id', 'sugg');
    expect(button).toHaveAttribute('aria-describedby', 'hint');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('passes rest props (id, data-*) through on the Chat root section', () => {
    render(<Chat data-testid='chat' id='wally' data-foo='bar' />);
    const root = screen.getByTestId('chat');
    expect(root).toHaveAttribute('id', 'wally');
    expect(root).toHaveAttribute('data-foo', 'bar');
  });

  it('lands data-analytics-* and ref on the ChatTrigger <button> through DrawerTrigger asChild', async () => {
    const spy = captureAnalyticsClicks();
    const ref = { current: null as HTMLButtonElement | null };
    render(
      <Drawer>
        <DrawerTrigger asChild>
          <ChatTrigger
            ref={ref}
            data-testid='trigger'
            data-analytics-id='AI_CHAT_OPEN'
            data-analytics-props={PROPS}
          />
        </DrawerTrigger>
      </Drawer>,
    );
    const button = screen.getByTestId('trigger');
    expect(button.tagName).toBe('BUTTON');
    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute('data-analytics-id', 'AI_CHAT_OPEN');
    expect(button.getAttribute('data-analytics-props')).toBe(PROPS);
    await userEvent.click(button);
    expect(spy).toHaveBeenCalledWith('AI_CHAT_OPEN');
  });
});
