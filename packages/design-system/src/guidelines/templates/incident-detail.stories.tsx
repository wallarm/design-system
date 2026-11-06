import { type ChangeEvent, useState } from 'react';
import { fn } from 'storybook/test';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import {
  Alert,
  AlertContent,
  AlertControls,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '../../components/Alert';
import { Attribute, AttributeLabel, AttributeValue } from '../../components/Attribute';
import {
  Avatar,
  AvatarContent,
  AvatarDescription,
  AvatarFallback,
  AvatarName,
} from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Card';
import { Code } from '../../components/Code';
import {
  CodeSnippetActions,
  CodeSnippetCode,
  CodeSnippetContent,
  CodeSnippetCopyButton,
  CodeSnippetHeader,
  CodeSnippetLineNumbers,
  CodeSnippetRoot,
  CodeSnippetTitle,
  CodeSnippetWrapButton,
  InlineCodeSnippet,
} from '../../components/CodeSnippet';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemText,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu';
import { Field, FieldLabel } from '../../components/Field';
import { FormatDateTime } from '../../components/FormatDateTime';
import { FormatNumber } from '../../components/FormatNumber';
import { Heading } from '../../components/Heading';
import { HttpMethod } from '../../components/HttpMethod';
import { Ip, IpAddress, IpCountry } from '../../components/Ip';
import { NumericBadge } from '../../components/NumericBadge';
import {
  Page,
  PageActions,
  PageContent,
  PageHeader,
  PageHeaderGroup,
  PageTitle,
} from '../../components/Page';
import { ResponseCode } from '../../components/ResponseCode';
import { Skeleton } from '../../components/Skeleton';
import { SplitButton } from '../../components/SplitButton';
import { HStack, VStack } from '../../components/Stack';
import type { TableCellContext, TableColumnDef, TableRow } from '../../components/Table';
import { Table } from '../../components/Table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/Tabs';
import { Text } from '../../components/Text';
import { Textarea } from '../../components/Textarea';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '../../components/Timeline';
import { useToast } from '../../components/Toast';
import {
  Bell,
  ChevronDown,
  CircleCheck,
  Copy,
  Download,
  Ellipsis,
  ExternalLink,
  Flag,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
} from '../../icons';

type IncidentStatus = 'open' | 'resolved' | 'false-positive';
type TimelineKind = 'detection' | 'system' | 'person' | 'resolution';

interface TimelineEvent {
  id: string;
  kind: TimelineKind;
  title: string;
  description: string;
  actor: string;
  at: string;
}

interface RelatedEvent {
  id: string;
  method: string;
  path: string;
  ip: string;
  country: 'NL' | 'BR' | 'SG' | 'DE';
  payload: string;
  responseCode: number;
  action: 'blocked' | 'monitored';
  at: string;
}

interface Comment {
  id: string;
  author: string;
  role: string;
  body: string;
  at: string;
}

interface IncidentDetailArgs {
  initialTab?: string;
  isLoading?: boolean;
}

const INCIDENT = {
  id: 'INC-2481',
  title: 'SQL injection in POST /api/v2/orders/search',
  host: 'api.shop-demo.io',
  method: 'POST',
  path: '/api/v2/orders/search',
  parameter: 'body.filter.customer_id',
  rule: 'wl-sqli-1042',
  firstSeen: '2026-11-04T09:12:41Z',
  lastSeen: '2026-11-04T11:47:03Z',
  requests: 1284,
  blockedShare: 93.1,
  sourceIps: [
    { ip: '203.0.113.42', country: 'NL' },
    { ip: '203.0.113.77', country: 'NL' },
    { ip: '198.51.100.14', country: 'BR' },
    { ip: '198.51.100.201', country: 'SG' },
  ] as const,
};

const ANALYSTS = ['Daniel Okafor', 'Priya Raman', 'Maria Lopez', 'Kenji Watanabe'];

const SAMPLE_REQUEST = `POST /api/v2/orders/search HTTP/1.1
Host: api.shop-demo.io
User-Agent: sqlmap/1.8.4#stable
Content-Type: application/json
X-Forwarded-For: 203.0.113.42

{"filter":{"customer_id":"1' UNION SELECT username,password_hash FROM users--","status":"paid"},"limit":50}`;

const TIMELINE: TimelineEvent[] = [
  {
    id: 't-7',
    kind: 'system',
    title: 'Attack volume peaked',
    description: '412 requests a minute from 4 addresses; all of them were blocked.',
    actor: 'Wallarm',
    at: '2026-11-04T11:31:00Z',
  },
  {
    id: 't-6',
    kind: 'person',
    title: 'Comment added',
    description: 'Payloads target customer_id; checking whether the ORM escapes it.',
    actor: 'Daniel Okafor',
    at: '2026-11-04T10:05:00Z',
  },
  {
    id: 't-5',
    kind: 'resolution',
    title: 'Blocking mode enabled',
    description: 'api.shop-demo.io switched from monitoring to blocking.',
    actor: 'Maria Lopez',
    at: '2026-11-04T09:41:00Z',
  },
  {
    id: 't-4',
    kind: 'person',
    title: 'Assigned to Daniel Okafor',
    description: 'Picked up from the SOC on-call queue.',
    actor: 'Maria Lopez',
    at: '2026-11-04T09:24:00Z',
  },
  {
    id: 't-3',
    kind: 'system',
    title: 'On-call notified',
    description: 'Sent to the secops-alerts channel and the on-call pager.',
    actor: 'Wallarm',
    at: '2026-11-04T09:13:30Z',
  },
  {
    id: 't-2',
    kind: 'detection',
    title: 'Incident opened as critical',
    description: 'Severity set by the "Payment APIs" policy: 50+ injection hits in 1 minute.',
    actor: 'Wallarm',
    at: '2026-11-04T09:13:02Z',
  },
  {
    id: 't-1',
    kind: 'detection',
    title: 'First malicious request',
    description: 'Rule wl-sqli-1042 matched a UNION SELECT in body.filter.customer_id.',
    actor: 'Wallarm',
    at: '2026-11-04T09:12:41Z',
  },
];

const RELATED_EVENTS: RelatedEvent[] = [
  {
    id: 'r-90412',
    method: 'POST',
    path: '/api/v2/orders/search',
    ip: '203.0.113.42',
    country: 'NL',
    payload: "1' UNION SELECT username,password_hash FROM users--",
    responseCode: 403,
    action: 'blocked',
    at: '2026-11-04T11:47:03Z',
  },
  {
    id: 'r-90398',
    method: 'POST',
    path: '/api/v2/orders/search',
    ip: '203.0.113.77',
    country: 'NL',
    payload: "1' AND SLEEP(5)--",
    responseCode: 403,
    action: 'blocked',
    at: '2026-11-04T11:46:51Z',
  },
  {
    id: 'r-90377',
    method: 'GET',
    path: '/api/v2/orders/export',
    ip: '198.51.100.14',
    country: 'BR',
    payload: 'id=7 OR 1=1; DROP TABLE orders',
    responseCode: 403,
    action: 'blocked',
    at: '2026-11-04T11:45:12Z',
  },
  {
    id: 'r-90341',
    method: 'POST',
    path: '/api/v2/orders/search',
    ip: '198.51.100.201',
    country: 'SG',
    payload: "1' OR '1'='1",
    responseCode: 403,
    action: 'blocked',
    at: '2026-11-04T11:43:40Z',
  },
  {
    id: 'r-90302',
    method: 'POST',
    path: '/api/v2/orders/search',
    ip: '203.0.113.42',
    country: 'NL',
    payload: "1'||(SELECT version())||'",
    responseCode: 403,
    action: 'blocked',
    at: '2026-11-04T11:40:18Z',
  },
  {
    id: 'r-88710',
    method: 'POST',
    path: '/api/v2/orders/search',
    ip: '198.51.100.14',
    country: 'BR',
    payload: "1' ORDER BY 12--",
    responseCode: 200,
    action: 'monitored',
    at: '2026-11-04T09:38:55Z',
  },
  {
    id: 'r-88652',
    method: 'POST',
    path: '/api/v2/orders/search',
    ip: '203.0.113.42',
    country: 'NL',
    payload: "1' UNION SELECT NULL,NULL--",
    responseCode: 500,
    action: 'monitored',
    at: '2026-11-04T09:21:07Z',
  },
  {
    id: 'r-88601',
    method: 'POST',
    path: '/api/v2/orders/search',
    ip: '203.0.113.77',
    country: 'DE',
    payload: "customer_id=1'--",
    responseCode: 500,
    action: 'monitored',
    at: '2026-11-04T09:12:41Z',
  },
];

const COMMENTS: Comment[] = [
  {
    id: 'c-1',
    author: 'Maria Lopez',
    role: 'SOC lead',
    body: 'Blocking is on for the whole host. Daniel, please confirm whether anything got through before 09:41.',
    at: '2026-11-04T09:42:00Z',
  },
  {
    id: 'c-2',
    author: 'Daniel Okafor',
    role: 'Security analyst',
    body: 'Two requests returned 500 while we were still monitoring. Payloads target customer_id; checking whether the ORM escapes it.',
    at: '2026-11-04T10:05:00Z',
  },
];

const STATUS = {
  open: { label: 'Open', color: 'yellow' },
  resolved: { label: 'Resolved', color: 'green' },
  'false-positive': { label: 'False positive', color: 'gray' },
} as const;

const ACTION = {
  blocked: { label: 'Blocked', color: 'red' },
  monitored: { label: 'Monitored', color: 'yellow' },
} as const;

const INDICATOR = {
  detection: { color: 'danger', icon: ShieldAlert },
  system: { color: 'info', icon: Bell },
  person: { color: 'neutral', icon: UserPlus },
  resolution: { color: 'success', icon: ShieldCheck },
} as const;

// Stand-in for the app's API request: resolves after 800ms so the pending state shows.
const request = (..._args: unknown[]) => new Promise<void>(resolve => setTimeout(resolve, 800));
const markFalsePositive = fn(request).mockName('markFalsePositive');
const onResolve = fn().mockName('onResolve');
const onAssign = fn().mockName('onAssign');
const onAcceptRisk = fn().mockName('onAcceptRisk');
const onCreateTicket = fn().mockName('onCreateTicket');
const onCopyLink = fn().mockName('onCopyLink');
const onExport = fn().mockName('onExport');
const onAddComment = fn().mockName('onAddComment');
const onOpenRequest = fn().mockName('onOpenRequest');
const onCopyRequestId = fn().mockName('onCopyRequestId');

const getItemId = (item: { id: string }) => item.id;

const meta = {
  title: 'Templates/Incident detail',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when building a page for one security incident or vulnerability: status and owner in the header, tabs for overview, timeline, related events and comments.',
      },
    },
  },
} satisfies Meta;

