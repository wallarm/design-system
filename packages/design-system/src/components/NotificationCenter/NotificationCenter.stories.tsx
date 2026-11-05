import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { CheckCheck, History, Settings, TriangleAlert } from '../../icons';
import { AppShell } from '../AppShell/AppShell';
import { AppShellHeader } from '../AppShell/AppShellHeader';
import { QuickHelpDropdown, WallarmLogo } from '../AppShell/story-content';
import { Button } from '../Button';
import { ChatTrigger } from '../Chat';
import {
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIllustration,
  EmptyStateMessage,
  EmptyStateTitle,
} from '../EmptyState';
import { NumericBadge } from '../NumericBadge';
import { TabsContent, TabsTrigger } from '../Tabs';
import { TopHeader, TopHeaderActions, TopHeaderLogo, TopHeaderSeparator } from '../TopHeader';
import { NotificationCenter } from './NotificationCenter';
import {
  NotificationCenterBody,
  NotificationCenterEmpty,
  NotificationCenterSkeleton,
} from './NotificationCenterBody';
import { NotificationCenterContent } from './NotificationCenterContent';
import {
  NotificationCenterHeader,
  NotificationCenterHeaderAction,
  NotificationCenterHeaderActions,
  NotificationCenterTitle,
} from './NotificationCenterHeader';
import {
  NotificationCenterItem,
  NotificationCenterItemActions,
  NotificationCenterItemDescription,
  NotificationCenterList,
} from './NotificationCenterItem';
import { NotificationCenterItemTime } from './NotificationCenterItemTime';
import { NotificationCenterItemTitle } from './NotificationCenterItemTitle';
import { NotificationCenterTabs, NotificationCenterTabsList } from './NotificationCenterTabs';
import { NotificationCenterTrigger } from './NotificationCenterTrigger';

const DESCRIPTION = [
  'The in-app notification inbox the bell in the top header opens: unread count on the bell, New and Read tabs, and a list where each card is one click target with its own action buttons.',
  'It is composition only — the app owns the data, decides when an item counts as read, and picks what each body shows: a list, `NotificationCenterSkeleton` while loading, or `NotificationCenterEmpty` for the empty and error states.',
].join(' ');

