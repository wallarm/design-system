import { useState } from 'react';

import type { Meta, StoryFn } from 'storybook-react-rsbuild';

import { MessageAction, MessageActions, MessageTimestamp } from '.';
import { Ellipsis, ThumbsDown, ThumbsUp } from '../../icons';
import { Copyable, CopyableIcon } from '../Copyable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';

const DESCRIPTION = [
  'The small row of icon buttons under a chat message — copy, feedback, a more menu and a timestamp.',
  'Every `MessageAction` is a ghost icon button whose required `aria-label` doubles as its tooltip, so the row never needs a visible caption.',
  'By default the row is transparent until the nearest `group/message` parent is hovered or holds focus, keeping its 30px height so the conversation does not jump; pass `visible` for the latest answer.',
  'Copy is composed with `Copyable` and `CopyableIcon`, menus with `DropdownMenuTrigger asChild`, and feedback with `aria-pressed` — the row itself holds no state.',
  'Give a menu-trigger action an explicit `data-testid`: the trigger injects its own `--trigger` id, which replaces the cascaded `--action` one.',
].join(' ');

const meta = {
  title: 'AI/MessageActions',
  component: MessageActions,
  subcomponents: { MessageAction, MessageTimestamp },
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
} satisfies Meta<typeof MessageActions>;

export default meta;

const ANSWER = 'Blocked 1,204 SQL injection attempts in the last 24 hours.';

/**
 * Under a user message: the timestamp first, then Copy. In a chat, the parent should align
 * the row to the end of the bubble with `items-end`.
 */
export const User: StoryFn<typeof meta> = () => (
  <MessageActions data-testid='user-actions' visible>
    <MessageTimestamp dateTime='2026-10-21T09:41:00Z'>2m ago</MessageTimestamp>
    <Copyable text='Show me blocked attacks'>
      <MessageAction aria-label='Copy' data-testid='user-actions--copy'>
        <CopyableIcon />
      </MessageAction>
    </Copyable>
  </MessageActions>
);

/**
 * Under a Wally answer: Copy, thumbs up and down, a more menu, then the timestamp. The
 * Ellipsis button is the menu trigger and keeps its own tooltip anchored to it.
 */
export const Wally: StoryFn<typeof meta> = () => (
  <MessageActions data-testid='wally-actions' visible>
    <Copyable text={ANSWER}>
      <MessageAction aria-label='Copy' data-testid='wally-actions--copy'>
        <CopyableIcon />
      </MessageAction>
    </Copyable>
    <MessageAction aria-label='Good response' data-testid='wally-actions--up'>
      <ThumbsUp />
    </MessageAction>
    <MessageAction aria-label='Bad response' data-testid='wally-actions--down'>
      <ThumbsDown />
    </MessageAction>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MessageAction aria-label='More actions' data-testid='wally-actions--more'>
          <Ellipsis />
        </MessageAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Regenerate</DropdownMenuItem>
        <DropdownMenuItem>Report a problem</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <MessageTimestamp dateTime='2026-10-21T09:42:00Z'>1m ago</MessageTimestamp>
  </MessageActions>
);

/**
 * Default versus `visible`. The first row stays transparent (but tabbable) until its message
 * is hovered or focused; the second is forced on, as for the latest answer.
 */
export const Visible: StoryFn<typeof meta> = () => (
  <div className='flex flex-col gap-16'>
    <div className='group/message flex flex-col items-start gap-4' data-testid='message-default'>
      <p className='text-sm text-text-primary'>Hover to reveal</p>
      <MessageActions data-testid='actions-default'>
        <Copyable text={ANSWER}>
          <MessageAction aria-label='Copy' data-testid='actions-default--copy'>
            <CopyableIcon />
          </MessageAction>
        </Copyable>
        <MessageTimestamp dateTime='2026-10-21T09:42:00Z'>1m ago</MessageTimestamp>
      </MessageActions>
    </div>
    <div className='group/message flex flex-col items-start gap-4' data-testid='message-visible'>
      <p className='text-sm text-text-primary'>visible</p>
      <MessageActions data-testid='actions-visible' visible>
        <Copyable text={ANSWER}>
          <MessageAction aria-label='Copy' data-testid='actions-visible--copy'>
            <CopyableIcon />
          </MessageAction>
        </Copyable>
        <MessageTimestamp dateTime='2026-10-21T09:42:00Z'>1m ago</MessageTimestamp>
      </MessageActions>
    </div>
  </div>
);

/**
 * Thumbs feedback is a plain toggle: pass `aria-pressed` and the button keeps the
 * `states-primary-active` background while pressed. Click one to try it.
 */
export const PressedFeedback: StoryFn<typeof meta> = () => {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>('up');

  const handleGoodClick = () => {
    setFeedback(current => (current === 'up' ? null : 'up'));
  };

  const handleBadClick = () => {
    setFeedback(current => (current === 'down' ? null : 'down'));
  };

  return (
    <MessageActions data-testid='feedback-actions' visible>
      <MessageAction
        aria-label='Good response'
        aria-pressed={feedback === 'up'}
        data-testid='feedback-up'
        onClick={handleGoodClick}
      >
        <ThumbsUp />
      </MessageAction>
      <MessageAction
        aria-label='Bad response'
        aria-pressed={feedback === 'down'}
        data-testid='feedback-down'
        onClick={handleBadClick}
      >
        <ThumbsDown />
      </MessageAction>
    </MessageActions>
  );
};

/**
 * `data-analytics-id` and `data-analytics-props` go straight onto each `MessageAction` and
 * land on its real `<button>` — also through `Copyable` and `DropdownMenuTrigger asChild`.
 */
export const Analytics: StoryFn<typeof meta> = () => (
  <MessageActions data-testid='analytics-actions' visible>
    <Copyable text={ANSWER}>
      <MessageAction
        aria-label='Copy'
        data-testid='analytics-actions--copy'
        data-analytics-id='WALLY_ANSWER_COPY'
      >
        <CopyableIcon />
      </MessageAction>
    </Copyable>
    <MessageAction
      aria-label='Good response'
      data-testid='analytics-actions--up'
      data-analytics-id='WALLY_ANSWER_FEEDBACK'
      data-analytics-props='{"rating":"up"}'
    >
      <ThumbsUp />
    </MessageAction>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MessageAction
          aria-label='More actions'
          data-testid='analytics-actions--more'
          data-analytics-id='WALLY_ANSWER_MORE'
        >
          <Ellipsis />
        </MessageAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Regenerate</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </MessageActions>
);