export default meta;

/**
 * The whole page on the Overview tab. The header carries the title, severity, status,
 * assignee menu and a split button: "Resolve" is the default action, the chevron opens
 * "Mark as false positive" (confirmed in a dialog) and other resolutions. Overview pairs the
 * bordered attribute card, the description and a sample request with a card of the latest
 * timeline entries. Every tab is live: the timeline, a related-events table and comments.
 */
export const Default: StoryFn<IncidentDetailArgs> = ({
  initialTab = 'overview',
  isLoading = false,
}) => {
  const toast = useToast();
  const [tab, setTab] = useState(initialTab);
  const [status, setStatus] = useState<IncidentStatus>('open');
  const [assignee, setAssignee] = useState('Daniel Okafor');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [comments, setComments] = useState(COMMENTS);
  const [draft, setDraft] = useState('');

  const renderRequest = ({ row }: TableCellContext<RelatedEvent, unknown>) => (
    <HStack gap={8}>
      <HttpMethod method={row.original.method} />
      <Text size='sm' truncate>
        {row.original.path}
      </Text>
    </HStack>
  );
  const renderSource = ({ row }: TableCellContext<RelatedEvent, unknown>) => (
    <Ip>
      <IpCountry code={row.original.country} />
      <IpAddress>{row.original.ip}</IpAddress>
    </Ip>
  );
  const renderPayload = ({ row }: TableCellContext<RelatedEvent, unknown>) => (
    <Code size='m' truncate>
      {row.original.payload}
    </Code>
  );
  const renderResponse = ({ row }: TableCellContext<RelatedEvent, unknown>) => (
    <ResponseCode code={row.original.responseCode} />
  );
  const renderAction = ({ row }: TableCellContext<RelatedEvent, unknown>) => (
    <Badge variant='dotted' type='secondary' color={ACTION[row.original.action].color}>
      {ACTION[row.original.action].label}
    </Badge>
  );
  const renderTime = ({ row }: TableCellContext<RelatedEvent, unknown>) => (
    <FormatDateTime value={row.original.at} format='datetime' layout='inline' />
  );

  const renderEventMenu = (row: TableRow<RelatedEvent>) => {
    const event = row.original;
    const handleOpen = () => onOpenRequest(event.id);
    const handleCopyId = () => onCopyRequestId(event.id);

    return (
      <DropdownMenu data-testid='incident-event-menu'>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            color='neutral'
            size='small'
            aria-label={`Actions for request ${event.id}`}
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={handleOpen}>
            <DropdownMenuItemText>Open request</DropdownMenuItemText>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleCopyId}>
            <DropdownMenuItemText>Copy request ID</DropdownMenuItemText>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const eventColumns: TableColumnDef<RelatedEvent>[] = [
    {
      id: 'request',
      header: 'Request',
      size: 320,
      cell: renderRequest,
      meta: { renderMenuAction: renderEventMenu },
    },
    { accessorKey: 'ip', header: 'Source', size: 200, cell: renderSource },
    { accessorKey: 'payload', header: 'Payload', size: 360, cell: renderPayload },
    { accessorKey: 'responseCode', header: 'Response', size: 120, cell: renderResponse },
    { accessorKey: 'action', header: 'Result', size: 140, cell: renderAction },
    { accessorKey: 'at', header: 'Time', size: 200, cell: renderTime },
  ];

  const isOpen = status === 'open';

  const handleResolve = () => {
    onResolve(INCIDENT.id);
    setStatus(isOpen ? 'resolved' : 'open');
    toast.create({
      id: 'incident-resolution',
      title: isOpen ? 'Incident resolved' : 'Incident reopened',
      type: 'default',
    });
  };
  const handleOpenFalsePositive = () => setDialogOpen(true);
  const handleAcceptRisk = () => onAcceptRisk(INCIDENT.id);
  const handleCreateTicket = () => onCreateTicket(INCIDENT.id);
  const handleCopyLink = () => onCopyLink(INCIDENT.id);
  const handleExport = () => onExport(INCIDENT.id);
  const handleAssigneeChange = ({ value }: { value: string }) => {
    onAssign(value);
    setAssignee(value);
  };
  const handleShowTimeline = () => setTab('timeline');
  const handleShowEvents = () => setTab('events');
  const handleDialogOpenChange = (next: boolean) => {
    if (!pending) setDialogOpen(next);
  };
  const handleConfirmFalsePositive = async () => {
    setPending(true);
    try {
      await markFalsePositive(INCIDENT.id);
      setStatus('false-positive');
      setDialogOpen(false);
      toast.create({ title: 'Marked as false positive', type: 'default' });
    } catch {
      toast.create({ title: "Couldn't mark as false positive", type: 'error' });
    } finally {
      setPending(false);
    }
  };
  const handleDraftChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
    setDraft(event.target.value);
  const handleAddComment = () => {
    const body = draft.trim();
    if (!body) return;
    onAddComment(body);
    setComments(prev => [
      ...prev,
      {
        id: `c-${prev.length + 1}`,
        author: assignee,
        role: 'Security analyst',
        body,
        at: new Date().toISOString(),
      },
    ]);
    setDraft('');
  };

  return (
    <Page name='incident-detail' fullSize fixedHeight data-testid='incident-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1 gap-6'>
          {isLoading ? (
            <>
              <Skeleton width='480px' height='28px' rounded={6} />
              <Skeleton width='320px' height='20px' rounded={6} />
            </>
          ) : (
            <>
              <PageTitle>{INCIDENT.title}</PageTitle>
              <HStack gap={8} data-testid='incident-meta'>
                <Badge color='red' type='solid'>
                  <ShieldAlert />
                  Critical
                </Badge>
                <Badge
                  variant='dotted'
                  type='secondary'
                  color={STATUS[status].color}
                  data-testid='incident-status'
                >
                  {STATUS[status].label}
                </Badge>
                <Text size='sm' color='secondary'>
                  {INCIDENT.id} · {INCIDENT.host} · opened
                </Text>
                <FormatDateTime value={INCIDENT.firstSeen} format='datetime' layout='inline' />
              </HStack>
            </>
          )}
        </PageHeaderGroup>
        <PageActions>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                color='neutral'
                size='medium'
                disabled={isLoading}
                data-testid='incident-assignee'
              >
                <Avatar size='sm'>
                  <AvatarFallback name={assignee} />
                </Avatar>
                {assignee}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Assignee</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={assignee} onValueChange={handleAssigneeChange}>
                {ANALYSTS.map(name => (
                  <DropdownMenuRadioItem key={name} value={name}>
                    {name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <SplitButton data-testid='incident-resolve'>
              <Button
                size='medium'
                disabled={isLoading}
                onClick={handleResolve}
                data-testid='incident-resolve-primary'
              >
                {isOpen ? <CircleCheck /> : null}
                {isOpen ? 'Resolve' : 'Reopen'}
              </Button>
              <DropdownMenuTrigger asChild>
                <Button
                  size='medium'
                  disabled={isLoading || !isOpen}
                  aria-label='More ways to resolve'
                  data-testid='incident-resolve-menu'
                >
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
            </SplitButton>
            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={handleOpenFalsePositive}
                data-testid='incident-false-positive'
              >
                <DropdownMenuItemIcon>
                  <Flag />
                </DropdownMenuItemIcon>
                <DropdownMenuItemText>Mark as false positive</DropdownMenuItemText>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleAcceptRisk}>
                <DropdownMenuItemIcon>
                  <ShieldCheck />
                </DropdownMenuItemIcon>
                <DropdownMenuItemText>Accept risk</DropdownMenuItemText>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleCreateTicket}>
                <DropdownMenuItemIcon>
                  <ExternalLink />
                </DropdownMenuItemIcon>
                <DropdownMenuItemText>Create Jira ticket</DropdownMenuItemText>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                color='neutral'
                size='medium'
                disabled={isLoading}
                aria-label='More actions'
              >
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={handleCopyLink}>
                <DropdownMenuItemIcon>
                  <Copy />
                </DropdownMenuItemIcon>
                <DropdownMenuItemText>Copy link</DropdownMenuItemText>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleExport}>
                <DropdownMenuItemIcon>
                  <Download />
                </DropdownMenuItemIcon>
                <DropdownMenuItemText>Export report</DropdownMenuItemText>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </PageActions>
      </PageHeader>

      <Tabs
        value={tab}
        onChange={setTab}
        className='flex min-h-0 flex-1 flex-col'
        data-testid='incident-tabs'
      >
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='timeline'>
            Timeline {!isLoading && <NumericBadge>{TIMELINE.length}</NumericBadge>}
          </TabsTrigger>
          <TabsTrigger value='events' data-testid='incident-tab-events'>
            Related events {!isLoading && <NumericBadge>{RELATED_EVENTS.length}</NumericBadge>}
          </TabsTrigger>
          <TabsTrigger value='comments'>
            Comments {!isLoading && <NumericBadge>{comments.length}</NumericBadge>}
          </TabsTrigger>
        </TabsList>

        <PageContent>
          <TabsContent value='overview'>
            <div className='grid grid-cols-[minmax(0,1fr)_400px] items-start gap-24'>
              <VStack gap={24}>
                {isOpen && !isLoading && (
                  <Alert color='destructive' data-testid='incident-alert'>
                    <AlertIcon />
                    <AlertContent>
                      <AlertTitle>Attack still in progress</AlertTitle>
                      <AlertDescription>
                        412 requests a minute from 4 addresses. Blocking mode is on for{' '}
                        {INCIDENT.host}, so none reach the application.
                      </AlertDescription>
                    </AlertContent>
                    <AlertControls>
                      <Button
                        variant='secondary'
                        color='neutral'
                        size='small'
                        onClick={handleShowEvents}
                      >
                        View related events
                      </Button>
                    </AlertControls>
                  </Alert>
                )}

                <VStack gap={12}>
                  <Heading as='h2' size='md' weight='medium'>
                    Details
                  </Heading>
                  <div
                    className='grid grid-cols-2 gap-x-8 gap-y-16 rounded-8 border border-border-primary-light p-16'
                    data-testid='incident-attributes'
                  >
                    <Attribute loading={isLoading}>
                      <AttributeLabel>Endpoint</AttributeLabel>
                      <AttributeValue>
                        <HStack gap={6}>
                          <HttpMethod method={INCIDENT.method} />
                          <InlineCodeSnippet code={INCIDENT.path} size='md' />
                        </HStack>
                      </AttributeValue>
                    </Attribute>
                    <Attribute loading={isLoading}>
                      <AttributeLabel>Host</AttributeLabel>
                      <AttributeValue>
                        <InlineCodeSnippet code={INCIDENT.host} size='md' />
                      </AttributeValue>
                    </Attribute>
                    <Attribute loading={isLoading}>
                      <AttributeLabel>Attack type</AttributeLabel>
                      <AttributeValue>
                        <HStack gap={4}>
                          <Badge type='secondary' color='slate' size='medium'>
                            SQL injection
                          </Badge>
                          <Badge type='secondary' color='slate' size='medium'>
                            CWE-89
                          </Badge>
                        </HStack>
                      </AttributeValue>
                    </Attribute>
                    <Attribute loading={isLoading}>
                      <AttributeLabel>Parameter</AttributeLabel>
                      <AttributeValue>
                        <InlineCodeSnippet code={INCIDENT.parameter} size='md' />
                      </AttributeValue>
                    </Attribute>
                    <Attribute loading={isLoading}>
                      <AttributeLabel>Detection rule</AttributeLabel>
                      <AttributeValue>
                        <InlineCodeSnippet code={INCIDENT.rule} size='md' />
                      </AttributeValue>
                    </Attribute>
                    <Attribute loading={isLoading}>
                      <AttributeLabel>Requests</AttributeLabel>
                      <AttributeValue>
                        <FormatNumber value={INCIDENT.requests} notation='standard' />
                      </AttributeValue>
                    </Attribute>
                    <Attribute loading={isLoading}>
                      <AttributeLabel>Blocked</AttributeLabel>
                      <AttributeValue>
                        <FormatNumber value={INCIDENT.blockedShare} type='percent' decimals={1} />
                      </AttributeValue>
                    </Attribute>
                    <Attribute loading={isLoading}>
                      <AttributeLabel>First seen</AttributeLabel>
                      <AttributeValue>
                        <FormatDateTime
                          value={INCIDENT.firstSeen}
                          format='datetime'
                          layout='inline'
                        />
                      </AttributeValue>
                    </Attribute>
                    <Attribute loading={isLoading}>
                      <AttributeLabel>Last seen</AttributeLabel>
                      <AttributeValue>
                        <FormatDateTime
                          value={INCIDENT.lastSeen}
                          format='datetime'
                          layout='inline'
                        />
                      </AttributeValue>
                    </Attribute>
                    <Attribute loading={isLoading} isEmpty={!isLoading}>
                      <AttributeLabel>Ticket</AttributeLabel>
                      <AttributeValue />
                    </Attribute>
                    <Attribute loading={isLoading} className='col-span-2'>
                      <AttributeLabel>Source IPs</AttributeLabel>
                      <AttributeValue>
                        <HStack gap={8}>
                          {INCIDENT.sourceIps.map(source => (
                            <Ip key={source.ip}>
                              <IpCountry code={source.country} />
                              <IpAddress>{source.ip}</IpAddress>
                            </Ip>
                          ))}
                        </HStack>
                      </AttributeValue>
                    </Attribute>
                  </div>
                </VStack>

                <VStack gap={12}>
                  <Heading as='h2' size='md' weight='medium'>
                    Description
                  </Heading>
                  {isLoading ? (
                    <VStack gap={8}>
                      <Skeleton width='100%' height='16px' rounded={4} />
                      <Skeleton width='72%' height='16px' rounded={4} />
                    </VStack>
                  ) : (
                    <Text size='sm'>
                      An automated scanner is sending SQL injection payloads in the customer_id
                      filter of the order search endpoint. Early requests returned 500 while the
                      host was in monitoring mode, which suggests the value reaches the database
                      unescaped. Since blocking was enabled every request is rejected, but the
                      parameter should be fixed at the source.
                    </Text>
                  )}
                </VStack>

                <VStack gap={12}>
                  <Heading as='h2' size='md' weight='medium'>
                    Sample request
                  </Heading>
                  {isLoading ? (
                    <Skeleton width='100%' height='160px' rounded={8} />
                  ) : (
                    <CodeSnippetRoot code={SAMPLE_REQUEST} language='text'>
                      <CodeSnippetHeader>
                        <CodeSnippetTitle>Request r-90412 · blocked</CodeSnippetTitle>
                        <CodeSnippetActions>
                          <CodeSnippetWrapButton />
                          <CodeSnippetCopyButton />
                        </CodeSnippetActions>
                      </CodeSnippetHeader>
                      <CodeSnippetContent>
                        <CodeSnippetLineNumbers />
                        <CodeSnippetCode />
                      </CodeSnippetContent>
                    </CodeSnippetRoot>
                  )}
                </VStack>
              </VStack>

              <Card className='h-auto' data-testid='incident-latest-activity'>
                <CardHeader>
                  <CardTitle>Latest activity</CardTitle>
                  <Button
                    variant='ghost'
                    color='neutral'
                    size='small'
                    disabled={isLoading}
                    onClick={handleShowTimeline}
                  >
                    View timeline
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <VStack gap={16}>
                      <Skeleton width='100%' height='40px' rounded={6} />
                      <Skeleton width='100%' height='40px' rounded={6} />
                      <Skeleton width='100%' height='40px' rounded={6} />
                    </VStack>
                  ) : (
                    <Timeline>
                      {TIMELINE.slice(0, 4).map(event => {
                        const Icon = INDICATOR[event.kind].icon;
                        return (
                          <TimelineItem key={event.id}>
                            <TimelineConnector>
                              <TimelineIndicator color={INDICATOR[event.kind].color}>
                                <Icon />
                              </TimelineIndicator>
                              <TimelineSeparator />
                            </TimelineConnector>
                            <TimelineContent>
                              <TimelineTitle>{event.title}</TimelineTitle>
                              <HStack gap={4}>
                                <FormatDateTime
                                  value={event.at}
                                  format='datetime'
                                  layout='inline'
                                />
                                <Text size='sm' color='secondary'>
                                  · {event.actor}
                                </Text>
                              </HStack>
                            </TimelineContent>
                          </TimelineItem>
                        );
                      })}
                    </Timeline>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='timeline'>
            <div className='max-w-[720px]'>
              <Timeline data-testid='incident-timeline'>
                {TIMELINE.map(event => {
                  const Icon = INDICATOR[event.kind].icon;
                  return (
                    <TimelineItem key={event.id}>
                      <TimelineConnector>
                        <TimelineIndicator color={INDICATOR[event.kind].color}>
                          <Icon />
                        </TimelineIndicator>
                        <TimelineSeparator />
                      </TimelineConnector>
                      <TimelineContent>
                        <TimelineTitle>{event.title}</TimelineTitle>
                        <TimelineDescription>{event.description}</TimelineDescription>
                        <HStack gap={4}>
                          <FormatDateTime value={event.at} format='datetime' layout='inline' />
                          <Text size='sm' color='secondary'>
                            · {event.actor}
                          </Text>
                        </HStack>
                      </TimelineContent>
                    </TimelineItem>
                  );
                })}
              </Timeline>
            </div>
          </TabsContent>

          <TabsContent value='events'>
            <Table
              aria-label='Related events'
              data={RELATED_EVENTS}
              columns={eventColumns}
              getRowId={getItemId}
              isLoading={isLoading}
              data-testid='incident-events-table'
            />
          </TabsContent>

          <TabsContent value='comments'>
            <VStack gap={24} className='max-w-[720px]' data-testid='incident-comments'>
              {comments.map(comment => (
                <VStack key={comment.id} gap={8}>
                  <HStack justify='between'>
                    <Avatar size='md'>
                      <AvatarFallback name={comment.author} />
                      <AvatarContent>
                        <AvatarName>{comment.author}</AvatarName>
                        <AvatarDescription>{comment.role}</AvatarDescription>
                      </AvatarContent>
                    </Avatar>
                    <FormatDateTime value={comment.at} format='datetime' layout='inline' />
                  </HStack>
                  <Text size='sm'>{comment.body}</Text>
                </VStack>
              ))}
              <VStack gap={12}>
                <Field>
                  <FieldLabel>Add a comment</FieldLabel>
                  <Textarea
                    value={draft}
                    onChange={handleDraftChange}
                    minRows={3}
                    placeholder='Share findings or next steps with the team'
                    data-testid='incident-comment-input'
                  />
                </Field>
                <HStack justify='end'>
                  <Button size='medium' disabled={!draft.trim()} onClick={handleAddComment}>
                    <MessageSquare />
                    Comment
                  </Button>
                </HStack>
              </VStack>
            </VStack>
          </TabsContent>
        </PageContent>
      </Tabs>

      <Dialog
        width={400}
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        data-testid='false-positive-dialog'
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as false positive?</DialogTitle>
            <DialogDescription>
              This closes {INCIDENT.id} and adds a rule exception for {INCIDENT.method}{' '}
              {INCIDENT.path}, so matching requests stop raising incidents. You can reopen it later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='ghost' color='neutral'>
                Cancel
              </Button>
            </DialogClose>
            <Button
              loading={pending}
              onClick={handleConfirmFalsePositive}
              data-testid='false-positive-confirm'
            >
              Mark as false positive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
};

/**
 * The Timeline tab: every entry newest first, each with an indicator colored by who acted
 * (detection, system, person, resolution), a description, the time and the actor.
 */
export const TimelineTab = Default.bind({});
TimelineTab.args = { initialTab: 'timeline' };

/**
 * First load: header skeletons, disabled actions, tabs without counts, `Attribute loading`
 * rows and skeleton blocks where the description, request and activity card will land.
 */
export const Loading = Default.bind({});
Loading.args = { isLoading: true };
