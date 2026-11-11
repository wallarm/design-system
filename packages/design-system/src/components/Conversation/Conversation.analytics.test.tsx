import { createRef, type ReactNode } from 'react';

import { afterEach, beforeEach, describe, expect, it } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Conversation } from './Conversation';
import { ConversationContent } from './ConversationContent';
import { ConversationScrollButton } from './ConversationScrollButton';

const PROPS = '{"source":"wally"}';

// The button renders only when scrolled up: give the log a scroll position above the bottom.
let scrollTop = 0;
beforeEach(() => {
  scrollTop = 0;
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, value: 1000 });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 200 });
});
afterEach(() => {
  delete (HTMLElement.prototype as unknown as Record<string, unknown>).scrollHeight;
  delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientHeight;
});

const renderScrolledUp = (button: ReactNode) => {
  render(
    <Conversation data-testid='conv' data-analytics-id='WALLY_CONVERSATION'>
      <ConversationContent data-analytics-id='WALLY_LOG' />
      {button}
    </Conversation>,
  );
  const log = screen.getByTestId('conv--body');
  Object.defineProperty(log, 'scrollTop', {
    configurable: true,
    get: () => scrollTop,
    set: () => {
      // Ignore programmatic scrolling in this test double.
    },
  });
  scrollTop = 300;
  fireEvent.scroll(log);
};

describe('Conversation — analytics pass-through (docs/metrics/contract.md)', () => {
  it('lands data-analytics-* on the real scroll <button>, verbatim, and resolves clicks', async () => {
    const captured = captureAnalyticsClicks();
    renderScrolledUp(
      <ConversationScrollButton
        data-analytics-id='WALLY_SCROLL_LATEST'
        data-analytics-props={PROPS}
      />,
    );
    const button = screen.getByTestId('conv--scroll-button');
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('data-analytics-id', 'WALLY_SCROLL_LATEST');
    expect(button.getAttribute('data-analytics-props')).toBe(PROPS);
    await userEvent.click(button);
    expect(captured).toHaveBeenCalledWith('WALLY_SCROLL_LATEST');
  });

  it('lands refs on the real nodes (root, log, button)', () => {
    const root = createRef<HTMLDivElement>();
    const log = createRef<HTMLDivElement>();
    const button = createRef<HTMLButtonElement>();
    render(
      <Conversation ref={root} data-testid='conv'>
        <ConversationContent ref={log} />
        <ConversationScrollButton ref={button} />
      </Conversation>,
    );
    const node = screen.getByTestId('conv--body');
    Object.defineProperty(node, 'scrollTop', { configurable: true, value: 300 });
    fireEvent.scroll(node);
    expect(root.current).toBe(screen.getByTestId('conv'));
    expect(log.current).toBe(node);
    expect(button.current).toBe(screen.getByTestId('conv--scroll-button'));
  });

  it('forwards attributes on the root and the log', () => {
    renderScrolledUp(null);
    expect(screen.getByTestId('conv')).toHaveAttribute('data-analytics-id', 'WALLY_CONVERSATION');
    expect(screen.getByTestId('conv--body')).toHaveAttribute('data-analytics-id', 'WALLY_LOG');
  });
});
