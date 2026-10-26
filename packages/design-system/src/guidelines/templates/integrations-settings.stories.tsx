import { type ChangeEvent, type FC, type FormEvent, type MouseEvent, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { fn } from 'storybook/test';
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '../../components/Alert';
import { AppShell, AppShellHeader, AppShellRail, AppShellRemote } from '../../components/AppShell';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { ChatTrigger } from '../../components/Chat';
import {
  Checkbox,
  CheckboxDescription,
  CheckboxGroup,
  CheckboxIndicator,
  CheckboxLabel,
} from '../../components/Checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/Dialog';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '../../components/Drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemText,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIllustration,
  EmptyStateMessage,
  EmptyStateTitle,
} from '../../components/EmptyState';
import { Field, FieldIndicator, FieldLabel } from '../../components/Field';
import { FormatDateTime } from '../../components/FormatDateTime';
import { Input } from '../../components/Input';
import { Logo } from '../../components/Logo';
import {
  NavRail,
  NavRailBody,
  NavRailFooter,
  NavRailItem,
  NavRailSeparator,
} from '../../components/NavRail';
import { NotificationCenter, NotificationCenterTrigger } from '../../components/NotificationCenter';
import { NumericBadge } from '../../components/NumericBadge';
import { OverflowList } from '../../components/OverflowList';
import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderGroup,
  PageTitle,
  PageToolbar,
} from '../../components/Page';
import {
  type NavConfig,
  RemoteShell,
  RemoteShellBreadcrumb,
  RemoteShellContent,
  RemoteShellPanel,
} from '../../components/RemoteShell';
import { SearchInput } from '../../components/SearchInput';
import {
  SegmentedTabs,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from '../../components/SegmentedTabs';
import {
  createListCollection,
  Select,
  SelectContent,
  SelectInput,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
} from '../../components/Select';
import { HStack, VStack } from '../../components/Stack';
import { Switch, SwitchControl, SwitchLabel } from '../../components/Switch';
import type { TableCellContext, TableColumnDef, TableRow } from '../../components/Table';
import { Table, TableEmptyState } from '../../components/Table';
import { Tag } from '../../components/Tag';
import { Text } from '../../components/Text';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '../../components/Timeline';
import { useToast } from '../../components/Toast';
import {
  TopHeader,
  TopHeaderActions,
  TopHeaderLogo,
  TopHeaderSeparator,
} from '../../components/TopHeader';
import {
  Bot,
  Bug,
  ChevronUpDown,
  CircleHelp,
  Cloud,
  Database,
  Discord,
  Ellipsis,
  FilterX,
  FlaskConical,
  History,
  Home as HomeIcon,
  KeyRound,
  Mail,
  Pencil,
  Phone,
  Plug,
  ScrollText,
  Search,
  SearchX,
  Server,
  Settings,
  Slack,
  type SvgIconProps,
  Teams,
  Telegram,
  Unplug,
  User,
  Users,
  Webhook,
  Zap,
} from '../../icons';

type IntegrationStatus = 'connected' | 'attention' | 'failed' | 'disconnected';
type EventKind = 'attacks' | 'incidents' | 'vulnerabilities' | 'system';
type StatusTab = 'all' | 'connected' | 'issues' | 'disconnected';

interface Integration {
  id: string;
  provider: string;
  icon: FC<SvgIconProps>;
  category: string;
  name: string;
  destinationLabel: string;
  destination: string;
  status: IntegrationStatus;
  events: EventKind[];
  severity: string;
  lastDelivery: string | null;
  notify: boolean;
}

interface Draft {
  name: string;
  destination: string;
  events: string[];
  severity: string;
}

// The host's product list (from the microfrontends API in a real app).
const PRODUCTS = [
  { id: 'edge', label: 'Edge', icon: Cloud, shortcut: ['G', 'E'] },
  { id: 'security-testing', label: 'Security Testing', icon: FlaskConical, shortcut: ['G', 'T'] },
  { id: 'ai-hypervisor', label: 'AI Hypervisor', icon: Bot, shortcut: ['G', 'A'] },
];

// Settings is a host route with its own NavConfig; Integrations is one of its pages.
const SETTINGS_NAV: NavConfig = {
  productLabel: 'Settings',
  productPath: '/settings',
  items: [
    { type: 'link', id: 'profile', label: 'Profile', path: 'profile', icon: User },
    { type: 'link', id: 'general', label: 'General', path: 'general', icon: Settings },
    { type: 'section-header', id: 'team', label: 'Team & access' },
    { type: 'link', id: 'users', label: 'Users', path: 'users', icon: Users },
    { type: 'link', id: 'api-tokens', label: 'API tokens', path: 'api-tokens', icon: KeyRound },
    { type: 'section-header', id: 'platform', label: 'Platform' },
    { type: 'link', id: 'integrations', label: 'Integrations', path: 'integrations', icon: Plug },
    { type: 'link', id: 'audit-log', label: 'Audit log', path: 'audit-log', icon: ScrollText },
  ],
};

const PATHNAME = '/settings/integrations';

const INTEGRATIONS: Integration[] = [
  {
    id: 'int-slack',
    provider: 'Slack',
    icon: Slack,
    category: 'Messaging',
    name: 'SOC alerts',
    destinationLabel: 'Channel',
    destination: '#soc-alerts',
    status: 'connected',
    events: ['attacks', 'incidents', 'vulnerabilities'],
    severity: 'medium',
    lastDelivery: '2026-11-06T08:42:00',
    notify: true,
  },
  {
    id: 'int-pagerduty',
    provider: 'PagerDuty',
    icon: Phone,
    category: 'On-call',
    name: 'API edge on-call',
    destinationLabel: 'Integration key',
    destination: 'R0ZBD7XKQ2M4P9EXAMPLE',
    status: 'connected',
    events: ['incidents'],
    severity: 'critical',
    lastDelivery: '2026-11-05T23:17:00',
    notify: true,
  },
  {
    id: 'int-jira',
    provider: 'Jira',
    icon: Bug,
    category: 'Ticketing',
    name: 'Vulnerability triage',
    destinationLabel: 'Project key',
    destination: 'SEC',
    status: 'attention',
    events: ['vulnerabilities'],
    severity: 'high',
    lastDelivery: '2026-11-04T10:05:00',
    notify: true,
  },
  {
    id: 'int-splunk',
    provider: 'Splunk',
    icon: Database,
    category: 'SIEM',
    name: 'SIEM ingest',
    destinationLabel: 'HEC endpoint',
    destination: 'https://splunk.shop-demo.io:8088/services/collector',
    status: 'failed',
    events: ['attacks', 'incidents', 'system'],
    severity: 'low',
    lastDelivery: '2026-11-02T14:30:00',
    notify: true,
  },
  {
    id: 'int-webhook',
    provider: 'Webhook',
    icon: Webhook,
    category: 'Custom',
    name: 'Ticket router',
    destinationLabel: 'URL',
    destination: 'https://hooks.api.shop-demo.io/wallarm/events',
    status: 'connected',
    events: ['attacks', 'system'],
    severity: 'high',
    lastDelivery: '2026-11-06T07:58:00',
    notify: false,
  },
  {
    id: 'int-teams',
    provider: 'Microsoft Teams',
    icon: Teams,
    category: 'Messaging',
    name: 'Platform team',
    destinationLabel: 'Channel',
    destination: 'Platform › Security',
    status: 'connected',
    events: ['system'],
    severity: 'medium',
    lastDelivery: '2026-11-05T16:21:00',
    notify: true,
  },
  {
    id: 'int-email',
    provider: 'Email',
    icon: Mail,
    category: 'Messaging',
    name: 'Weekly report',
    destinationLabel: 'Recipients',
    destination: 'soc@shop-demo.io',
    status: 'connected',
    events: ['attacks', 'vulnerabilities'],
    severity: 'low',
    lastDelivery: '2026-11-03T09:00:00',
    notify: true,
  },
  {
    id: 'int-s3',
    provider: 'Amazon S3',
    icon: Cloud,
    category: 'Storage',
    name: 'Attack log archive',
    destinationLabel: 'Bucket',
    destination: 's3://shop-demo-wallarm-archive/attacks',
    status: 'connected',
    events: ['attacks'],
    severity: 'low',
    lastDelivery: '2026-11-06T06:00:00',
    notify: true,
  },
  {
    id: 'int-syslog',
    provider: 'Syslog',
    icon: Server,
    category: 'SIEM',
    name: 'On-prem collector',
    destinationLabel: 'Host',
    destination: 'syslog.shop-demo.io:6514 (198.51.100.24)',
    status: 'attention',
    events: ['system'],
    severity: 'medium',
    lastDelivery: '2026-11-05T21:44:00',
    notify: true,
  },
  {
    id: 'int-discord',
    provider: 'Discord',
    icon: Discord,
    category: 'Messaging',
    name: 'Discord',
    destinationLabel: 'Webhook URL',
    destination: '',
    status: 'disconnected',
    events: [],
    severity: 'high',
    lastDelivery: null,
    notify: false,
  },
  {
    id: 'int-telegram',
    provider: 'Telegram',
    icon: Telegram,
    category: 'Messaging',
    name: 'Telegram',
    destinationLabel: 'Chat ID',
    destination: '',
    status: 'disconnected',
    events: [],
    severity: 'high',
    lastDelivery: null,
    notify: false,
  },
];

const SLACK = INTEGRATIONS[0] as Integration;

const STATUS = {
  connected: { label: 'Connected', color: 'green' },
  attention: { label: 'Needs attention', color: 'yellow' },
  failed: { label: 'Failed', color: 'red' },
  disconnected: { label: 'Not connected', color: 'gray' },
} as const;

const EVENTS: { value: EventKind; label: string; description: string }[] = [
  {
    value: 'attacks',
    label: 'Attacks',
    description: 'Blocked and monitored attacks at or above the severity.',
  },
  {
    value: 'incidents',
    label: 'Incidents',
    description: 'Attacks that exploited a vulnerability.',
  },
  {
    value: 'vulnerabilities',
    label: 'Vulnerabilities',
    description: 'New and reopened API vulnerabilities.',
  },
  {
    value: 'system',
    label: 'System events',
    description: 'Nodes going offline, sync errors, expiring certificates.',
  },
];

const EVENT_LABELS: Record<EventKind, string> = {
  attacks: 'Attacks',
  incidents: 'Incidents',
  vulnerabilities: 'Vulnerabilities',
  system: 'System events',
};

const SEVERITIES = [
  { label: 'Low and above', value: 'low' },
  { label: 'Medium and above', value: 'medium' },
  { label: 'High and above', value: 'high' },
  { label: 'Critical only', value: 'critical' },
];

const TEST_ERRORS: Record<string, string> = {
  'int-splunk': 'Splunk rejected the request: HEC token is invalid or disabled.',
};

const SAVE_ERRORS: Record<string, string> = {
  'int-jira':
    'Jira rejected the API token: it expired on 4 Nov 2026. Create a new token in Atlassian and reconnect.',
};

const toDraft = (integration: Integration): Draft => ({
  name: integration.name,
  destination: integration.destination,
  events: integration.events,
  severity: integration.severity,
});

// Compares event sets, not order: unticking and re-ticking a box is not a change.
const isDirty = (draft: Draft, integration: Integration) =>
  draft.name !== integration.name ||
  draft.destination !== integration.destination ||
  draft.severity !== integration.severity ||
  [...draft.events].sort().join() !== [...integration.events].sort().join();

// Lowercases a label mid-sentence but keeps acronyms: "Chat ID" → "chat ID", "HEC endpoint" stays.
const inSentence = (label: string) =>
  /^[A-Z][a-z]/.test(label) ? label.charAt(0).toLowerCase() + label.slice(1) : label;

const isEventKind = (value: string): value is EventKind => value in EVENT_LABELS;

// Stand-ins for the app's API requests: each takes a moment so pending states show.
const request = (..._args: unknown[]) => new Promise<void>(resolve => setTimeout(resolve, 800));
const saveIntegration = fn((integration: Integration, _draft: Draft) =>
  request().then(() => {
    const error = SAVE_ERRORS[integration.id];
    if (error) throw new Error(error);
  }),
).mockName('saveIntegration');
const disconnectIntegration = fn(request).mockName('disconnectIntegration');
const setNotifications = fn(request).mockName('setNotifications');
const sendTest = fn((integration: Integration) =>
  request().then(() => {
    const error = TEST_ERRORS[integration.id];
    if (error) throw new Error(error);
  }),
).mockName('sendTest');
const onNavigate = fn().mockName('onNavigate');
const onRailNavigate = fn().mockName('onRailNavigate');
const onOpenAssistant = fn().mockName('onOpenAssistant');
const onEdit = fn().mockName('onEdit');
const onSendTest = fn().mockName('onSendTest');
const onDisconnect = fn().mockName('onDisconnect');
const onToggleNotifications = fn().mockName('onToggleNotifications');

const handleRailClick = (event: MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
  onRailNavigate(event.currentTarget.getAttribute('href'));
};

const getIntegrationId = (integration: Integration) => integration.id;

const renderEvent = (event: EventKind) => <Tag key={event}>{EVENT_LABELS[event]}</Tag>;

const renderIntegration = ({ row }: TableCellContext<Integration, unknown>) => {
  const { icon: Icon, provider, name, destination } = row.original;
  return (
    <HStack gap={12} className='min-w-0'>
      <span className='flex size-32 shrink-0 items-center justify-center rounded-8 border border-border-primary bg-bg-surface-2 text-text-secondary'>
        <Icon size='lg' />
      </span>
      <VStack gap={2} align='stretch' className='min-w-0 flex-1'>
        <Text size='sm' weight='medium' color='primary' truncate>
          {provider === name ? provider : `${provider} · ${name}`}
        </Text>
        <Text size='xs' color='secondary' truncate>
          {destination || 'Not set up'}
        </Text>
      </VStack>
    </HStack>
  );
};

const renderStatus = ({ row }: TableCellContext<Integration, unknown>) => (
  <Badge variant='dotted' type='secondary' color={STATUS[row.original.status].color}>
    {STATUS[row.original.status].label}
  </Badge>
);

const renderEvents = ({ row }: TableCellContext<Integration, unknown>) =>
  row.original.events.length > 0 ? (
    <OverflowList className='gap-4' items={row.original.events} itemRenderer={renderEvent} />
  ) : (
    '—'
  );

const renderLastDelivery = ({ row }: TableCellContext<Integration, unknown>) => (
  <FormatDateTime value={row.original.lastDelivery} format='datetime' layout='inline' />
);

// The master column; each story adds its row menu through `meta.renderMenuAction`.
const INTEGRATION_COLUMN: TableColumnDef<Integration> = {
  accessorKey: 'provider',
  header: 'Integration',
  size: 350,
  cell: renderIntegration,
};

// Columns that only read the row; the Notifications column needs the story's state.
const INFO_COLUMNS: TableColumnDef<Integration>[] = [
  { accessorKey: 'category', header: 'Category', size: 110 },
  { accessorKey: 'status', header: 'Status', size: 150, cell: renderStatus },
  { accessorKey: 'events', header: 'Events', size: 200, enableSorting: false, cell: renderEvents },
  {
    accessorKey: 'lastDelivery',
    header: 'Last delivery',
    size: 160,
    cell: renderLastDelivery,
  },
];

// The same controls with mock handlers, for the Loading story's column headers.
const renderStaticNotifications = ({ row }: TableCellContext<Integration, unknown>) =>
  row.original.status === 'disconnected' ? (
    '—'
  ) : (
    <Switch checked={row.original.notify} onCheckedChange={onToggleNotifications}>
      <SwitchControl />
      <SwitchLabel className='sr-only'>Notifications for {row.original.provider}</SwitchLabel>
    </Switch>
  );

const renderStaticMenuAction = (row: TableRow<Integration>) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant='ghost'
        color='neutral'
        size='small'
        aria-label={`Actions for ${row.original.provider}`}
      >
        <Ellipsis />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      {row.original.status === 'disconnected' ? (
        <DropdownMenuItem onSelect={onEdit}>
          <DropdownMenuItemIcon>
            <Plug />
          </DropdownMenuItemIcon>
          <DropdownMenuItemText>Connect {row.original.provider}</DropdownMenuItemText>
        </DropdownMenuItem>
      ) : (
        <>
          <DropdownMenuItem onSelect={onEdit}>
            <DropdownMenuItemIcon>
              <Pencil />
            </DropdownMenuItemIcon>
            <DropdownMenuItemText>Edit</DropdownMenuItemText>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onSendTest}>
            <DropdownMenuItemIcon>
              <Zap />
            </DropdownMenuItemIcon>
            <DropdownMenuItemText>Send test notification</DropdownMenuItemText>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onSelect={onDisconnect}>
            <DropdownMenuItemIcon>
              <Unplug />
            </DropdownMenuItemIcon>
            <DropdownMenuItemText>Disconnect {row.original.provider}</DropdownMenuItemText>
          </DropdownMenuItem>
        </>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

const STATIC_COLUMNS: TableColumnDef<Integration>[] = [
  { ...INTEGRATION_COLUMN, meta: { renderMenuAction: renderStaticMenuAction } },
  ...INFO_COLUMNS,
  {
    id: 'notify',
    header: 'Notifications',
    size: 110,
    enableSorting: false,
    cell: renderStaticNotifications,
  },
];

const severities = createListCollection({ items: SEVERITIES });

const meta = {
  title: 'Templates/Integrations settings',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when building the settings page that connects Wallarm to Slack, Jira, PagerDuty, a SIEM or a webhook, with per-integration notification rules.',
      },
    },
  },
} satisfies Meta;

