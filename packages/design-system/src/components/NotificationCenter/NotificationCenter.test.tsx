import type { MouseEvent } from 'react';
import { describe, expect, it, rs } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { formatCompactRelativeTime } from '../../utils/formatDateTime';
import { Button } from '../Button';
import { EmptyStateMessage, EmptyStateTitle } from '../EmptyState';
import { TabsContent, TabsTrigger } from '../Tabs';
import {
  NotificationCenter,
  NotificationCenterBody,
  NotificationCenterContent,
  NotificationCenterEmpty,
  NotificationCenterHeader,
  NotificationCenterHeaderAction,
  NotificationCenterHeaderActions,
  NotificationCenterItem,
  NotificationCenterItemActions,
  NotificationCenterItemDescription,
  NotificationCenterItemTime,
  NotificationCenterItemTitle,
  NotificationCenterList,
  NotificationCenterSkeleton,
  NotificationCenterTabs,
  NotificationCenterTabsList,
  NotificationCenterTitle,
  NotificationCenterTrigger,
} from './index';

interface RenderOptions {
  open?: boolean;
  count?: number;
  onOpenChange?: (open: boolean) => void;
  onTitleClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onActionClick?: () => void;
  onMarkAllRead?: () => void;
}

const renderInbox = ({
  open,
  count = 2,
  onOpenChange,
  onTitleClick,
  onActionClick,
  onMarkAllRead,
}: RenderOptions = {}) =>
  render(
    <NotificationCenter data-testid='nc' open={open} onOpenChange={onOpenChange}>
      <NotificationCenterTrigger count={count} data-analytics-id='inbox-open' />
      <NotificationCenterContent>
        <NotificationCenterHeader>
          <NotificationCenterTitle />
          <NotificationCenterHeaderActions>
            <NotificationCenterHeaderAction
              data-testid='mark-all'
              data-analytics-id='inbox-mark-all'
              onClick={onMarkAllRead}
            >
              Mark all as read
            </NotificationCenterHeaderAction>
            <NotificationCenterHeaderAction asChild aria-label='Notification settings'>
              <a href='/settings/notifications' data-analytics-id='inbox-settings'>
                Settings
              </a>
            </NotificationCenterHeaderAction>
          </NotificationCenterHeaderActions>
        </NotificationCenterHeader>
        <NotificationCenterTabs defaultValue='new'>
          <NotificationCenterTabsList>
            <TabsTrigger value='new'>New</TabsTrigger>
            <TabsTrigger value='read'>Read</TabsTrigger>
          </NotificationCenterTabsList>
          <TabsContent value='new'>
            <NotificationCenterBody>
              <NotificationCenterList>
                <NotificationCenterItem unread data-testid='nc--item-attack'>
                  <NotificationCenterItemTitle
                    data-analytics-id='inbox-item'
                    data-analytics-props='{"kind":"attack"}'
                    onClick={onTitleClick}
                  >
                    New attack detected on api.example.com
                  </NotificationCenterItemTitle>
                  <NotificationCenterItemTime value={new Date()} />
                  <NotificationCenterItemDescription>
                    SQL injection attempts from 12 IPs.
                  </NotificationCenterItemDescription>
                  <NotificationCenterItemActions>
                    <Button
                      size='small'
                      data-testid='approve'
                      data-analytics-id='inbox-approve'
                      onClick={onActionClick}
                    >
                      Approve
                    </Button>
                  </NotificationCenterItemActions>
                </NotificationCenterItem>
              </NotificationCenterList>
            </NotificationCenterBody>
          </TabsContent>
          <TabsContent value='read'>
            <NotificationCenterBody>
              <NotificationCenterList>
                <NotificationCenterItem data-testid='nc--item-node'>
                  <NotificationCenterItemTitle>
                    Node wallarm-node-2 is back online
                  </NotificationCenterItemTitle>
                  <NotificationCenterItemTime value={new Date()} />
                </NotificationCenterItem>
              </NotificationCenterList>
            </NotificationCenterBody>
          </TabsContent>
        </NotificationCenterTabs>
      </NotificationCenterContent>
    </NotificationCenter>,
  );

