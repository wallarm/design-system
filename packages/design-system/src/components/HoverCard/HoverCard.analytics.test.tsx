import { describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Link } from '../Link';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { HoverCard, HoverCardAction, HoverCardContent, HoverCardTrigger } from '.';

// Controlled open needs a handler; these tests only read the open content.
const noop = rs.fn();

describe('HoverCardTrigger — analytics', () => {
  it('should keep data-analytics-id and props on the child after the asChild merge', () => {
    const payload = '{"feature":"users","place":"row-name"}';
    render(
      <HoverCard data-testid='card'>
        <HoverCardTrigger>
          <a href='#ada' data-analytics-id='users.row-name' data-analytics-props={payload}>
            Ada Lovelace
          </a>
        </HoverCardTrigger>
        <HoverCardContent>Body</HoverCardContent>
      </HoverCard>,
    );

    const trigger = screen.getByTestId('card--trigger');
    expect(trigger.tagName).toBe('A');
    expect(trigger).toHaveAttribute('data-analytics-id', 'users.row-name');
    expect(trigger).toHaveAttribute('data-analytics-props', payload);
  });

  it('should resolve the trigger click through closest()', async () => {
    const captured = captureAnalyticsClicks();
    render(
      <HoverCard data-testid='card'>
        <HoverCardTrigger>
          <button type='button' data-analytics-id='users.row-name'>
            <span data-testid='label'>Ada Lovelace</span>
          </button>
        </HoverCardTrigger>
        <HoverCardContent>Body</HoverCardContent>
      </HoverCard>,
    );

    await userEvent.click(screen.getByTestId('label'));
    expect(captured).toHaveBeenCalledWith('users.row-name');
  });
});

describe('Clicks inside HoverCardContent', () => {
  it.each([
    [
      'HoverCardAction',
      <HoverCardAction key='a' data-testid='target' data-analytics-id='card.action'>
        Open profile
      </HoverCardAction>,
      'BUTTON',
    ],
    [
      'HoverCardAction asChild',
      <HoverCardAction key='a' asChild>
        <a href='#profile' data-testid='target' data-analytics-id='card.action'>
          Open profile
        </a>
      </HoverCardAction>,
      'A',
    ],
    [
      'a row Link',
      <Link key='a' href='#app' data-testid='target' data-analytics-id='card.action'>
        Checkout API
      </Link>,
      'A',
    ],
  ])('should resolve a %s click and not dismiss the card', async (_, target, tagName) => {
    const onOpenChange = rs.fn();
    const onClick = rs.fn();
    render(
      <HoverCard data-testid='card' open onOpenChange={onOpenChange}>
        <HoverCardTrigger>
          <a href='#ada'>Ada Lovelace</a>
        </HoverCardTrigger>
        {/* The click handler sits on the content so the anchors' default navigation does not matter. */}
        <HoverCardContent onClick={onClick}>{target}</HoverCardContent>
      </HoverCard>,
    );

    const el = await screen.findByTestId('target');
    expect(el.tagName).toBe(tagName);
    const captured = captureAnalyticsClicks();

    await userEvent.click(el);

    expect(captured).toHaveBeenCalledWith('card.action');
    expect(onClick).toHaveBeenCalledOnce();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('should not put analytics attributes on the content wrapper', async () => {
    render(
      <HoverCard data-testid='card' open onOpenChange={noop}>
        <HoverCardTrigger>
          <a href='#ada' data-analytics-id='users.row-name'>
            Ada Lovelace
          </a>
        </HoverCardTrigger>
        <HoverCardContent>
          <HoverCardAction data-analytics-id='card.action'>Open profile</HoverCardAction>
        </HoverCardContent>
      </HoverCard>,
    );

    expect(await screen.findByTestId('card--content')).not.toHaveAttribute('data-analytics-id');
  });
});

describe('Tooltip inside HoverCardContent', () => {
  // jsdom resolves no CSS variables, so assert the layer classes: the card sits on the
  // drawer positioner layer (50 + level), the tooltip on --tooltip-z-index (1000).
  it('should stack the tooltip above the card', async () => {
    render(
      <HoverCard data-testid='card' open onOpenChange={noop}>
        <HoverCardTrigger>
          <a href='#ada'>Ada Lovelace</a>
        </HoverCardTrigger>
        <HoverCardContent>
          <Tooltip data-testid='tip' open onOpenChange={noop}>
            <TooltipTrigger>3 hours ago</TooltipTrigger>
            <TooltipContent>Nov 12, 2026 10:00</TooltipContent>
          </Tooltip>
        </HoverCardContent>
      </HoverCard>,
    );

    const card = await screen.findByTestId('card--content');
    const tip = await screen.findByTestId('tip--content');
    expect(card.className).toContain('var(--drawer-positioner-z-index)');
    expect(card.className).toContain('var(--layer-index,0)');
    expect(tip).toHaveClass('z-(--tooltip-z-index)');
    // Portaled on its own, so the card's positioner stacking context does not cap it.
    expect(card.contains(tip)).toBe(false);
  });
});
