import { createRef } from 'react';

import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { UserMessage } from './UserMessage';
import { UserMessageBubble } from './UserMessageBubble';
import { UserMessageShowMore } from './UserMessageShowMore';

const PROPS = '{"message":"m-1"}';

afterEach(() => {
  rs.restoreAllMocks();
});

describe('UserMessage — analytics pass-through (docs/metrics/contract.md)', () => {
  it('lands a custom show-more instance’s data-analytics-* on the real <button>', async () => {
    rs.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(400);
    rs.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(220);
    const captured = captureAnalyticsClicks();
    const ref = createRef<HTMLButtonElement>();
    render(
      <UserMessage data-testid='msg'>
        <UserMessageBubble
          showMore={
            <UserMessageShowMore
              ref={ref}
              data-analytics-id='WALLY_USER_MESSAGE_TOGGLE'
              data-analytics-props={PROPS}
            />
          }
        >
          Long
        </UserMessageBubble>
      </UserMessage>,
    );
    const button = screen.getByTestId('msg--show-more');
    expect(button.tagName).toBe('BUTTON');
    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute('data-analytics-id', 'WALLY_USER_MESSAGE_TOGGLE');
    expect(button.getAttribute('data-analytics-props')).toBe(PROPS);
    await userEvent.click(button);
    expect(captured).toHaveBeenCalledWith('WALLY_USER_MESSAGE_TOGGLE');
    // Survives the Show more → Show less swap.
    expect(screen.getByTestId('msg--show-more')).toHaveAttribute(
      'data-analytics-id',
      'WALLY_USER_MESSAGE_TOGGLE',
    );
  });

  it('forwards attributes and refs on the root and the bubble', () => {
    const root = createRef<HTMLElement>();
    const bubble = createRef<HTMLDivElement>();
    render(
      <UserMessage ref={root} data-testid='msg' data-analytics-id='WALLY_USER_MESSAGE'>
        <UserMessageBubble ref={bubble} data-analytics-id='WALLY_USER_BUBBLE'>
          Hi
        </UserMessageBubble>
      </UserMessage>,
    );
    expect(root.current).toBe(screen.getByTestId('msg'));
    expect(bubble.current).toBe(screen.getByTestId('msg--bubble'));
    expect(screen.getByTestId('msg')).toHaveAttribute('data-analytics-id', 'WALLY_USER_MESSAGE');
    expect(screen.getByTestId('msg--bubble')).toHaveAttribute(
      'data-analytics-id',
      'WALLY_USER_BUBBLE',
    );
  });
});