describe('NotificationCenterTrigger', () => {
  it('names the bell with the unread count and shows the badge', () => {
    renderInbox({ count: 9 });
    const trigger = screen.getByTestId('nc--trigger');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('aria-label', 'Notifications, 9 unread');
    expect(trigger).toHaveTextContent('9');
  });

  it('hides the badge at 0 and caps it at 99+', () => {
    const { unmount } = renderInbox({ count: 0 });
    expect(screen.getByTestId('nc--trigger')).toHaveAttribute('aria-label', 'Notifications');
    expect(screen.getByTestId('nc--trigger')).toHaveTextContent('');
    unmount();

    renderInbox({ count: 150 });
    expect(screen.getByTestId('nc--trigger')).toHaveTextContent('99+');
    expect(screen.getByTestId('nc--trigger')).toHaveAttribute(
      'aria-label',
      'Notifications, 150 unread',
    );
  });

  it('opens the popover labelled by the title', async () => {
    const onOpenChange = rs.fn();
    renderInbox({ onOpenChange });
    await userEvent.click(screen.getByTestId('nc--trigger'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    const content = await screen.findByTestId('nc--content');
    expect(content).toHaveAttribute('role', 'dialog');
    expect(content).toHaveAttribute('aria-labelledby', screen.getByTestId('nc--title').id);
  });
});

describe('NotificationCenterItemTitle', () => {
  it('fires onClick, then closes the popover', async () => {
    const onTitleClick = rs.fn();
    const onOpenChange = rs.fn();
    renderInbox({ onTitleClick, onOpenChange });
    await userEvent.click(screen.getByTestId('nc--trigger'));
    await userEvent.click(await screen.findByTestId('nc--item-attack--title'));
    expect(onTitleClick).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('stays open when the consumer calls preventDefault', async () => {
    const onOpenChange = rs.fn();
    const handleTitleClick = (event: MouseEvent<HTMLButtonElement>) => event.preventDefault();
    renderInbox({ onTitleClick: handleTitleClick, onOpenChange });
    await userEvent.click(screen.getByTestId('nc--trigger'));
    await userEvent.click(await screen.findByTestId('nc--item-attack--title'));
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.getByTestId('nc--content')).toBeInTheDocument();
  });

  it('prefixes the accessible name of unread items', () => {
    renderInbox({ open: true });
    expect(screen.getByTestId('nc--item-attack--title')).toHaveAccessibleName(
      'Unread, New attack detected on api.example.com',
    );
  });

  it('does not fire the title when an action is clicked', async () => {
    const onTitleClick = rs.fn();
    const onActionClick = rs.fn();
    renderInbox({ open: true, onTitleClick, onActionClick });
    await userEvent.click(screen.getByTestId('approve'));
    expect(onActionClick).toHaveBeenCalledTimes(1);
    expect(onTitleClick).not.toHaveBeenCalled();
  });
});

describe('Analytics', () => {
  it('forwards data-analytics-* to the real interactive nodes', () => {
    renderInbox({ open: true });
    expect(screen.getByTestId('nc--trigger')).toHaveAttribute('data-analytics-id', 'inbox-open');
    const markAll = screen.getByText('Mark all as read').closest('button');
    expect(markAll).toHaveAttribute('data-analytics-id', 'inbox-mark-all');
    const settings = screen.getByRole('link', { name: 'Notification settings' });
    expect(settings).toHaveAttribute('data-analytics-id', 'inbox-settings');
    const title = screen.getByTestId('nc--item-attack--title');
    expect(title.tagName).toBe('BUTTON');
    expect(title).toHaveAttribute('data-analytics-props', '{"kind":"attack"}');
  });

  it('resolves card and action clicks to their own ids', async () => {
    const spy = captureAnalyticsClicks();
    renderInbox({ open: true });
    await userEvent.click(screen.getByTestId('approve'));
    await userEvent.click(screen.getByTestId('nc--item-attack--title'));
    expect(spy.mock.calls.map(([id]) => id)).toEqual(['inbox-approve', 'inbox-item']);
  });

  it('keeps analytics attributes on the trigger across open and close', async () => {
    renderInbox();
    const trigger = screen.getByTestId('nc--trigger');
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByTestId('nc--content')).not.toBeInTheDocument());
    expect(trigger).toHaveAttribute('data-analytics-id', 'inbox-open');
  });
});

describe('Test ids', () => {
  it('cascades from the root', () => {
    renderInbox({ open: true });
    for (const id of [
      'nc--content',
      'nc--header',
      'nc--title',
      'nc--header-actions',
      'nc--tabs--list',
      'nc--tabs--content',
      'nc--body',
      'nc--list',
      'nc--item-attack',
      'nc--item-attack--time',
      'nc--item-attack--description',
      'nc--item-attack--actions',
    ]) {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    }
  });

  it('scopes the bell tooltip to the trigger, not the popover content', async () => {
    renderInbox();
    screen.getByTestId('nc--trigger').focus();
    expect(await screen.findByTestId('nc--trigger--content')).toHaveTextContent('Notifications');
    expect(screen.queryByTestId('nc--content')).not.toBeInTheDocument();
  });

  it('renders no derived test ids without a root test id', () => {
    const { baseElement } = render(
      <NotificationCenter open>
        <NotificationCenterTrigger />
        <NotificationCenterContent>
          <NotificationCenterTitle />
        </NotificationCenterContent>
      </NotificationCenter>,
    );
    expect(baseElement.querySelector('[data-testid]')).toBeNull();
  });
});

describe('Keyboard', () => {
  it('opens with Enter and closes with Escape, returning focus to the bell', async () => {
    renderInbox();
    const trigger = screen.getByTestId('nc--trigger');
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByTestId('nc--content')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByTestId('nc--content')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
});

describe('Controlled', () => {
  it('follows the open prop and reports Escape through onOpenChange', async () => {
    const onOpenChange = rs.fn();
    const { rerender } = renderInbox({ open: true, onOpenChange });
    expect(screen.getByTestId('nc--content')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByTestId('nc--content')).toBeInTheDocument();

    rerender(
      <NotificationCenter data-testid='nc' open={false}>
        <NotificationCenterTrigger />
        <NotificationCenterContent>
          <NotificationCenterTitle />
        </NotificationCenterContent>
      </NotificationCenter>,
    );
    await waitFor(() => expect(screen.queryByTestId('nc--content')).not.toBeInTheDocument());
  });
});

describe('NotificationCenterHeaderAction', () => {
  it('calls onClick for "Mark all as read"', async () => {
    const onMarkAllRead = rs.fn();
    renderInbox({ open: true, onMarkAllRead });
    await userEvent.click(screen.getByTestId('mark-all'));
    expect(onMarkAllRead).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', async () => {
    const onClick = rs.fn();
    render(
      <NotificationCenter open>
        <NotificationCenterContent>
          <NotificationCenterHeaderAction data-testid='mark-all' disabled onClick={onClick}>
            Mark all as read
          </NotificationCenterHeaderAction>
        </NotificationCenterContent>
      </NotificationCenter>,
    );
    await userEvent.click(screen.getByTestId('mark-all'));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('NotificationCenterTabs', () => {
  it('switches from New to Read', async () => {
    renderInbox({ open: true });
    expect(screen.getByTestId('nc--item-attack')).toBeVisible();
    await userEvent.click(screen.getByRole('tab', { name: 'Read' }));
    expect(screen.getByRole('tab', { name: 'Read' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('nc--item-node')).toBeVisible();
    await waitFor(() => expect(screen.queryByTestId('nc--item-attack')).not.toBeInTheDocument());
  });
});

describe('NotificationCenterItem', () => {
  it('marks unread items and shows their dot', () => {
    renderInbox({ open: true });
    const unreadTime = screen.getByTestId('nc--item-attack--time');
    expect(screen.getByTestId('nc--item-attack')).toHaveAttribute('data-unread', 'true');
    expect(unreadTime.tagName).toBe('TIME');
    expect(unreadTime.querySelector('[aria-hidden]')).not.toBeNull();
    expect(unreadTime).toHaveTextContent('now');
  });

  it('leaves read items unmarked, without the dot or the Unread prefix', async () => {
    renderInbox({ open: true });
    await userEvent.click(screen.getByRole('tab', { name: 'Read' }));
    const item = screen.getByTestId('nc--item-node');
    expect(item).not.toHaveAttribute('data-unread');
    expect(screen.getByTestId('nc--item-node--time').querySelector('[aria-hidden]')).toBeNull();
    expect(screen.getByTestId('nc--item-node--title')).toHaveAccessibleName(
      'Node wallarm-node-2 is back online',
    );
  });

  it('sets an ISO dateTime, and none for an invalid value', () => {
    const value = new Date('2026-06-15T12:00:00Z');
    render(
      <NotificationCenter open data-testid='nc'>
        <NotificationCenterContent>
          <NotificationCenterList>
            <NotificationCenterItem data-testid='nc--ok'>
              <NotificationCenterItemTime value={value} />
            </NotificationCenterItem>
            <NotificationCenterItem data-testid='nc--bad'>
              <NotificationCenterItemTime value='nope' />
            </NotificationCenterItem>
          </NotificationCenterList>
        </NotificationCenterContent>
      </NotificationCenter>,
    );
    expect(screen.getByTestId('nc--ok--time')).toHaveAttribute('dateTime', value.toISOString());
    expect(screen.getByTestId('nc--bad--time')).not.toHaveAttribute('dateTime');
    expect(screen.getByTestId('nc--bad--time')).toHaveTextContent('—');
  });
});

describe('Empty and loading', () => {
  it('renders the empty state in the body', () => {
    render(
      <NotificationCenter open data-testid='nc'>
        <NotificationCenterContent>
          <NotificationCenterBody>
            <NotificationCenterEmpty>
              <EmptyStateMessage>
                <EmptyStateTitle>You're all caught up</EmptyStateTitle>
              </EmptyStateMessage>
            </NotificationCenterEmpty>
          </NotificationCenterBody>
        </NotificationCenterContent>
      </NotificationCenter>,
    );
    expect(screen.getByTestId('nc--empty')).toHaveTextContent("You're all caught up");
  });

  it('renders busy placeholder rows while loading', () => {
    render(
      <NotificationCenter open data-testid='nc'>
        <NotificationCenterContent>
          <NotificationCenterBody>
            <NotificationCenterSkeleton rows={3} />
          </NotificationCenterBody>
        </NotificationCenterContent>
      </NotificationCenter>,
    );
    const skeleton = screen.getByTestId('nc--skeleton');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
    expect(skeleton.children).toHaveLength(3);
  });
});

describe('Analytics (more)', () => {
  it('forwards data-analytics-id to an asChild title link', () => {
    render(
      <NotificationCenter open>
        <NotificationCenterContent>
          <NotificationCenterList>
            <NotificationCenterItem>
              <NotificationCenterItemTitle asChild>
                <a href='/attacks' data-analytics-id='inbox-item-link'>
                  New attack
                </a>
              </NotificationCenterItemTitle>
            </NotificationCenterItem>
          </NotificationCenterList>
        </NotificationCenterContent>
      </NotificationCenter>,
    );
    const link = screen.getByRole('link', { name: 'New attack' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('data-analytics-id', 'inbox-item-link');
  });

  it('does not strand the title id on the non-clickable item, list or body (negative)', () => {
    renderInbox({ open: true });
    for (const id of ['nc--item-attack', 'nc--list', 'nc--body', 'nc--content']) {
      expect(screen.getByTestId(id)).not.toHaveAttribute('data-analytics-id');
    }
  });

  it('keeps the title analytics attributes across a tab switch', async () => {
    renderInbox({ open: true });
    await userEvent.click(screen.getByRole('tab', { name: 'Read' }));
    await userEvent.click(screen.getByRole('tab', { name: 'New' }));
    expect(screen.getByTestId('nc--item-attack--title')).toHaveAttribute(
      'data-analytics-id',
      'inbox-item',
    );
  });
});

describe('formatCompactRelativeTime', () => {
  const now = new Date('2026-06-15T12:00:00Z');
  const ago = (ms: number) => new Date(now.getTime() - ms);
  const MIN = 60_000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;

  it.each([
    [59_000, 'now'],
    [-5 * MIN, 'now'],
    [3 * MIN, '3m'],
    [59 * MIN, '59m'],
    [23 * HOUR, '23h'],
    [6 * DAY, '6d'],
    [7 * DAY, '1w'],
    [27 * DAY, '3w'],
    [40 * DAY, '6 May'],
    [400 * DAY, '11 May, 2025'],
  ])('%i ms ago → %s', (ms, expected) => {
    expect(formatCompactRelativeTime(ago(ms), now)).toBe(expected);
  });

  it('returns an em dash for an invalid date', () => {
    expect(formatCompactRelativeTime(new Date('nope'), now)).toBe('—');
  });
});
