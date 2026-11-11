import { createRef } from 'react';

import { describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { ThumbsUp } from '../../icons';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
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

const PROPS = '{"rating":"up","message":"m-1"}';

describe('MessageActions — analytics pass-through (docs/metrics/contract.md)', () => {
  it('lands data-analytics-* on the real <button>, verbatim, and resolves clicks', async () => {
    const captured = captureAnalyticsClicks();
    render(
      <MessageAction
        aria-label='Good response'
        data-testid='up'
        data-analytics-id='WALLY_FEEDBACK'
        data-analytics-props={PROPS}
      >
        <ThumbsUp />
      </MessageAction>,
    );
    const button = screen.getByTestId('up');
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('data-analytics-id', 'WALLY_FEEDBACK');
    expect(button.getAttribute('data-analytics-props')).toBe(PROPS);
    await userEvent.click(button);
    expect(captured).toHaveBeenCalledWith('WALLY_FEEDBACK');
  });

  it('keeps the id on the button inside Copyable', () => {
    render(
      <Copyable text='answer'>
        <MessageAction aria-label='Copy' data-testid='copy' data-analytics-id='WALLY_COPY'>
          <CopyableIcon />
        </MessageAction>
      </Copyable>,
    );
    const button = screen.getByTestId('copy');
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('data-analytics-id', 'WALLY_COPY');
  });

  it('reaches the final <button> through DropdownMenuTrigger asChild (polymorphic)', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <MessageAction
            aria-label='More actions'
            data-testid='more'
            data-analytics-id='WALLY_MORE'
          >
            <ThumbsUp />
          </MessageAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Regenerate</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const button = screen.getByTestId('more');
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('data-analytics-id', 'WALLY_MORE');
    await userEvent.click(button);
    expect(screen.getByTestId('more')).toHaveAttribute('data-analytics-id', 'WALLY_MORE');
  });

  it('forwards attributes on the group root and the timestamp', () => {
    render(
      <MessageActions data-testid='row' data-analytics-id='WALLY_ACTIONS'>
        <MessageTimestamp data-analytics-id='WALLY_TS'>now</MessageTimestamp>
      </MessageActions>,
    );
    expect(screen.getByTestId('row')).toHaveAttribute('data-analytics-id', 'WALLY_ACTIONS');
    expect(screen.getByTestId('row--timestamp')).toHaveAttribute('data-analytics-id', 'WALLY_TS');
  });

  it('lands refs on the real nodes (standalone, Copyable, menu trigger, row, time)', () => {
    const standalone = createRef<HTMLButtonElement>();
    const copy = createRef<HTMLButtonElement>();
    const more = createRef<HTMLButtonElement>();
    const row = createRef<HTMLDivElement>();
    const time = createRef<HTMLTimeElement>();
    render(
      <MessageActions ref={row} data-testid='row'>
        <MessageAction ref={standalone} aria-label='Good response' data-testid='up'>
          <ThumbsUp />
        </MessageAction>
        <Copyable text='answer'>
          <MessageAction ref={copy} aria-label='Copy' data-testid='copy'>
            <CopyableIcon />
          </MessageAction>
        </Copyable>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <MessageAction ref={more} aria-label='More actions' data-testid='more'>
              <ThumbsUp />
            </MessageAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Regenerate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <MessageTimestamp ref={time}>now</MessageTimestamp>
      </MessageActions>,
    );
    expect(standalone.current).toBe(screen.getByTestId('up'));
    expect(copy.current).toBe(screen.getByTestId('copy'));
    expect(more.current).toBe(screen.getByTestId('more'));
    expect(row.current).toBe(screen.getByTestId('row'));
    expect(time.current).toBe(screen.getByTestId('row--timestamp'));
  });

  it('composes a consumer onClick with the menu trigger', async () => {
    const onClick = rs.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <MessageAction aria-label='More actions' data-testid='more' onClick={onClick}>
            <ThumbsUp />
          </MessageAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Regenerate</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await userEvent.click(screen.getByTestId('more'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('menu')).toBeInTheDocument();
  });
});
