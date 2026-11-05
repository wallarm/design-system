import type { MouseEvent } from 'react';
import { describe, expect, it, rs } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { formatCompactRelativeTime } from '../../utils/formatDateTime';
import { Button } from '../Button';
import { TabsContent, TabsTrigger } from '../Tabs';
import {
  NotificationCenter,
  NotificationCenterBody,
  NotificationCenterContent,
  NotificationCenterHeader,
  NotificationCenterHeaderAction,
  NotificationCenterHeaderActions,
  NotificationCenterItem,
  NotificationCenterItemActions,
  NotificationCenterItemDescription,
  NotificationCenterItemTime,
  NotificationCenterItemTitle,
  NotificationCenterList,
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
}

const renderInbox = ({
  open,
  count = 2,
  onOpenChange,
  onTitleClick,
  onActionClick,
}: RenderOptions = {}) =>
  render(
    <NotificationCenter data-testid='nc' open={open} onOpenChange={onOpenChange}>
      <NotificationCenterTrigger count={count} data-analytics-id='inbox-open' />
      <NotificationCenterContent>
        <NotificationCenterHeader>
          <NotificationCenterTitle />
          <NotificationCenterHeaderActions>
            <NotificationCenterHeaderAction data-analytics-id='inbox-mark-all'>
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
          <TabsContent value='read'>Read items</TabsContent>
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
