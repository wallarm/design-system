import { Settings } from '../../../icons';
import {
  NotificationCenter,
  NotificationCenterBody,
  NotificationCenterContent,
  NotificationCenterHeader,
  NotificationCenterHeaderAction,
  NotificationCenterHeaderActions,
  NotificationCenterItem,
  NotificationCenterItemDescription,
  NotificationCenterItemTime,
  NotificationCenterItemTitle,
  NotificationCenterList,
  NotificationCenterSkeleton,
  NotificationCenterTabs,
  NotificationCenterTabsList,
  NotificationCenterTitle,
  NotificationCenterTrigger,
} from '../../NotificationCenter';
import { NumericBadge } from '../../NumericBadge';
import { TabsContent, TabsTrigger } from '../../Tabs';

const MINUTE = 60_000;
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * MINUTE);

const NEW = [
  {
    id: 'attack',
    title: 'New attack detected on api.example.com',
    description: '214 SQL injection attempts from 12 IPs in the last 10 minutes.',
    createdAt: minutesAgo(3),
  },
  {
    id: 'node',
    title: 'Node wallarm-node-3 is offline',
    description: 'No heartbeat for 15 minutes. Traffic fails over to wallarm-node-1.',
    createdAt: minutesAgo(22),
  },
];

const READ = [
  {
    id: 'report',
    title: 'Weekly API discovery report is ready',
    description: '38 new endpoints this week, 5 of them handling sensitive data.',
    createdAt: minutesAgo(60 * 24 * 7),
  },
];

/** The host's inbox, as core-frontend's NotificationsInbox: bell with the unread count, New/Read tabs. */
export const NotificationsInbox = ({ loading = false }: { loading?: boolean }) => (
  <NotificationCenter data-testid='notifications'>
    <NotificationCenterTrigger count={loading ? 0 : NEW.length} />
    <NotificationCenterContent>
      <NotificationCenterHeader>
        <NotificationCenterTitle />
        <NotificationCenterHeaderActions>
          <NotificationCenterHeaderAction disabled={loading}>
            Mark all as read
          </NotificationCenterHeaderAction>
          <NotificationCenterHeaderAction asChild aria-label='Notification settings'>
            <a href='#notification-settings'>
              <Settings />
            </a>
          </NotificationCenterHeaderAction>
        </NotificationCenterHeaderActions>
      </NotificationCenterHeader>
      {loading ? (
        <NotificationCenterBody>
          <NotificationCenterSkeleton />
        </NotificationCenterBody>
      ) : (
        <NotificationCenterTabs defaultValue='new'>
          <NotificationCenterTabsList>
            <TabsTrigger value='new'>
              New <NumericBadge size='small'>{NEW.length}</NumericBadge>
            </TabsTrigger>
            <TabsTrigger value='read'>Read</TabsTrigger>
          </NotificationCenterTabsList>
          {[
            { value: 'new', items: NEW },
            { value: 'read', items: READ },
          ].map(tab => (
            <TabsContent key={tab.value} value={tab.value}>
              <NotificationCenterBody>
                <NotificationCenterList>
                  {tab.items.map(item => (
                    <NotificationCenterItem key={item.id} unread={tab.value === 'new'}>
                      <NotificationCenterItemTitle>{item.title}</NotificationCenterItemTitle>
                      <NotificationCenterItemTime value={item.createdAt} />
                      <NotificationCenterItemDescription>
                        {item.description}
                      </NotificationCenterItemDescription>
                    </NotificationCenterItem>
                  ))}
                </NotificationCenterList>
              </NotificationCenterBody>
            </TabsContent>
          ))}
        </NotificationCenterTabs>
      )}
    </NotificationCenterContent>
  </NotificationCenter>
);
