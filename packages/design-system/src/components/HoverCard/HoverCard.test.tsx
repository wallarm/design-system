import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { AgentAvatar } from '../AgentAvatar';
import { Avatar, AvatarContent, AvatarName } from '../Avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import {
  HoverCard,
  HoverCardAction,
  HoverCardContent,
  HoverCardHeader,
  HoverCardTitle,
  HoverCardTrigger,
} from '.';

// zag runs a state's effects (the delay timers) and its DOM updates a microtask after the event,
// so flush before and after moving the clock.
const flushMicrotasks = () => act(() => Promise.resolve());

const advance = async (ms: number) => {
  await flushMicrotasks();
  await act(async () => {
    rs.advanceTimersByTime(ms);
  });
};

// Presence unmounts the closed content on the next animation frame (requestAnimationFrame stays real).
const nextFrame = () =>
  act(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));

interface CardProps {
  onFocus?: () => void;
  onPointerEnter?: () => void;
  onClick?: () => void;
}

const renderCard = (props: CardProps = {}) =>
  render(
    <HoverCard data-testid='card'>
      <HoverCardTrigger>
        <a href='#ada' {...props}>
          Ada Lovelace
        </a>
      </HoverCardTrigger>
      <HoverCardContent>
        <HoverCardHeader>
          <AgentAvatar agent='wally' size={56} data-testid='agent' />
          <HoverCardTitle variant='agent'>Wally</HoverCardTitle>
        </HoverCardHeader>
      </HoverCardContent>
    </HoverCard>,
  );

const pointerEnter = (el: Element) => fireEvent.pointerEnter(el, { pointerType: 'mouse' });
const pointerLeave = (el: Element) => fireEvent.pointerLeave(el, { pointerType: 'mouse' });

describe('HoverCard — behaviour', () => {
  beforeEach(() => {
    // Only the delay timers: faking queueMicrotask stalls zag's state flush.
    rs.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  });

  afterEach(() => {
    rs.useRealTimers();
  });

  it('should not mount the content before open', () => {
    renderCard();
    expect(screen.queryByTestId('card--content')).toBeNull();
  });

  it('should mount the content 600 ms after pointerenter on the trigger', async () => {
    renderCard();
    pointerEnter(screen.getByTestId('card--trigger'));
    await advance(599);
    expect(screen.queryByTestId('card--content')).toBeNull();
    await advance(1);
    expect(screen.getByTestId('card--content')).toBeInTheDocument();
    expect(screen.getByTestId('agent')).toBeInTheDocument();
  });

  it('should mount the content 600 ms after focus on the trigger', async () => {
    renderCard();
    act(() => {
      screen.getByTestId('card--trigger').focus();
    });
    await advance(599);
    expect(screen.queryByTestId('card--content')).toBeNull();
    await advance(1);
    expect(screen.getByTestId('card--content')).toBeInTheDocument();
  });

  it('should unmount the content and its AgentAvatar after leave and the close delay', async () => {
    renderCard();
    const trigger = screen.getByTestId('card--trigger');
    pointerEnter(trigger);
    await advance(600);
    expect(screen.getByTestId('agent')).toBeInTheDocument();

    pointerLeave(trigger);
    await advance(299);
    expect(trigger).toHaveAttribute('data-state', 'open');
    await advance(1);
    expect(trigger).toHaveAttribute('data-state', 'closed');
    await nextFrame();
    expect(screen.queryByTestId('card--content')).toBeNull();
    expect(screen.queryByTestId('agent')).toBeNull();
  });

  it('should stay open when the pointer moves from the trigger onto the card', async () => {
    renderCard();
    const trigger = screen.getByTestId('card--trigger');
    pointerEnter(trigger);
    await advance(600);

    pointerLeave(trigger);
    pointerEnter(screen.getByTestId('card--content'));
    await advance(1000);
    expect(trigger).toHaveAttribute('data-state', 'open');
  });

  it('should unmount the content on Escape', async () => {
    renderCard();
    pointerEnter(screen.getByTestId('card--trigger'));
    await advance(600);
    expect(screen.getByTestId('agent')).toBeInTheDocument();
    // The dismissable layer attaches its Escape listener a frame after the content mounts.
    await nextFrame();
    await advance(0);

    fireEvent.keyDown(document, { key: 'Escape' });
    await advance(0);
    await nextFrame();
    expect(screen.queryByTestId('card--content')).toBeNull();
    expect(screen.queryByTestId('agent')).toBeNull();
  });

  it('should still fire the trigger child onFocus, onPointerEnter and onClick', async () => {
    const onFocus = rs.fn();
    const onPointerEnter = rs.fn();
    const onClick = rs.fn();
    renderCard({ onFocus, onPointerEnter, onClick });
    const trigger = screen.getByTestId('card--trigger');

    pointerEnter(trigger);
    act(() => {
      trigger.focus();
    });
    fireEvent.click(trigger);

    expect(onPointerEnter).toHaveBeenCalledOnce();
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledOnce();
    // Ark's own handlers ran too: the card still opens.
    await advance(600);
    expect(screen.getByTestId('card--content')).toBeInTheDocument();
  });
});

const pointerMove = (el: Element) => fireEvent.pointerMove(el, { pointerType: 'mouse' });

