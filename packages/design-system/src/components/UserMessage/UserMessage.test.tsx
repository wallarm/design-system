import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { TestIdProvider } from '../../utils/testId';
import { UserMessage } from './UserMessage';
import { UserMessageBubble } from './UserMessageBubble';
import { UserMessageShowMore } from './UserMessageShowMore';

/**
 * jsdom has no layout: fake text whose content is 400px tall. Clamped, its box is
 * 220px (overflows); unclamped, the box fits the content (no overflow).
 */
const mockOverflow = () => {
  rs.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(400);
  rs.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.classList.contains('max-h-220') ? 220 : 400;
  });
};

/** Overflows only when the text contains "Long". */
const mockOverflowByContent = () => {
  rs.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.textContent?.includes('Long') ? 400 : 100;
  });
  rs.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.textContent?.includes('Long') ? 220 : 100;
  });
};

afterEach(() => {
  rs.restoreAllMocks();
});

describe('UserMessage', () => {
  it('renders an article named "You" with its data-slot', () => {
    render(<UserMessage data-testid='msg' />);
    const root = screen.getByTestId('msg');
    expect(root).toBe(screen.getByRole('article', { name: 'You' }));
    expect(root).toHaveAttribute('data-slot', 'user-message');
  });

  it('lets the consumer override aria-label', () => {
    render(<UserMessage data-testid='msg' aria-label='Ilya' />);
    expect(screen.getByTestId('msg')).toHaveAttribute('aria-label', 'Ilya');
  });
});

describe('UserMessageBubble', () => {
  it('renders no toggle when the text fits', () => {
    render(
      <UserMessage data-testid='msg'>
        <UserMessageBubble>Hi</UserMessageBubble>
      </UserMessage>,
    );
    expect(screen.getByTestId('msg--text')).toHaveTextContent('Hi');
    expect(screen.queryByTestId('msg--show-more')).toBeNull();
    expect(screen.getByTestId('msg--bubble')).toHaveClass('py-12');
  });

  it('renders Show more pointing at the text when it overflows', () => {
    mockOverflow();
    render(
      <UserMessage data-testid='msg'>
        <UserMessageBubble>Long</UserMessageBubble>
      </UserMessage>,
    );
    const text = screen.getByTestId('msg--text');
    const button = screen.getByTestId('msg--show-more');
    expect(text).toHaveClass('max-h-220');
    expect(button).toHaveTextContent('Show more');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-controls', text.id);
    expect(screen.getByTestId('msg--bubble')).toHaveClass('pb-28');
  });

  it('toggles between Show more and Show less', async () => {
    mockOverflow();
    render(
      <UserMessage data-testid='msg'>
        <UserMessageBubble>Long</UserMessageBubble>
      </UserMessage>,
    );
    const button = screen.getByTestId('msg--show-more');
    await userEvent.click(button);
    expect(screen.getByTestId('msg--text')).not.toHaveClass('max-h-220');
    expect(screen.getByTestId('msg--show-more')).toBe(button);
    expect(button).toHaveTextContent('Show less');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveFocus();

    await userEvent.click(button);
    expect(screen.getByTestId('msg--text')).toHaveClass('max-h-220');
    expect(button).toHaveTextContent('Show more');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('lets a consumer preventDefault cancel the toggle', async () => {
    mockOverflow();
    const onClick = rs.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <UserMessage data-testid='msg'>
        <UserMessageBubble showMore={<UserMessageShowMore onClick={onClick} />}>
          Long
        </UserMessageBubble>
      </UserMessage>,
    );
    await userEvent.click(screen.getByTestId('msg--show-more'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('msg--show-more')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('msg--text')).toHaveClass('max-h-220');
  });

  it('uses a custom showMore instance and its labels', async () => {
    mockOverflow();
    render(
      <UserMessage data-testid='msg'>
        <UserMessageBubble
          showMore={
            <UserMessageShowMore
              data-testid='toggle'
              showMoreLabel='Expand'
              showLessLabel='Collapse'
            />
          }
        >
          Long
        </UserMessageBubble>
      </UserMessage>,
    );
    const button = screen.getByTestId('toggle');
    expect(button).toHaveTextContent('Expand');
    await userEvent.click(button);
    expect(button).toHaveTextContent('Collapse');
  });

  it('re-measures when the children change', () => {
    mockOverflowByContent();
    const { rerender } = render(
      <UserMessage data-testid='msg'>
        <UserMessageBubble>Hi</UserMessageBubble>
      </UserMessage>,
    );
    expect(screen.queryByTestId('msg--show-more')).toBeNull();
    rerender(
      <UserMessage data-testid='msg'>
        <UserMessageBubble>Long</UserMessageBubble>
      </UserMessage>,
    );
    expect(screen.getByTestId('msg--show-more')).toBeInTheDocument();
  });

  it('reserves no toggle space for showMore={false}', () => {
    mockOverflow();
    render(
      <UserMessage data-testid='msg'>
        <UserMessageBubble showMore={false}>Long</UserMessageBubble>
      </UserMessage>,
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByTestId('msg--bubble')).toHaveClass('py-12');
  });

  it('renders no toggle for showMore={null}', () => {
    mockOverflow();
    render(
      <UserMessage data-testid='msg'>
        <UserMessageBubble showMore={null}>Long</UserMessageBubble>
      </UserMessage>,
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByTestId('msg--bubble')).toHaveClass('py-12');
  });
});

describe('UserMessageShowMore', () => {
  it('renders nothing outside a bubble', () => {
    const { container } = render(<UserMessageShowMore />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('UserMessage — test-id cascade', () => {
  it('derives --user-message slots from a parent cascade', () => {
    mockOverflow();
    render(
      <TestIdProvider value='chat'>
        <UserMessage>
          <UserMessageBubble>Long</UserMessageBubble>
        </UserMessage>
      </TestIdProvider>,
    );
    expect(screen.getByTestId('chat--user-message').tagName).toBe('ARTICLE');
    expect(screen.getByTestId('chat--user-message--bubble')).toBeInTheDocument();
    expect(screen.getByTestId('chat--user-message--text')).toBeInTheDocument();
    expect(screen.getByTestId('chat--user-message--show-more').tagName).toBe('BUTTON');
  });

  it('keeps the DOM clean without a data-testid', () => {
    mockOverflow();
    const { container } = render(
      <UserMessage>
        <UserMessageBubble>Long</UserMessageBubble>
      </UserMessage>,
    );
    expect(container.querySelector('[data-testid]')).toBeNull();
  });
});