export default meta;

/**
 * Settings › Integrations inside the console frame. Search and status tabs filter one table;
 * each row shows its status, events and last delivery. The Notifications switch saves at once,
 * the row menu edits, connects, sends a test (Splunk fails) or disconnects with a confirmation.
 * Saving Jira fails: the server's reason shows atop the drawer body and the drawer stays open.
 */
export const Default: StoryFn = () => {
  const toast = useToast();
  const [pathname, setPathname] = useState(PATHNAME);
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [editing, setEditing] = useState<Integration>(SLACK);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(toDraft(SLACK));
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testDelivered, setTestDelivered] = useState(false);
  const [testError, setTestError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [disconnecting, setDisconnecting] = useState<Integration>(SLACK);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDisconnect, setPendingDisconnect] = useState(false);

  const isConnect = editing.status === 'disconnected';
  const dirty = isDirty(draft, editing);
  const canSubmit =
    draft.name.trim() !== '' &&
    draft.destination.trim() !== '' &&
    draft.events.length > 0 &&
    (isConnect || dirty);

  const update = (id: string, patch: Partial<Integration>) =>
    setIntegrations(prev => prev.map(item => (item.id === id ? { ...item, ...patch } : item)));

  const handleNavigate = (to: string) => {
    onNavigate(to);
    setPathname(to);
  };

  const openDrawer = (integration: Integration) => {
    setEditing(integration);
    setDraft(toDraft(integration));
    setTestDelivered(false);
    setTestError('');
    setSaveError('');
    setDrawerOpen(true);
  };

  const handleDrawerOpenChange = (next: boolean) => {
    if (!saving) setDrawerOpen(next);
  };
  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) =>
    setDraft({ ...draft, name: event.target.value });
  const handleDestinationChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraft({ ...draft, destination: event.target.value });
    setTestDelivered(false);
    setTestError('');
  };
  const handleSeverityChange = ({ value }: { value: string[] }) =>
    setDraft({ ...draft, severity: value[0] ?? draft.severity });
  const handleEventsChange = (value: string[]) => setDraft({ ...draft, events: value });

  const handleTestInForm = async () => {
    setTesting(true);
    setTestDelivered(false);
    setTestError('');
    try {
      await sendTest(editing);
      setTestDelivered(true);
    } catch (error) {
      setTestError(error instanceof Error ? error.message : 'The destination did not respond.');
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await saveIntegration(editing, draft);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "The server didn't respond.");
      setSaving(false);
      return;
    }
    update(editing.id, {
      ...draft,
      events: draft.events.filter(isEventKind),
      status: isConnect ? 'connected' : editing.status,
      notify: isConnect ? true : editing.notify,
    });
    setSaving(false);
    setDrawerOpen(false);
    toast.create({
      id: `save-${editing.id}`,
      title: isConnect
        ? `${editing.provider} connected`
        : `${editing.provider} integration updated`,
      type: 'success',
    });
  };

  const handleDialogOpenChange = (next: boolean) => {
    if (!pendingDisconnect) setDialogOpen(next);
  };

  const handleDisconnect = async () => {
    setPendingDisconnect(true);
    try {
      await disconnectIntegration(disconnecting.id);
      update(disconnecting.id, { status: 'disconnected', notify: false });
      setDialogOpen(false);
      toast.create({
        id: `disconnect-${disconnecting.id}`,
        title: `${disconnecting.provider} disconnected`,
        type: 'default',
      });
    } catch {
      toast.create({ title: `Couldn't disconnect ${disconnecting.provider}`, type: 'error' });
    } finally {
      setPendingDisconnect(false);
    }
  };

  const renderNotifications = ({ row }: TableCellContext<Integration, unknown>) => {
    const integration = row.original;
    const handleCheckedChange = async ({ checked }: { checked: boolean }) => {
      update(integration.id, { notify: checked });
      await setNotifications(integration.id, checked);
      toast.create({
        id: `notify-${integration.id}`,
        title: `${integration.provider} notifications ${checked ? 'enabled' : 'disabled'}`,
        type: 'default',
      });
    };

    if (integration.status === 'disconnected') return '—';
    return (
      <Switch
        checked={integration.notify}
        onCheckedChange={handleCheckedChange}
        data-testid={`integrations-notify-${integration.id}`}
      >
        <SwitchControl />
        <SwitchLabel className='sr-only'>Notifications for {integration.provider}</SwitchLabel>
      </Switch>
    );
  };

  const renderMenuAction = (row: TableRow<Integration>) => {
    const integration = row.original;
    const handleEdit = () => openDrawer(integration);
    const handleSendTest = async () => {
      const id = toast.create({
        id: `test-${integration.id}`,
        title: 'Sending test notification…',
        type: 'loading',
      });
      try {
        await sendTest(integration);
        toast.update({ id, title: `Test delivered via ${integration.provider}`, type: 'success' });
      } catch (error) {
        toast.update({
          id,
          title: 'Test failed',
          description: error instanceof Error ? error.message : undefined,
          type: 'error',
          duration: 10000,
        });
      }
    };
    const handleDisconnectSelect = () => {
      setDisconnecting(integration);
      setDialogOpen(true);
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            color='neutral'
            size='small'
            aria-label={`Actions for ${integration.provider}`}
            data-testid={`integrations-actions-${integration.id}`}
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {integration.status === 'disconnected' ? (
            <DropdownMenuItem onSelect={handleEdit} data-testid='integrations-connect'>
              <DropdownMenuItemIcon>
                <Plug />
              </DropdownMenuItemIcon>
              <DropdownMenuItemText>Connect {integration.provider}</DropdownMenuItemText>
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem onSelect={handleEdit} data-testid='integrations-edit'>
                <DropdownMenuItemIcon>
                  <Pencil />
                </DropdownMenuItemIcon>
                <DropdownMenuItemText>Edit</DropdownMenuItemText>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleSendTest} data-testid='integrations-send-test'>
                <DropdownMenuItemIcon>
                  <Zap />
                </DropdownMenuItemIcon>
                <DropdownMenuItemText>Send test notification</DropdownMenuItemText>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant='destructive'
                onSelect={handleDisconnectSelect}
                data-testid='integrations-disconnect'
              >
                <DropdownMenuItemIcon>
                  <Unplug />
                </DropdownMenuItemIcon>
                <DropdownMenuItemText>Disconnect {integration.provider}</DropdownMenuItemText>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const columns: TableColumnDef<Integration>[] = [
    { ...INTEGRATION_COLUMN, meta: { renderMenuAction } },
    ...INFO_COLUMNS,
    {
      id: 'notify',
      header: 'Notifications',
      size: 110,
      enableSorting: false,
      cell: renderNotifications,
    },
  ];

  const search = query.trim().toLowerCase();
  const matching = integrations.filter(
    item =>
      item.provider.toLowerCase().includes(search) ||
      item.name.toLowerCase().includes(search) ||
      item.destination.toLowerCase().includes(search),
  );
  const tabOf = (item: Integration): StatusTab =>
    item.status === 'connected'
      ? 'connected'
      : item.status === 'disconnected'
        ? 'disconnected'
        : 'issues';
  const counts = {
    all: matching.length,
    connected: matching.filter(item => tabOf(item) === 'connected').length,
    issues: matching.filter(item => tabOf(item) === 'issues').length,
    disconnected: matching.filter(item => tabOf(item) === 'disconnected').length,
  };
  const rows = status === 'all' ? matching : matching.filter(item => tabOf(item) === status);

  const handleReset = () => {
    setQuery('');
    setStatus('all');
  };

  return (
    <AppShell data-testid='app-shell'>
      <AppShellHeader>
        <TopHeader>
          <TopHeaderLogo href='/' onClick={handleRailClick}>
            <Logo size='md' />
          </TopHeaderLogo>
          <TopHeaderActions>
            <Button variant='ghost' color='neutral' size='small' aria-label='Search'>
              <Search />
            </Button>
            <TopHeaderSeparator />
            <Button variant='ghost' color='neutral' size='small'>
              Shop Demo
              <ChevronUpDown />
            </Button>
            <ChatTrigger onClick={onOpenAssistant} />
            <NotificationCenter>
              <NotificationCenterTrigger />
            </NotificationCenter>
            <Button variant='ghost' color='neutral' size='small' aria-label='Help'>
              <CircleHelp />
            </Button>
          </TopHeaderActions>
        </TopHeader>
      </AppShellHeader>

      <AppShellRail>
        <NavRail mode='collapsed'>
          <NavRailBody>
            <NavRailItem href='/' icon={HomeIcon} label='Home' onClick={handleRailClick} />
            <NavRailItem href='/recent' icon={History} label='Recent' onClick={handleRailClick} />
            <NavRailSeparator />
            {PRODUCTS.map(product => (
              <NavRailItem
                key={product.id}
                href={`/${product.id}`}
                icon={product.icon}
                label={product.label}
                shortcut={product.shortcut}
                onClick={handleRailClick}
              />
            ))}
          </NavRailBody>
          <NavRailFooter>
            <NavRailItem
              href='/settings'
              icon={Settings}
              label='Settings'
              shortcut={['G', 'S']}
              active
              onClick={handleRailClick}
            />
          </NavRailFooter>
        </NavRail>
      </AppShellRail>

      <AppShellRemote role='main'>
        <RemoteShell
          config={SETTINGS_NAV}
          basePath='/settings'
          pathname={pathname}
          onNavigate={handleNavigate}
        >
          <RemoteShellPanel />
          <RemoteShellBreadcrumb />
          <RemoteShellContent>
            <Page name='settings-integrations' fullSize fixedHeight data-testid='integrations-page'>
              <PageHeader>
                <PageHeaderGroup className='flex-1'>
                  <PageTitle>Integrations</PageTitle>
                  <PageDescription>
                    Where Wallarm sends attacks, incidents and system events, and which ones each
                    tool receives.
                  </PageDescription>
                </PageHeaderGroup>
              </PageHeader>

              <PageToolbar>
                <SearchInput
                  value={query}
                  onChange={setQuery}
                  placeholder='Search integration or destination'
                  className='w-[320px]'
                  data-testid='integrations-search'
                />
                <SegmentedTabs
                  value={status}
                  onChange={setStatus}
                  data-testid='integrations-status-tabs'
                >
                  <SegmentedTabsList>
                    <SegmentedTabsTrigger value='all'>
                      All <NumericBadge>{counts.all}</NumericBadge>
                    </SegmentedTabsTrigger>
                    <SegmentedTabsTrigger value='connected'>
                      Connected <NumericBadge>{counts.connected}</NumericBadge>
                    </SegmentedTabsTrigger>
                    <SegmentedTabsTrigger value='issues'>
                      Issues <NumericBadge>{counts.issues}</NumericBadge>
                    </SegmentedTabsTrigger>
                    <SegmentedTabsTrigger value='disconnected'>
                      Not connected <NumericBadge>{counts.disconnected}</NumericBadge>
                    </SegmentedTabsTrigger>
                  </SegmentedTabsList>
                </SegmentedTabs>
              </PageToolbar>

              <PageContent>
                <Table
                  aria-label='Integrations'
                  data={rows}
                  columns={columns}
                  getRowId={getIntegrationId}
                  activeRowId={drawerOpen ? editing.id : undefined}
                  data-testid='integrations-table'
                >
                  <TableEmptyState>
                    <EmptyState type='collection-empty' data-testid='integrations-no-results'>
                      <EmptyStateIllustration>
                        <SearchX />
                      </EmptyStateIllustration>
                      <EmptyStateMessage>
                        <EmptyStateTitle>No results found</EmptyStateTitle>
                        <EmptyStateDescription>
                          No integrations match your search or status.
                        </EmptyStateDescription>
                      </EmptyStateMessage>
                      <EmptyStateActions>
                        <Button
                          size='medium'
                          variant='outline'
                          color='neutral'
                          onClick={handleReset}
                        >
                          <FilterX />
                          Reset filters
                        </Button>
                      </EmptyStateActions>
                    </EmptyState>
                  </TableEmptyState>
                </Table>
              </PageContent>

              <Drawer
                open={drawerOpen}
                onOpenChange={handleDrawerOpenChange}
                width={700}
                data-testid='integration-drawer'
              >
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>
                      {isConnect
                        ? `Connect ${editing.provider}`
                        : `Edit ${editing.provider} integration`}
                    </DrawerTitle>
                    <DrawerDescription>
                      {editing.category} · Wallarm sends the selected events to this{' '}
                      {inSentence(editing.destinationLabel)}.
                    </DrawerDescription>
                  </DrawerHeader>
                  <form onSubmit={handleSubmit} className='flex min-h-0 flex-1 flex-col'>
                    <DrawerBody>
                      <VStack gap={16}>
                        {saveError && (
                          <Alert color='destructive' data-testid='integration-save-error'>
                            <AlertIcon />
                            <AlertContent>
                              <AlertTitle>Couldn't save changes</AlertTitle>
                              <AlertDescription>{saveError}</AlertDescription>
                            </AlertContent>
                          </Alert>
                        )}
                        <Timeline>
                          <TimelineItem>
                            <TimelineConnector>
                              <TimelineIndicator>1</TimelineIndicator>
                              <TimelineSeparator />
                            </TimelineConnector>
                            <TimelineContent>
                              <TimelineTitle>Destination</TimelineTitle>
                              <VStack gap={12}>
                                <div className='grid grid-cols-2 gap-12'>
                                  <Field required>
                                    <FieldLabel>
                                      Name
                                      <FieldIndicator />
                                    </FieldLabel>
                                    <Input
                                      value={draft.name}
                                      onChange={handleNameChange}
                                      placeholder='SOC alerts'
                                      data-testid='integration-name'
                                    />
                                  </Field>
                                  <Field required>
                                    <FieldLabel>
                                      Minimum severity
                                      <FieldIndicator />
                                    </FieldLabel>
                                    <Select
                                      collection={severities}
                                      value={[draft.severity]}
                                      onValueChange={handleSeverityChange}
                                    >
                                      <SelectInput className='w-full' />
                                      <SelectPositioner>
                                        <SelectContent>
                                          {severities.items.map(item => (
                                            <SelectOption key={item.value} item={item}>
                                              <SelectOptionText>{item.label}</SelectOptionText>
                                              <SelectOptionIndicator />
                                            </SelectOption>
                                          ))}
                                        </SelectContent>
                                      </SelectPositioner>
                                    </Select>
                                  </Field>
                                </div>
                                <Field required>
                                  <FieldLabel>
                                    {editing.destinationLabel}
                                    <FieldIndicator />
                                  </FieldLabel>
                                  <Input
                                    value={draft.destination}
                                    onChange={handleDestinationChange}
                                    data-testid='integration-destination'
                                  />
                                </Field>
                              </VStack>
                            </TimelineContent>
                          </TimelineItem>
                          <TimelineItem>
                            <TimelineConnector>
                              <TimelineIndicator>2</TimelineIndicator>
                              <TimelineSeparator />
                            </TimelineConnector>
                            <TimelineContent>
                              <TimelineTitle>Events</TimelineTitle>
                              <CheckboxGroup
                                variant='card'
                                name='events'
                                value={draft.events}
                                onValueChange={handleEventsChange}
                              >
                                {EVENTS.map(event => (
                                  <Checkbox
                                    key={event.value}
                                    value={event.value}
                                    data-testid={`integration-event-${event.value}`}
                                  >
                                    <CheckboxIndicator />
                                    <CheckboxLabel>{event.label}</CheckboxLabel>
                                    <CheckboxDescription>{event.description}</CheckboxDescription>
                                  </Checkbox>
                                ))}
                              </CheckboxGroup>
                            </TimelineContent>
                          </TimelineItem>
                          <TimelineItem>
                            <TimelineConnector>
                              <TimelineIndicator>3</TimelineIndicator>
                            </TimelineConnector>
                            <TimelineContent>
                              <TimelineTitle>Test delivery</TimelineTitle>
                              <VStack gap={12} align='start'>
                                <Text size='sm' color='secondary'>
                                  Allow 203.0.113.0/24 and 198.51.100.0/24 if the destination
                                  filters by source IP.
                                </Text>
                                <Button
                                  variant='outline'
                                  color='neutral'
                                  disabled={draft.destination.trim() === ''}
                                  loading={testing}
                                  onClick={handleTestInForm}
                                  data-testid='integration-test'
                                >
                                  <Zap />
                                  Send test notification
                                </Button>
                                {testDelivered && (
                                  <Alert color='success' data-testid='integration-test-result'>
                                    <AlertIcon />
                                    <AlertContent>
                                      <AlertTitle>Test delivered to {draft.destination}</AlertTitle>
                                      <AlertDescription>
                                        Check {editing.provider} for a message from Wallarm.
                                      </AlertDescription>
                                    </AlertContent>
                                  </Alert>
                                )}
                                {testError && (
                                  <Alert color='destructive' data-testid='integration-test-error'>
                                    <AlertIcon />
                                    <AlertContent>
                                      <AlertTitle>Test failed</AlertTitle>
                                      <AlertDescription>{testError}</AlertDescription>
                                    </AlertContent>
                                  </Alert>
                                )}
                              </VStack>
                            </TimelineContent>
                          </TimelineItem>
                        </Timeline>
                      </VStack>
                    </DrawerBody>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant='ghost' color='neutral'>
                          Cancel
                        </Button>
                      </DrawerClose>
                      <Button
                        type='submit'
                        disabled={!canSubmit}
                        loading={saving}
                        data-testid='integration-submit'
                      >
                        {isConnect ? `Connect ${editing.provider}` : 'Save changes'}
                      </Button>
                    </DrawerFooter>
                  </form>
                </DrawerContent>
              </Drawer>

              <Dialog
                width={400}
                open={dialogOpen}
                onOpenChange={handleDialogOpenChange}
                data-testid='disconnect-dialog'
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Disconnect {disconnecting.provider}?</DialogTitle>
                    <DialogDescription>
                      Wallarm stops sending events to {disconnecting.destination}. The event and
                      severity settings are kept, so you can reconnect later.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant='ghost' color='neutral'>
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      color='destructive'
                      loading={pendingDisconnect}
                      onClick={handleDisconnect}
                      data-testid='disconnect-confirm'
                    >
                      Disconnect {disconnecting.provider}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Page>
          </RemoteShellContent>
        </RemoteShell>
      </AppShellRemote>
    </AppShell>
  );
};

/**
 * First load: the real header and toolbar with skeleton rows under the column headers, and tabs
 * without counts until the data arrives. Never a `Loader` in place of the table.
 */
export const Loading: StoryFn = () => (
  <AppShell data-testid='app-shell'>
    <AppShellHeader>
      <TopHeader>
        <TopHeaderLogo href='/' onClick={handleRailClick}>
          <Logo size='md' />
        </TopHeaderLogo>
        <TopHeaderActions>
          <Button variant='ghost' color='neutral' size='small' aria-label='Search'>
            <Search />
          </Button>
          <TopHeaderSeparator />
          <Button variant='ghost' color='neutral' size='small'>
            Shop Demo
            <ChevronUpDown />
          </Button>
          <ChatTrigger onClick={onOpenAssistant} />
          <NotificationCenter>
            <NotificationCenterTrigger />
          </NotificationCenter>
          <Button variant='ghost' color='neutral' size='small' aria-label='Help'>
            <CircleHelp />
          </Button>
        </TopHeaderActions>
      </TopHeader>
    </AppShellHeader>

    <AppShellRail>
      <NavRail mode='collapsed'>
        <NavRailBody>
          <NavRailItem href='/' icon={HomeIcon} label='Home' onClick={handleRailClick} />
          <NavRailItem href='/recent' icon={History} label='Recent' onClick={handleRailClick} />
          <NavRailSeparator />
          {PRODUCTS.map(product => (
            <NavRailItem
              key={product.id}
              href={`/${product.id}`}
              icon={product.icon}
              label={product.label}
              shortcut={product.shortcut}
              onClick={handleRailClick}
            />
          ))}
        </NavRailBody>
        <NavRailFooter>
          <NavRailItem
            href='/settings'
            icon={Settings}
            label='Settings'
            shortcut={['G', 'S']}
            active
            onClick={handleRailClick}
          />
        </NavRailFooter>
      </NavRail>
    </AppShellRail>

    <AppShellRemote role='main'>
      <RemoteShell
        config={SETTINGS_NAV}
        basePath='/settings'
        pathname={PATHNAME}
        onNavigate={onNavigate}
      >
        <RemoteShellPanel />
        <RemoteShellBreadcrumb />
        <RemoteShellContent>
          <Page name='settings-integrations' fullSize fixedHeight data-testid='integrations-page'>
            <PageHeader>
              <PageHeaderGroup className='flex-1'>
                <PageTitle>Integrations</PageTitle>
                <PageDescription>
                  Where Wallarm sends attacks, incidents and system events, and which ones each tool
                  receives.
                </PageDescription>
              </PageHeaderGroup>
            </PageHeader>

            <PageToolbar>
              <SearchInput
                placeholder='Search integration or destination'
                className='w-[320px]'
                data-testid='integrations-search'
              />
              <SegmentedTabs defaultValue='all' data-testid='integrations-status-tabs'>
                <SegmentedTabsList>
                  <SegmentedTabsTrigger value='all'>All</SegmentedTabsTrigger>
                  <SegmentedTabsTrigger value='connected'>Connected</SegmentedTabsTrigger>
                  <SegmentedTabsTrigger value='issues'>Issues</SegmentedTabsTrigger>
                  <SegmentedTabsTrigger value='disconnected'>Not connected</SegmentedTabsTrigger>
                </SegmentedTabsList>
              </SegmentedTabs>
            </PageToolbar>

            <PageContent>
              <Table
                aria-label='Integrations'
                data={[]}
                columns={STATIC_COLUMNS}
                isLoading
                data-testid='integrations-table'
              />
            </PageContent>
          </Page>
        </RemoteShellContent>
      </RemoteShell>
    </AppShellRemote>
  </AppShell>
);
