import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { ThumbsUp } from '../../icons';
import { copyText } from '../../utils/copyText';
import { TestIdProvider } from '../../utils/testId';
import { Copyable, CopyableIcon } from '../Copyable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { MessageAction } from './MessageAction';
import { MessageActions } from './MessageActions';
import { MessageTimestamp } from './MessageTimestamp';

rs.mock('../../utils/copyText', () => ({
  copyText: rs.fn(() => Promise.resolve()),
}));

afterEach(() => {
  rs.mocked(copyText).mockClear();
});

describe('MessageActions', () => {
  it('renders a labelled group with its data-slot', () => {
    render(<MessageActions data-testid='row' />);
    const row = screen.getByTestId('row');
    expect(row).toBe(screen.getByRole('group', { name: 'Message actions' }));
    expect(row).toHaveAttribute('data-slot', 'message-actions');
  });

  it('lets the consumer override aria-label', () => {
    render(<MessageActions data-testid='row' aria-label='Answer actions' />);
    expect(screen.getByTestId('row')).toHaveAttribute('aria-label', 'Answer actions');
  });

  it('is hidden until hover by default and forced on with visible', () => {
    const { rerender } = render(<MessageActions data-testid='row' />);
    expect(screen.getByTestId('row')).toHaveClass('opacity-0');
    rerender(<MessageActions data-testid='row' visible />);
    expect(screen.getByTestId('row')).toHaveClass('opacity-100');
    expect(screen.getByTestId('row')).not.toHaveClass('opacity-0');
  });
});

describe('MessageAction', () => {
  it('renders a ghost type=button with the aria-label as its name', () => {
    render(
      <MessageAction aria-label='Good response' data-testid='up'>
        <ThumbsUp />
      </MessageAction>,
    );
    const button = screen.getByTestId('up');
    expect(button).toBe(screen.getByRole('button', { name: 'Good response' }));
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-slot', 'message-action');
  });

  it('shows the aria-label in a tooltip on hover', async () => {
    render(
      <MessageAction aria-label='Good response' data-testid='up'>
        <ThumbsUp />
      </MessageAction>,
    );
    await userEvent.hover(screen.getByTestId('up'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Good response');
  });

  it('passes aria-pressed through', () => {
    render(
      <MessageAction aria-label='Good response' aria-pressed data-testid='up'>
        <ThumbsUp />
      </MessageAction>,
    );
    expect(screen.getByTestId('up')).toHaveAttribute('aria-pressed', 'true');
  });

  it('copies inside Copyable, swaps the icon and keeps the consumer onClick', async () => {
    const onClick = rs.fn();
    render(
      <Copyable text='answer'>
        <MessageAction aria-label='Copy' data-testid='copy' onClick={onClick}>
          <CopyableIcon />
        </MessageAction>
      </Copyable>,
    );
    const button = screen.getByTestId('copy');
    const before = button.innerHTML;
    await userEvent.click(button);
    expect(copyText).toHaveBeenCalledWith('answer');
    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(button.innerHTML).not.toBe(before));
  });

  it('works as DropdownMenuTrigger asChild and anchors the tooltip to the same id', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <MessageAction aria-label='More actions' data-testid='more'>
            <ThumbsUp />
          </MessageAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Regenerate</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const button = screen.getByTestId('more');
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('More actions');
    expect(button.id).toBeTruthy();
    expect(tooltip.id).toBeTruthy();
    expect(button.getAttribute('aria-describedby')).toBe(tooltip.id);

    await userEvent.click(button);
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu')).toHaveAttribute('aria-labelledby', button.id);
  });
});

describe('MessageAction — explicit id', () => {
  it('keeps a consumer id on the button and still opens the tooltip', async () => {
    render(
      <MessageAction aria-label='Copy' id='custom' data-testid='copy'>
        <ThumbsUp />
      </MessageAction>,
    );
    const button = screen.getByTestId('copy');
    expect(button).toHaveAttribute('id', 'custom');
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Copy');
    expect(button.getAttribute('aria-describedby')).toBe(tooltip.id);
  });
});

describe('MessageTimestamp', () => {
  it('renders a <time> with dateTime and the text', () => {
    render(
      <MessageTimestamp data-testid='ts' dateTime='2026-10-21T09:41:00Z'>
        2m ago
      </MessageTimestamp>,
    );
    const ts = screen.getByTestId('ts');
    expect(ts.tagName).toBe('TIME');
    expect(ts).toHaveAttribute('dateTime', '2026-10-21T09:41:00Z');
    expect(ts).toHaveAttribute('data-slot', 'message-timestamp');
    expect(ts).toHaveTextContent('2m ago');
  });
});

describe('MessageActions — test-id cascade', () => {
  it('derives --actions--action and --actions--timestamp from a parent cascade', () => {
    render(
      <TestIdProvider value='msg'>
        <MessageActions>
          <MessageAction aria-label='Copy'>
            <ThumbsUp />
          </MessageAction>
          <MessageTimestamp>now</MessageTimestamp>
        </MessageActions>
      </TestIdProvider>,
    );
    expect(screen.getByTestId('msg--actions')).toHaveAttribute('data-slot', 'message-actions');
    expect(screen.getByTestId('msg--actions--action').tagName).toBe('BUTTON');
    expect(screen.getByTestId('msg--actions--timestamp').tagName).toBe('TIME');
  });

  it('uses its own data-testid as the base when standalone', () => {
    render(
      <MessageActions data-testid='row'>
        <MessageAction aria-label='Copy'>
          <ThumbsUp />
        </MessageAction>
      </MessageActions>,
    );
    expect(screen.getByTestId('row--action').tagName).toBe('BUTTON');
  });

  it('lets a leaf data-testid win over the cascade', () => {
    render(
      <MessageActions data-testid='row'>
        <MessageAction aria-label='Copy' data-testid='copy'>
          <ThumbsUp />
        </MessageAction>
      </MessageActions>,
    );
    expect(screen.getByTestId('copy').tagName).toBe('BUTTON');
    expect(screen.queryByTestId('row--action')).toBeNull();
  });

  it('derives the tooltip test id from the action', async () => {
    render(
      <MessageActions data-testid='row'>
        <MessageAction aria-label='Copy' data-testid='copy'>
          <ThumbsUp />
        </MessageAction>
      </MessageActions>,
    );
    await userEvent.hover(screen.getByTestId('copy'));
    expect(await screen.findByTestId('copy--content')).toHaveTextContent('Copy');
  });

  it('keeps the DOM clean without a data-testid', () => {
    const { container } = render(
      <MessageActions>
        <MessageAction aria-label='Copy'>
          <ThumbsUp />
        </MessageAction>
      </MessageActions>,
    );
    expect(container.querySelector('[data-testid]')).toBeNull();
  });
});
