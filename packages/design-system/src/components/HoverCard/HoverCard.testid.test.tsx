import { describe, expect, it, rs } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgentItem, Avatar, AvatarContent, AvatarFallback, AvatarName } from '../Avatar';
import {
  HoverCard,
  HoverCardAction,
  HoverCardContent,
  HoverCardDescription,
  HoverCardHeader,
  HoverCardTitle,
  HoverCardTrigger,
} from '.';

const noop = rs.fn();

describe('HoverCard — test ids', () => {
  it('should cascade --trigger, --content, --header, --title, --description and --action', async () => {
    render(
      <HoverCard data-testid='card' open onOpenChange={noop}>
        <HoverCardTrigger>
          <a href='#ada'>Ada Lovelace</a>
        </HoverCardTrigger>
        <HoverCardContent>
          <HoverCardHeader>
            <span>media</span>
            <HoverCardTitle>Ada Lovelace</HoverCardTitle>
            <HoverCardDescription>ada@example.com</HoverCardDescription>
          </HoverCardHeader>
          <HoverCardAction>Open profile</HoverCardAction>
        </HoverCardContent>
      </HoverCard>,
    );

    expect(screen.getByRole('link', { name: 'Ada Lovelace' })).toHaveAttribute(
      'data-testid',
      'card--trigger',
    );
    expect((await screen.findByTestId('card--content')).tagName).toBe('DIV');
    expect(screen.getByTestId('card--header')).toBeInTheDocument();
    expect(screen.getByTestId('card--title')).toHaveTextContent('Ada Lovelace');
    expect(screen.getByTestId('card--description')).toHaveTextContent('ada@example.com');
    expect(screen.getByTestId('card--action').tagName).toBe('BUTTON');
  });

  it.each([
    ['title', 'A very long name'],
    ['description', 'a.very.long@example.com'],
  ])(
    'should scope the truncated %s tooltip under its part, not the card content',
    async (part, text) => {
      render(
        <HoverCard data-testid='card' open onOpenChange={noop}>
          <HoverCardTrigger>
            <a href='#ada'>Ada</a>
          </HoverCardTrigger>
          <HoverCardContent>
            <HoverCardHeader>
              <span>media</span>
              <HoverCardTitle>A very long name</HoverCardTitle>
              <HoverCardDescription>a.very.long@example.com</HoverCardDescription>
            </HoverCardHeader>
          </HoverCardContent>
        </HoverCard>,
      );

      const el = await screen.findByTestId(`card--${part}`);
      Object.defineProperties(el, {
        scrollWidth: { configurable: true, value: 300 },
        clientWidth: { configurable: true, value: 100 },
      });
      await userEvent.hover(el);

      expect(
        await screen.findByTestId(`card--${part}--content`, {}, { timeout: 2000 }),
      ).toHaveTextContent(text);
      await waitFor(() => expect(screen.getAllByTestId('card--content')).toHaveLength(1));
    },
  );

  it('should keep an explicit trigger id inside Avatar, which re-provides the cascade', () => {
    render(
      <HoverCard data-testid='user-card'>
        <Avatar data-testid='user'>
          <AvatarFallback name='Ada Lovelace' />
          <AvatarContent>
            <AvatarName>
              <HoverCardTrigger data-testid='user-card--trigger'>
                <a href='#ada'>Ada Lovelace</a>
              </HoverCardTrigger>
            </AvatarName>
          </AvatarContent>
        </Avatar>
        <HoverCardContent>Body</HoverCardContent>
      </HoverCard>,
    );

    const trigger = screen.getByRole('link', { name: 'Ada Lovelace' });
    expect(trigger).toHaveAttribute('data-testid', 'user-card--trigger');
    expect(screen.queryByTestId('user--trigger')).toBeNull();
  });

  it('should keep an explicit trigger id inside AgentItem, which re-provides the cascade', () => {
    render(
      <HoverCard data-testid='agent-card'>
        <AgentItem agent='wally' data-testid='agent'>
          <AvatarContent>
            <AvatarName>
              <HoverCardTrigger data-testid='agent-card--trigger'>
                <a href='#wally'>Wally</a>
              </HoverCardTrigger>
            </AvatarName>
          </AvatarContent>
        </AgentItem>
        <HoverCardContent>Body</HoverCardContent>
      </HoverCard>,
    );

    const trigger = screen.getByRole('link', { name: 'Wally' });
    expect(trigger).toHaveAttribute('data-testid', 'agent-card--trigger');
    expect(screen.queryByTestId('agent--trigger')).toBeNull();
  });

  it('should render no data-testid without a root id', async () => {
    render(
      <HoverCard open onOpenChange={noop}>
        <HoverCardTrigger>
          <a href='#ada'>Ada Lovelace</a>
        </HoverCardTrigger>
        <HoverCardContent>
          <HoverCardHeader>
            <span>media</span>
            <HoverCardTitle>Ada Lovelace</HoverCardTitle>
            <HoverCardDescription>ada@example.com</HoverCardDescription>
          </HoverCardHeader>
          <HoverCardAction>Open profile</HoverCardAction>
        </HoverCardContent>
      </HoverCard>,
    );

    // The content is portaled, so search the whole body once it is mounted.
    await screen.findByRole('button', { name: 'Open profile' });
    expect(document.body.querySelector('[data-testid]')).toBeNull();
  });
});