const meta = {
  title: 'Overlay/NotificationCenter',
  component: NotificationCenter,
  subcomponents: {
    NotificationCenterTrigger,
    NotificationCenterContent,
    NotificationCenterHeader,
    NotificationCenterTitle,
    NotificationCenterHeaderActions,
    NotificationCenterHeaderAction,
    NotificationCenterTabs,
    NotificationCenterTabsList,
    NotificationCenterBody,
    NotificationCenterList,
    NotificationCenterItem,
    NotificationCenterItemTitle,
    NotificationCenterItemTime,
    NotificationCenterItemDescription,
    NotificationCenterItemActions,
    NotificationCenterEmpty,
    NotificationCenterSkeleton,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof NotificationCenter>;

export default meta;

const MINUTE = 60_000;
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * MINUTE);

/**
 * The four kinds of notification are plain composition: two actions for a decision, one call to
 * action for triage and digests, none for an FYI. `data-analytics-id` goes on the title and on
 * each action button.
 */
export const Basic: StoryFn<typeof meta> = () => (
  <div className='flex h-[720px] justify-end'>
    <NotificationCenter data-testid='notification-center'>
      <NotificationCenterTrigger count={5} data-analytics-id='notifications-open' />
      <NotificationCenterContent>
        <NotificationCenterHeader>
          <NotificationCenterTitle />
          <NotificationCenterHeaderActions>
            <NotificationCenterHeaderAction data-analytics-id='notifications-mark-all-read'>
              Mark all as read
            </NotificationCenterHeaderAction>
            <NotificationCenterHeaderAction asChild aria-label='Notification settings'>
              <a href='#notification-settings'>
                <Settings />
              </a>
            </NotificationCenterHeaderAction>
          </NotificationCenterHeaderActions>
        </NotificationCenterHeader>
        <NotificationCenterTabs defaultValue='new'>
          <NotificationCenterTabsList>
            <TabsTrigger value='new'>
              New <NumericBadge size='small'>5</NumericBadge>
            </TabsTrigger>
            <TabsTrigger value='read'>Read</TabsTrigger>
          </NotificationCenterTabsList>
          <TabsContent value='new'>
            <NotificationCenterBody>
              <NotificationCenterList>
                <NotificationCenterItem unread data-testid='notification-center--item-patch'>
                  <NotificationCenterItemTitle data-analytics-id='notification-open'>
                    Apply a virtual patch to api.example.com?
                  </NotificationCenterItemTitle>
                  <NotificationCenterItemTime value={minutesAgo(3)} />
                  <NotificationCenterItemDescription>
                    Wally drafted a patch for the SQL injection on POST /v1/orders. It blocks the
                    payload without touching the code.
                  </NotificationCenterItemDescription>
                  <NotificationCenterItemActions>
                    <Button size='small' data-analytics-id='notification-patch-approve'>
                      Approve
                    </Button>
                    <Button
                      size='small'
                      variant='outline'
                      color='neutral'
                      data-analytics-id='notification-patch-reject'
                    >
                      Reject
                    </Button>
                  </NotificationCenterItemActions>
                </NotificationCenterItem>
                <NotificationCenterItem unread>
                  <NotificationCenterItemTitle data-analytics-id='notification-open'>
                    New attack detected on api.example.com
                  </NotificationCenterItemTitle>
                  <NotificationCenterItemTime value={minutesAgo(9)} />
                  <NotificationCenterItemDescription>
                    214 SQL injection attempts from 12 IPs in the last 10 minutes.
                  </NotificationCenterItemDescription>
                  <NotificationCenterItemActions>
                    <Button size='small' data-analytics-id='notification-view-attacks'>
                      View attacks
                    </Button>
                  </NotificationCenterItemActions>
                </NotificationCenterItem>
                <NotificationCenterItem unread>
                  <NotificationCenterItemTitle data-analytics-id='notification-open'>
                    Node wallarm-node-3 is offline
                  </NotificationCenterItemTitle>
                  <NotificationCenterItemTime value={minutesAgo(22)} />
                  <NotificationCenterItemDescription>
                    No heartbeat for 15 minutes. Traffic fails over to wallarm-node-1.
                  </NotificationCenterItemDescription>
                </NotificationCenterItem>
                <NotificationCenterItem unread>
                  <NotificationCenterItemTitle data-analytics-id='notification-open'>
                    Filtering rules updated
                  </NotificationCenterItemTitle>
                  <NotificationCenterItemTime value={minutesAgo(60)} />
                  <NotificationCenterItemDescription>
                    All nodes picked up the latest rule set. Nothing to do.
                  </NotificationCenterItemDescription>
                </NotificationCenterItem>
                <NotificationCenterItem unread>
                  <NotificationCenterItemTitle data-analytics-id='notification-open'>
                    Weekly API discovery report is ready
                  </NotificationCenterItemTitle>
                  <NotificationCenterItemTime value={minutesAgo(120)} />
                  <NotificationCenterItemDescription>
                    38 new endpoints this week, 5 of them handling sensitive data.
                  </NotificationCenterItemDescription>
                  <NotificationCenterItemActions>
                    <Button size='small' data-analytics-id='notification-view-report'>
                      View report
                    </Button>
                  </NotificationCenterItemActions>
                </NotificationCenterItem>
              </NotificationCenterList>
            </NotificationCenterBody>
          </TabsContent>
          <TabsContent value='read'>
            <NotificationCenterBody>
              <NotificationCenterList>
                <NotificationCenterItem>
                  <NotificationCenterItemTitle>
                    Node wallarm-node-2 is back online
                  </NotificationCenterItemTitle>
                  <NotificationCenterItemTime value={minutesAgo(60 * 24)} />
                  <NotificationCenterItemDescription>
                    The node reconnected and is filtering traffic again.
                  </NotificationCenterItemDescription>
                </NotificationCenterItem>
              </NotificationCenterList>
            </NotificationCenterBody>
          </TabsContent>
        </NotificationCenterTabs>
      </NotificationCenterContent>
    </NotificationCenter>
  </div>
);

/**
 * Read items drop the dot and show their age; the tab opens on Read here through `defaultValue`.
 */
export const ReadTab: StoryFn<typeof meta> = () => (
  <div className='flex h-[720px] justify-end'>
    <NotificationCenter data-testid='notification-center'>
      <NotificationCenterTrigger />
      <NotificationCenterContent>
        <NotificationCenterHeader>
          <NotificationCenterTitle />
          <NotificationCenterHeaderActions>
            <NotificationCenterHeaderAction disabled>
              Mark all as read
            </NotificationCenterHeaderAction>
            <NotificationCenterHeaderAction asChild aria-label='Notification settings'>
              <a href='#notification-settings'>
                <Settings />
              </a>
            </NotificationCenterHeaderAction>
          </NotificationCenterHeaderActions>
        </NotificationCenterHeader>
        <NotificationCenterTabs defaultValue='read'>
          <NotificationCenterTabsList>
            <TabsTrigger value='new'>New</TabsTrigger>
            <TabsTrigger value='read'>Read</TabsTrigger>
          </NotificationCenterTabsList>
          <TabsContent value='read'>
            <NotificationCenterBody>
              <NotificationCenterList>
                <NotificationCenterItem>
                  <NotificationCenterItemTitle>
                    Apply a virtual patch to api.example.com?
                  </NotificationCenterItemTitle>
                  <NotificationCenterItemTime value={minutesAgo(60 * 24)} />
                  <NotificationCenterItemDescription>
                    Approved. The patch is live on all nodes.
                  </NotificationCenterItemDescription>
                </NotificationCenterItem>
                <NotificationCenterItem>
                  <NotificationCenterItemTitle>
                    New attack detected on api.example.com
                  </NotificationCenterItemTitle>
                  <NotificationCenterItemTime value={minutesAgo(60 * 24 * 2)} />
                  <NotificationCenterItemDescription>
                    214 SQL injection attempts from 12 IPs in the last 10 minutes.
                  </NotificationCenterItemDescription>
                </NotificationCenterItem>
                <NotificationCenterItem>
                  <NotificationCenterItemTitle>
                    Node wallarm-node-3 is offline
                  </NotificationCenterItemTitle>
                  <NotificationCenterItemTime value={minutesAgo(60 * 24 * 3)} />
                  <NotificationCenterItemDescription>
                    No heartbeat for 15 minutes. Traffic fails over to wallarm-node-1.
                  </NotificationCenterItemDescription>
                </NotificationCenterItem>
                <NotificationCenterItem>
                  <NotificationCenterItemTitle>
                    Weekly API discovery report is ready
                  </NotificationCenterItemTitle>
                  <NotificationCenterItemTime value={minutesAgo(60 * 24 * 7)} />
                  <NotificationCenterItemDescription>
                    38 new endpoints this week, 5 of them handling sensitive data.
                  </NotificationCenterItemDescription>
                </NotificationCenterItem>
              </NotificationCenterList>
            </NotificationCenterBody>
          </TabsContent>
        </NotificationCenterTabs>
      </NotificationCenterContent>
    </NotificationCenter>
  </div>
);

/**
 * Each tab has its own empty state, built from `EmptyState` parts. "Mark all as read" is disabled
 * by the app when nothing is unread.
 */
export const Empty: StoryFn<typeof meta> = () => (
  <div className='flex h-[400px] justify-end'>
    <NotificationCenter data-testid='notification-center'>
      <NotificationCenterTrigger />
      <NotificationCenterContent>
        <NotificationCenterHeader>
          <NotificationCenterTitle />
          <NotificationCenterHeaderActions>
            <NotificationCenterHeaderAction disabled>
              Mark all as read
            </NotificationCenterHeaderAction>
            <NotificationCenterHeaderAction asChild aria-label='Notification settings'>
              <a href='#notification-settings'>
                <Settings />
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
              <NotificationCenterEmpty>
                <EmptyStateIllustration>
                  <CheckCheck size='lg' />
                </EmptyStateIllustration>
                <EmptyStateMessage>
                  <EmptyStateTitle>You're all caught up</EmptyStateTitle>
                  <EmptyStateDescription>No new notifications.</EmptyStateDescription>
                </EmptyStateMessage>
              </NotificationCenterEmpty>
            </NotificationCenterBody>
          </TabsContent>
          <TabsContent value='read'>
            <NotificationCenterBody>
              <NotificationCenterEmpty>
                <EmptyStateIllustration>
                  <History size='lg' />
                </EmptyStateIllustration>
                <EmptyStateMessage>
                  <EmptyStateTitle>Nothing read yet</EmptyStateTitle>
                  <EmptyStateDescription>
                    Notifications you've read will show up here.
                  </EmptyStateDescription>
                </EmptyStateMessage>
              </NotificationCenterEmpty>
            </NotificationCenterBody>
          </TabsContent>
        </NotificationCenterTabs>
      </NotificationCenterContent>
    </NotificationCenter>
  </div>
);

/**
 * While the inbox loads, the body shows placeholder rows and the bell has no badge yet.
 */
export const Loading: StoryFn<typeof meta> = () => (
  <div className='flex h-[400px] justify-end'>
    <NotificationCenter data-testid='notification-center'>
      <NotificationCenterTrigger />
      <NotificationCenterContent>
        <NotificationCenterHeader>
          <NotificationCenterTitle />
        </NotificationCenterHeader>
        <NotificationCenterBody>
          <NotificationCenterSkeleton />
        </NotificationCenterBody>
      </NotificationCenterContent>
    </NotificationCenter>
  </div>
);

/**
 * A failed load reuses `NotificationCenterEmpty` with a retry button. Tabs are optional: here the
 * body sits straight under the header.
 */
export const ErrorState: StoryFn<typeof meta> = () => (
  <div className='flex h-[400px] justify-end'>
    <NotificationCenter data-testid='notification-center'>
      <NotificationCenterTrigger />
      <NotificationCenterContent>
        <NotificationCenterHeader>
          <NotificationCenterTitle />
        </NotificationCenterHeader>
        <NotificationCenterBody>
          <NotificationCenterEmpty>
            <EmptyStateIllustration>
              <TriangleAlert size='lg' />
            </EmptyStateIllustration>
            <EmptyStateMessage>
              <EmptyStateTitle>Couldn't load notifications</EmptyStateTitle>
              <EmptyStateDescription>
                Something went wrong. Refresh the page or try again later.
              </EmptyStateDescription>
            </EmptyStateMessage>
            <EmptyStateActions>
              <Button variant='outline' color='neutral' data-analytics-id='notifications-retry'>
                Try again
              </Button>
            </EmptyStateActions>
          </NotificationCenterEmpty>
        </NotificationCenterBody>
      </NotificationCenterContent>
    </NotificationCenter>
  </div>
);

const MANY_NOTIFICATIONS = Array.from({ length: 24 }, (_, index) => ({
  id: `node-${index}`,
  title: `Node wallarm-node-${index + 1} is offline`,
  description: 'No heartbeat for 15 minutes. Traffic fails over to the remaining nodes.',
  createdAt: minutesAgo(index * 37 + 1),
}));

/**
 * Past 640px the list scrolls inside the body while the header and tabs stay put.
 */
export const ManyItems: StoryFn<typeof meta> = () => (
  <div className='flex h-[720px] justify-end'>
    <NotificationCenter data-testid='notification-center'>
      <NotificationCenterTrigger count={MANY_NOTIFICATIONS.length} />
      <NotificationCenterContent>
        <NotificationCenterHeader>
          <NotificationCenterTitle />
          <NotificationCenterHeaderActions>
            <NotificationCenterHeaderAction>Mark all as read</NotificationCenterHeaderAction>
          </NotificationCenterHeaderActions>
        </NotificationCenterHeader>
        <NotificationCenterTabs defaultValue='new'>
          <NotificationCenterTabsList>
            <TabsTrigger value='new'>
              New <NumericBadge size='small'>{MANY_NOTIFICATIONS.length}</NumericBadge>
            </TabsTrigger>
            <TabsTrigger value='read'>Read</TabsTrigger>
          </NotificationCenterTabsList>
          <TabsContent value='new'>
            <NotificationCenterBody>
              <NotificationCenterList>
                {MANY_NOTIFICATIONS.map(notification => (
                  <NotificationCenterItem key={notification.id} unread>
                    <NotificationCenterItemTitle>{notification.title}</NotificationCenterItemTitle>
                    <NotificationCenterItemTime value={notification.createdAt} />
                    <NotificationCenterItemDescription>
                      {notification.description}
                    </NotificationCenterItemDescription>
                  </NotificationCenterItem>
                ))}
              </NotificationCenterList>
            </NotificationCenterBody>
          </TabsContent>
        </NotificationCenterTabs>
      </NotificationCenterContent>
    </NotificationCenter>
  </div>
);

/**
 * Where it lives: the bell in the shell's top header, between the AI Assistant toggle and Quick
 * help, opening right-aligned under the button.
 */
export const InTopHeader: StoryFn<typeof meta> = () => (
  <AppShell ambient={false} className='h-[720px]'>
    <AppShellHeader>
      <TopHeader>
        <TopHeaderLogo href='/'>
          <WallarmLogo />
        </TopHeaderLogo>
        <TopHeaderActions>
          <Button variant='ghost' size='small' color='neutral'>
            Tenant Name
          </Button>
          <TopHeaderSeparator />
          <ChatTrigger />
          <NotificationCenter data-testid='notification-center'>
            <NotificationCenterTrigger count={2} />
            <NotificationCenterContent>
              <NotificationCenterHeader>
                <NotificationCenterTitle />
                <NotificationCenterHeaderActions>
                  <NotificationCenterHeaderAction>Mark all as read</NotificationCenterHeaderAction>
                  <NotificationCenterHeaderAction asChild aria-label='Notification settings'>
                    <a href='#notification-settings'>
                      <Settings />
                    </a>
                  </NotificationCenterHeaderAction>
                </NotificationCenterHeaderActions>
              </NotificationCenterHeader>
              <NotificationCenterTabs defaultValue='new'>
                <NotificationCenterTabsList>
                  <TabsTrigger value='new'>
                    New <NumericBadge size='small'>2</NumericBadge>
                  </TabsTrigger>
                  <TabsTrigger value='read'>Read</TabsTrigger>
                </NotificationCenterTabsList>
                <TabsContent value='new'>
                  <NotificationCenterBody>
                    <NotificationCenterList>
                      <NotificationCenterItem unread>
                        <NotificationCenterItemTitle>
                          New attack detected on api.example.com
                        </NotificationCenterItemTitle>
                        <NotificationCenterItemTime value={minutesAgo(3)} />
                        <NotificationCenterItemDescription>
                          214 SQL injection attempts from 12 IPs in the last 10 minutes.
                        </NotificationCenterItemDescription>
                        <NotificationCenterItemActions>
                          <Button size='small'>View attacks</Button>
                        </NotificationCenterItemActions>
                      </NotificationCenterItem>
                      <NotificationCenterItem unread>
                        <NotificationCenterItemTitle>
                          Node wallarm-node-3 is offline
                        </NotificationCenterItemTitle>
                        <NotificationCenterItemTime value={minutesAgo(22)} />
                        <NotificationCenterItemDescription>
                          No heartbeat for 15 minutes. Traffic fails over to wallarm-node-1.
                        </NotificationCenterItemDescription>
                      </NotificationCenterItem>
                    </NotificationCenterList>
                  </NotificationCenterBody>
                </TabsContent>
                <TabsContent value='read'>
                  <NotificationCenterBody>
                    <NotificationCenterList>
                      <NotificationCenterItem>
                        <NotificationCenterItemTitle>
                          Weekly API discovery report is ready
                        </NotificationCenterItemTitle>
                        <NotificationCenterItemTime value={minutesAgo(60 * 24 * 7)} />
                        <NotificationCenterItemDescription>
                          38 new endpoints this week, 5 of them handling sensitive data.
                        </NotificationCenterItemDescription>
                      </NotificationCenterItem>
                    </NotificationCenterList>
                  </NotificationCenterBody>
                </TabsContent>
              </NotificationCenterTabs>
            </NotificationCenterContent>
          </NotificationCenter>
          <QuickHelpDropdown />
        </TopHeaderActions>
      </TopHeader>
    </AppShellHeader>
  </AppShell>
);

InTopHeader.parameters = { layout: 'fullscreen' };

/**
 * Controlled open state: the app can close the inbox itself, for example after navigating.
 */
export const Controlled: StoryFn<typeof meta> = () => {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(true);

  const handleMarkAllRead = () => setUnread(false);
  const handleItemClick = () => setUnread(false);

  return (
    <div className='flex h-[400px] justify-end'>
      <NotificationCenter data-testid='notification-center' open={open} onOpenChange={setOpen}>
        <NotificationCenterTrigger count={unread ? 1 : 0} />
        <NotificationCenterContent>
          <NotificationCenterHeader>
            <NotificationCenterTitle />
            <NotificationCenterHeaderActions>
              <NotificationCenterHeaderAction disabled={!unread} onClick={handleMarkAllRead}>
                Mark all as read
              </NotificationCenterHeaderAction>
            </NotificationCenterHeaderActions>
          </NotificationCenterHeader>
          <NotificationCenterBody>
            <NotificationCenterList>
              <NotificationCenterItem unread={unread}>
                <NotificationCenterItemTitle onClick={handleItemClick}>
                  Weekly API discovery report is ready
                </NotificationCenterItemTitle>
                <NotificationCenterItemTime value={minutesAgo(120)} />
                <NotificationCenterItemDescription>
                  38 new endpoints this week, 5 of them handling sensitive data.
                </NotificationCenterItemDescription>
              </NotificationCenterItem>
            </NotificationCenterList>
          </NotificationCenterBody>
        </NotificationCenterContent>
      </NotificationCenter>
    </div>
  );
};