// One element, two machines: the card and a tooltip share `ids.trigger`.
const renderWithTooltip = (order: 'card-outer' | 'tooltip-outer') => {
  const link = <a href='#ada'>Ada Lovelace</a>;
  return render(
    <HoverCard data-testid='card' ids={{ trigger: 'ada-trigger' }}>
      <Tooltip data-testid='tip' ids={{ trigger: 'ada-trigger' }}>
        {order === 'card-outer' ? (
          <HoverCardTrigger>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
          </HoverCardTrigger>
        ) : (
          <TooltipTrigger asChild>
            <HoverCardTrigger>{link}</HoverCardTrigger>
          </TooltipTrigger>
        )}
        <TooltipContent>Signed in 5 minutes ago</TooltipContent>
      </Tooltip>
      <HoverCardContent>
        <HoverCardTitle>Ada Lovelace</HoverCardTitle>
        <Tooltip data-testid='inner-tip'>
          <TooltipTrigger data-testid='inner-tip--trigger'>Role</TooltipTrigger>
          <TooltipContent>Admin</TooltipContent>
        </Tooltip>
      </HoverCardContent>
    </HoverCard>,
  );
};

describe('HoverCard — trigger shared with a Tooltip', () => {
  beforeEach(() => {
    rs.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  });

  afterEach(() => {
    rs.useRealTimers();
  });

  for (const order of ['card-outer', 'tooltip-outer'] as const) {
    it(`should put ids.trigger on the one link element (${order})`, () => {
      renderWithTooltip(order);
      const link = screen.getByRole('link', { name: 'Ada Lovelace' });
      expect(link).toHaveAttribute('id', 'ada-trigger');
      expect(document.querySelectorAll('#ada-trigger')).toHaveLength(1);
    });

    it(`should show the tooltip first, then the card with the tooltip closed (${order})`, async () => {
      renderWithTooltip(order);
      const link = screen.getByRole('link', { name: 'Ada Lovelace' });
      pointerEnter(link);
      pointerMove(link);

      await advance(400);
      expect(screen.getByTestId('tip--content')).toHaveAttribute('data-state', 'open');
      expect(screen.queryByTestId('card--content')).toBeNull();

      await advance(200);
      expect(screen.getByTestId('card--content')).toBeInTheDocument();
      await advance(0);
      await nextFrame();
      expect(screen.queryByTestId('tip--content')).toBeNull();

      // Stays off while the card is up.
      pointerMove(link);
      await advance(1000);
      expect(screen.queryByTestId('tip--content')).toBeNull();
      expect(screen.getByTestId('card--content')).toBeInTheDocument();
    });
  }

  it('should show the trigger tooltip again on the next hover after the card closed', async () => {
    renderWithTooltip('card-outer');
    const link = screen.getByRole('link', { name: 'Ada Lovelace' });
    pointerEnter(link);
    pointerMove(link);
    await advance(600);
    expect(screen.getByTestId('card--content')).toBeInTheDocument();

    // The pointer leaves while the tooltip is held closed.
    pointerLeave(link);
    await advance(300);
    await nextFrame();
    await advance(0);
    expect(screen.queryByTestId('card--content')).toBeNull();

    pointerEnter(link);
    pointerMove(link);
    await advance(400);
    expect(screen.getByTestId('tip--content')).toHaveAttribute('data-state', 'open');
  });

  it('should keep tooltips inside the card live', async () => {
    renderWithTooltip('card-outer');
    pointerEnter(screen.getByRole('link', { name: 'Ada Lovelace' }));
    await advance(600);

    const inner = screen.getByTestId('inner-tip--trigger');
    pointerEnter(inner);
    pointerMove(inner);
    await advance(400);
    expect(screen.getByTestId('inner-tip--content')).toHaveAttribute('data-state', 'open');
  });

  it('should render AvatarName with no overflow tooltip on the trigger side', () => {
    render(
      <HoverCard>
        <Avatar data-testid='person'>
          <AvatarContent>
            <AvatarName>
              <HoverCardTrigger>
                <a href='#ada'>Ada Lovelace</a>
              </HoverCardTrigger>
            </AvatarName>
          </AvatarContent>
        </Avatar>
      </HoverCard>,
    );
    expect(screen.getByTestId('person--name')).not.toHaveAttribute('data-scope', 'tooltip');
  });
});

describe('HoverCardTitle', () => {
  it('should use the pixel font for the agent variant', () => {
    render(
      <HoverCardTitle data-testid='title' variant='agent'>
        Wally
      </HoverCardTitle>,
    );
    const title = screen.getByTestId('title');
    expect(title).toHaveClass('font-pixel');
    expect(title).not.toHaveClass('font-sans-display');
  });

  it('should use the display font by default', () => {
    render(<HoverCardTitle data-testid='title'>Ada Lovelace</HoverCardTitle>);
    const title = screen.getByTestId('title');
    expect(title).toHaveClass('font-sans-display');
    expect(title).not.toHaveClass('font-pixel');
  });
});

describe('HoverCardAction', () => {
  it('should render a button with the preset classes', () => {
    render(<HoverCardAction data-testid='action'>Open profile</HoverCardAction>);
    const action = screen.getByTestId('action');
    expect(action.tagName).toBe('BUTTON');
    expect(action).toHaveClass('bg-states-primary-default-alt', 'h-24', 'w-full');
  });

  it('should render an <a> with the preset classes with asChild', () => {
    render(
      <HoverCardAction asChild>
        <a href='/agents/wally'>Open agent</a>
      </HoverCardAction>,
    );
    const link = screen.getByRole('link', { name: 'Open agent' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/agents/wally');
    expect(link).toHaveClass('bg-states-primary-default-alt', 'h-24', 'w-full');
  });
});
