import { type MouseEvent, useRef, useState } from 'react';

import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { fn } from 'storybook/test';

import {
  ApprovalCard,
  ApprovalCardActions,
  ApprovalCardContent,
  type ApprovalCardStatus,
} from '../../components/ApprovalCard';
import {
  AppShell,
  AppShellAside,
  AppShellHeader,
  AppShellRail,
  AppShellRemote,
} from '../../components/AppShell';
import {
  AssistantMessage,
  AssistantMessageContent,
  AssistantMessageMarkdown,
} from '../../components/AssistantMessage';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { ChainOfThought, ChainOfThoughtStep } from '../../components/ChainOfThought';
import {
  Chat,
  ChatFooter,
  ChatHeader,
  ChatHeaderActions,
  ChatHeaderTitle,
  ChatSuggestion,
  ChatSuggestions,
  ChatTrigger,
} from '../../components/Chat';
import { ChatInput, ChatInputSubmit, ChatInputTextarea } from '../../components/ChatInput';
import {
  ChatPermissions,
  ChatPermissionsContent,
  ChatPermissionsItem,
  type ChatPermissionsItemCheckedChangeDetails,
  ChatPermissionsTrigger,
} from '../../components/ChatPermissions';
import { InlineCodeSnippet } from '../../components/CodeSnippet';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '../../components/Conversation';
import { Copyable, CopyableIcon } from '../../components/Copyable';
import type { CountryCode } from '../../components/Country';
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
import { FormatDateTime } from '../../components/FormatDateTime';
import { HttpMethod } from '../../components/HttpMethod';
import { Ip, IpAddress, IpCountry } from '../../components/Ip';
import { Logo } from '../../components/Logo';
import { MessageAction, MessageActions, MessageTimestamp } from '../../components/MessageActions';
import {
  NavRail,
  NavRailBody,
  NavRailFooter,
  NavRailItem,
  NavRailSeparator,
} from '../../components/NavRail';
import {
  NotificationCenter,
  NotificationCenterBody,
  NotificationCenterContent,
  NotificationCenterEmpty,
  NotificationCenterHeader,
  NotificationCenterTitle,
  NotificationCenterTrigger,
} from '../../components/NotificationCenter';
import { NumericBadge } from '../../components/NumericBadge';
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
  SelectButton,
  SelectContent,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
} from '../../components/Select';
import { Separator } from '../../components/Separator';
import { HStack, VStack } from '../../components/Stack';
import type { TableCellContext, TableColumnDef, TableRow } from '../../components/Table';
import { Table, TableEmptyState } from '../../components/Table';
import { TagClose } from '../../components/Tag';
import { Text } from '../../components/Text';
import {
  TopHeader,
  TopHeaderActions,
  TopHeaderLogo,
  TopHeaderSeparator,
} from '../../components/TopHeader';
import { UserMessage, UserMessageBubble } from '../../components/UserMessage';
import {
  Brain,
  CheckCheck,
  ChevronUpDown,
  CircleHelp,
  Cloud,
  Database,
  Ellipsis,
  FilterX,
  FlaskConical,
  Globe,
  History,
  Home,
  LogOut,
  MessageSquare,
  Plus,
  Quote,
  Search,
  SearchX,
  Settings,
  ShieldBan,
  ThumbsDown,
  ThumbsUp,
  UserRound,
  X,
} from '../../icons';

// ---------------------------------------------------------------------------
// Mock data. Every host, network and address is fictional.
// ---------------------------------------------------------------------------

type AttackStatus = 'blocked' | 'monitored';

interface AttackEvent {
  id: string;
  type: string;
  method: string;
  path: string;
  sourceIp: string;
  country: CountryCode;
  hits: number;
  status: AttackStatus;
  lastSeen: string;
}

const ATTACKS: AttackEvent[] = [
  {
    id: 'atk-90412',
    type: 'Brute force',
    method: 'POST',
    path: '/api/v2/auth/login',
    sourceIp: '203.0.113.24',
    country: 'NL',
    hits: 11902,
    status: 'blocked',
    lastSeen: '2026-11-06T13:58:00Z',
  },
  {
    id: 'atk-90407',
    type: 'Brute force',
    method: 'POST',
    path: '/api/v2/auth/login',
    sourceIp: '198.51.100.12',
    country: 'DE',
    hits: 4377,
    status: 'blocked',
    lastSeen: '2026-11-06T13:57:00Z',
  },
  {
    id: 'atk-90398',
    type: 'SQL injection',
    method: 'GET',
    path: '/api/v2/products/search',
    sourceIp: '198.51.100.77',
    country: 'US',
    hits: 1201,
    status: 'blocked',
    lastSeen: '2026-11-06T13:41:00Z',
  },
  {
    id: 'atk-90391',
    type: 'Credential stuffing',
    method: 'POST',
    path: '/api/v2/auth/token',
    sourceIp: '203.0.113.91',
    country: 'NL',
    hits: 864,
    status: 'blocked',
    lastSeen: '2026-11-06T13:36:00Z',
  },
  {
    id: 'atk-90385',
    type: 'BOLA',
    method: 'GET',
    path: '/api/v2/orders/{id}',
    sourceIp: '198.51.100.140',
    country: 'BR',
    hits: 312,
    status: 'monitored',
    lastSeen: '2026-11-06T13:22:00Z',
  },
  {
    id: 'atk-90377',
    type: 'Path traversal',
    method: 'GET',
    path: '/static/../../etc/passwd',
    sourceIp: '203.0.113.7',
    country: 'SG',
    hits: 148,
    status: 'blocked',
    lastSeen: '2026-11-06T13:10:00Z',
  },
  {
    id: 'atk-90366',
    type: 'XSS',
    method: 'POST',
    path: '/api/v2/reviews',
    sourceIp: '198.51.100.33',
    country: 'FR',
    hits: 96,
    status: 'monitored',
    lastSeen: '2026-11-06T12:54:00Z',
  },
  {
    id: 'atk-90351',
    type: 'GraphQL batching',
    method: 'POST',
    path: '/graphql',
    sourceIp: '203.0.113.150',
    country: 'PL',
    hits: 57,
    status: 'monitored',
    lastSeen: '2026-11-06T12:31:00Z',
  },
];

const ATTACK_STATUS = {
  blocked: { label: 'Blocked', color: 'green' },
  monitored: { label: 'Monitored', color: 'yellow' },
} as const;

const THREADS = createListCollection({
  items: [
    { value: 'spike', label: 'Attack spike on api.shop-demo.io' },
    { value: 'rules', label: 'Tune the SQLi rule for /search' },
    { value: 'report', label: 'Weekly API risk report' },
  ],
});

const TOOLS = [
  { name: 'search_attacks', description: 'Search attacks and blocked requests' },
  { name: 'get_ip_reputation', description: 'Look up an address or network' },
  { name: 'propose_denylist_entry', description: 'Propose adding networks to the denylist' },
];

const TOOL_DEFAULTS: Record<string, boolean> = {
  search_attacks: true,
  get_ip_reputation: true,
  propose_denylist_entry: true,
};

const LANDING_PROMPTS = [
  'Investigate the attack spike in the last hour',
  'Which endpoints leak sensitive data?',
  'Summarize blocked requests for api.shop-demo.io',
  'Explain why 203.0.113.24 was blocked',
];

const DOCKED_FOLLOW_UPS = ['Show requests from 203.0.113.24', 'Deny this network for 24h'];

const QUESTION = 'Attacks on api.shop-demo.io jumped an hour ago. What is going on?';

const SUMMARY = `Attack volume is **14× the 7-day baseline** since 13:05 UTC. 92% of it targets the login endpoint, every request was blocked, and none reached the application.

| Source | Requests | Share |
| :--- | ---: | ---: |
| \`203.0.113.0/24\` | 11,902 | 65% |
| \`198.51.100.0/24\` | 4,377 | 24% |

Both networks belong to one hosting provider and sent no legitimate traffic to this application in the last 30 days. I suggest denying them for 24 hours.`;

const STREAMING_SUMMARY = `Attack volume is **14× the 7-day baseline** since 13:05 UTC. 92% of it targets the login endpoint, every request was`;

const DOCKED_QUESTION = 'Who is behind the brute force on /api/v2/auth/login?';

const DOCKED_ANSWER = `Two networks of one hosting provider: \`203.0.113.0/24\` (65%) and \`198.51.100.0/24\` (24%). They rotate addresses every few minutes and send the same user agent, a typical credential-testing botnet.

All **16,279** requests were blocked by the brute-force trigger; no account was locked out.`;

const EDGE_NAV: NavConfig = {
  productLabel: 'Edge',
  productPath: '/edge',
  items: [
    { type: 'link', id: 'attacks', label: 'Attacks', path: 'attacks' },
    { type: 'link', id: 'incidents', label: 'Incidents', path: 'incidents' },
  ],
};

const onNavigate = fn().mockName('onNavigate');
const onNewChat = fn().mockName('onNewChat');
const onOpenHistory = fn().mockName('onOpenHistory');
const onSignOut = fn().mockName('onSignOut');

const getAttackId = (attack: AttackEvent) => attack.id;

const meta = {
  title: 'Templates/AI assistant',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when building an AI security assistant screen: a full-page Wally conversation with reasoning and approvals, or Wally docked beside a product page.',
      },
    },
  },
} satisfies Meta;

export default meta;

/**
 * The full-page assistant. The analyst asks about an attack spike; Wally shows its reasoning as
 * a `ChainOfThought`, answers with a markdown summary and a table, and proposes a denylist
 * change. The `ApprovalCard` is docked above the composer while the run waits, with Send
 * disabled and the log not busy; Allow or Reject resolves it in place and Wally confirms the outcome.
 */
export const Default: StoryFn = () => {
  const [value, setValue] = useState('');
  const [thread, setThread] = useState(['spike']);
  const [approval, setApproval] = useState<ApprovalCardStatus>('pending');
  const [allowed, setAllowed] = useState(TOOL_DEFAULTS);
  const pending = approval === 'pending';

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onNavigate(event.currentTarget.getAttribute('href'));
  };
  const handleThreadChange = ({ value: next }: { value: string[] }) => setThread(next);
  const handleSubmit = () => setValue('');
  const handleApprove = () => setApproval('approved');
  const handleReject = () => setApproval('rejected');
  const handlePermissionChange = ({ checked, name }: ChatPermissionsItemCheckedChangeDetails) =>
    setAllowed(previous => ({ ...previous, [name]: checked }));

  return (
    <AppShell data-testid='app-shell'>
      <AppShellHeader>
        <TopHeader>
          <TopHeaderLogo href='/' onClick={handleNavClick}>
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
            <NavRailItem href='/' icon={Home} label='Home' onClick={handleNavClick} />
            <NavRailItem
              href='/assistant'
              icon={MessageSquare}
              label='Ask Wally'
              active
              onClick={handleNavClick}
            />
            <NavRailSeparator />
            <NavRailItem href='/edge' icon={Cloud} label='Edge' onClick={handleNavClick} />
            <NavRailItem
              href='/security-testing'
              icon={FlaskConical}
              label='Security Testing'
              onClick={handleNavClick}
            />
          </NavRailBody>
          <NavRailFooter>
            <NavRailItem
              href='/settings'
              icon={Settings}
              label='Settings'
              onClick={handleNavClick}
            />
            <DropdownMenu positioning={{ placement: 'right-end', gutter: 6 }}>
              <DropdownMenuTrigger>
                <NavRailItem icon={UserRound} label='Alex Morgan' avatar />
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-200'>
                <DropdownMenuItem onSelect={onSignOut}>
                  <DropdownMenuItemIcon>
                    <LogOut />
                  </DropdownMenuItemIcon>
                  <DropdownMenuItemText>Sign out</DropdownMenuItemText>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </NavRailFooter>
        </NavRail>
      </AppShellRail>

      <AppShellRemote role='main'>
        <Chat data-testid='wally-chat'>
          <ChatHeader>
            <ChatHeaderTitle>
              <Select collection={THREADS} value={thread} onValueChange={handleThreadChange}>
                <SelectButton variant='ghost' size='small' placeholder='New chat' />
                <SelectPositioner>
                  <SelectContent>
                    {THREADS.items.map(item => (
                      <SelectOption key={item.value} item={item}>
                        <SelectOptionText>{item.label}</SelectOptionText>
                        <SelectOptionIndicator />
                      </SelectOption>
                    ))}
                  </SelectContent>
                </SelectPositioner>
              </Select>
            </ChatHeaderTitle>
            <ChatHeaderActions>
              <Button
                variant='ghost'
                color='neutral'
                size='small'
                aria-label='New chat'
                onClick={onNewChat}
              >
                <Plus />
              </Button>
              <Separator orientation='vertical' />
              <Button
                variant='ghost'
                color='neutral'
                size='small'
                aria-label='Chat history'
                onClick={onOpenHistory}
              >
                <History />
              </Button>
              <DropdownMenu positioning={{ placement: 'bottom-end' }}>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' color='neutral' size='small' aria-label='More actions'>
                    <Ellipsis />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Rename chat</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant='destructive'>Delete chat</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ChatHeaderActions>
          </ChatHeader>

          <Conversation autoScrollKey='q-1'>
            <ConversationContent contentClassName='mx-auto w-full max-w-768'>
              <UserMessage data-testid='wally-question'>
                <UserMessageBubble>{QUESTION}</UserMessageBubble>
                <MessageActions>
                  <MessageTimestamp dateTime='2026-11-06T14:02:00Z'>14:02</MessageTimestamp>
                  <Copyable text={QUESTION}>
                    <MessageAction aria-label='Copy'>
                      <CopyableIcon />
                    </MessageAction>
                  </Copyable>
                </MessageActions>
              </UserMessage>

              <AssistantMessage data-testid='wally-answer'>
                <ChainOfThought>
                  <ChainOfThoughtStep icon={<Brain />} label='Thought for 4s'>
                    <p>
                      Pull attacks on api.shop-demo.io for the last two hours, compare them with the
                      7-day baseline, then group by source network and target endpoint.
                    </p>
                  </ChainOfThoughtStep>
                  <ChainOfThoughtStep
                    icon={<Search />}
                    label='Searched attacks on api.shop-demo.io'
                    metric='18,420'
                  />
                  <ChainOfThoughtStep
                    icon={<Database />}
                    label='Grouped by source network'
                    metric='3 networks'
                  />
                  <ChainOfThoughtStep
                    icon={<Globe />}
                    label='Checked IP reputation'
                    metric='hosting'
                  />
                  <ChainOfThoughtStep
                    icon={<ShieldBan />}
                    label='Proposed a denylist entry'
                    status={pending ? 'running' : 'done'}
                  />
                </ChainOfThought>
                <AssistantMessageContent>
                  <AssistantMessageMarkdown text={SUMMARY} />
                </AssistantMessageContent>
                <MessageActions visible>
                  <Copyable text={SUMMARY}>
                    <MessageAction aria-label='Copy'>
                      <CopyableIcon />
                    </MessageAction>
                  </Copyable>
                  <MessageAction aria-label='Good response'>
                    <ThumbsUp />
                  </MessageAction>
                  <MessageAction aria-label='Bad response'>
                    <ThumbsDown />
                  </MessageAction>
                  <MessageTimestamp dateTime='2026-11-06T14:02:00Z'>14:02</MessageTimestamp>
                </MessageActions>
              </AssistantMessage>

              {!pending && (
                <AssistantMessage data-testid='wally-outcome'>
                  <AssistantMessageContent>
                    <p>
                      {approval === 'approved'
                        ? 'Done. 203.0.113.0/24 and 198.51.100.0/24 are denied on api.shop-demo.io until 14:03 UTC tomorrow.'
                        : 'Okay, I left the denylist unchanged. The brute-force trigger keeps blocking these requests.'}
                    </p>
                  </AssistantMessageContent>
                </AssistantMessage>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <ChatFooter className='mx-auto w-full max-w-800'>
            <ApprovalCard status={approval} data-testid='wally-approval'>
              <ApprovalCardContent>
                <p>
                  Add <InlineCodeSnippet code='203.0.113.0/24' size='sm' /> and{' '}
                  <InlineCodeSnippet code='198.51.100.0/24' size='sm' /> to the denylist on
                  api.shop-demo.io for 24 hours
                </p>
              </ApprovalCardContent>
              <ApprovalCardActions>
                <Button data-testid='wally-approve' onClick={handleApprove}>
                  Allow
                </Button>
                <Button
                  variant='secondary'
                  color='neutral'
                  data-testid='wally-reject'
                  onClick={handleReject}
                >
                  Reject
                </Button>
              </ApprovalCardActions>
            </ApprovalCard>
            <ChatInput value={value} onValueChange={setValue} onSubmit={handleSubmit}>
              <ChatInputTextarea />
              <ChatPermissions>
                <ChatPermissionsTrigger />
                <ChatPermissionsContent>
                  {TOOLS.map(tool => (
                    <ChatPermissionsItem
                      key={tool.name}
                      name={tool.name}
                      title={tool.name}
                      description={tool.description}
                      checked={allowed[tool.name]}
                      onCheckedChange={handlePermissionChange}
                    />
                  ))}
                </ChatPermissionsContent>
              </ChatPermissions>
              {/* The run waits on the approval, not on the model: Send is off, there is nothing to stop. */}
              <ChatInputSubmit disabled={pending} />
            </ChatInput>
          </ChatFooter>
        </Chat>
      </AppShellRemote>
    </AppShell>
  );
};

/**
 * Wally docked beside a product page. The Attacks page keeps its own header, toolbar and table;
 * `AppShellAside` holds the chat and the header's `ChatTrigger` toggles it. "Ask Wally" in a row's
 * master-cell menu attaches the attack to the composer as a context chip and marks the row active.
 */
export const DockedPanel: StoryFn = () => {
  const [pathname, setPathname] = useState('/edge/attacks');
  const [asideOpen, setAsideOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [contextId, setContextId] = useState<string | null>('atk-90412');
  const [value, setValue] = useState('');
  const toggleRef = useRef<HTMLButtonElement>(null);

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onNavigate(event.currentTarget.getAttribute('href'));
  };
  const handleNavigate = (to: string) => {
    onNavigate(to);
    setPathname(to);
  };
  const handleAssistantToggle = () => setAsideOpen(open => !open);
  const handleCloseChat = () => {
    // Focus inside the panel would drop to <body> once it hides: hand it back to the toggle.
    toggleRef.current?.focus();
    setAsideOpen(false);
  };
  const handleContextRemove = () => setContextId(null);
  const handleSuggestionClick = (event: MouseEvent<HTMLButtonElement>) =>
    setValue(event.currentTarget.value);
  const handleSubmit = () => setValue('');
  const handleReset = () => {
    setQuery('');
    setStatus('all');
  };

  const renderAttack = ({ row }: TableCellContext<AttackEvent, unknown>) => (
    <VStack gap={2}>
      <Text size='sm' weight='medium' truncate>
        {row.original.type}
      </Text>
      <HStack gap={6}>
        <HttpMethod method={row.original.method} size='small' />
        <Text size='xs' color='secondary' truncate>
          {row.original.path}
        </Text>
      </HStack>
    </VStack>
  );

  const renderSource = ({ row }: TableCellContext<AttackEvent, unknown>) => (
    <Ip>
      <IpCountry code={row.original.country} />
      <IpAddress>{row.original.sourceIp}</IpAddress>
    </Ip>
  );

  const renderHits = ({ row }: TableCellContext<AttackEvent, unknown>) => row.original.hits;

  const renderStatus = ({ row }: TableCellContext<AttackEvent, unknown>) => (
    <Badge variant='dotted' type='secondary' color={ATTACK_STATUS[row.original.status].color}>
      {ATTACK_STATUS[row.original.status].label}
    </Badge>
  );

  const renderLastSeen = ({ row }: TableCellContext<AttackEvent, unknown>) => (
    <FormatDateTime value={row.original.lastSeen} format='datetime' />
  );

  const renderMenuAction = (row: TableRow<AttackEvent>) => {
    const attack = row.original;
    const handleAsk = () => {
      setContextId(attack.id);
      setAsideOpen(true);
    };

    return (
      <DropdownMenu data-testid='attacks-row-menu'>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            color='neutral'
            size='small'
            aria-label={`Actions for ${attack.type} from ${attack.sourceIp}`}
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={handleAsk}>
            <DropdownMenuItemIcon>
              <MessageSquare />
            </DropdownMenuItemIcon>
            <DropdownMenuItemText>Ask Wally</DropdownMenuItemText>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const columns: TableColumnDef<AttackEvent>[] = [
    {
      accessorKey: 'type',
      header: 'Attack',
      size: 320,
      cell: renderAttack,
      meta: { renderMenuAction },
    },
    { accessorKey: 'sourceIp', header: 'Source', size: 180, cell: renderSource },
    { accessorKey: 'hits', header: 'Hits', size: 100, cell: renderHits },
    { accessorKey: 'status', header: 'Status', size: 140, cell: renderStatus },
    { accessorKey: 'lastSeen', header: 'Last seen', size: 200, cell: renderLastSeen },
  ];

  const search = query.trim().toLowerCase();
  const matching = ATTACKS.filter(
    attack =>
      attack.type.toLowerCase().includes(search) ||
      attack.path.toLowerCase().includes(search) ||
      attack.sourceIp.includes(search),
  );
  const counts = {
    all: matching.length,
    blocked: matching.filter(attack => attack.status === 'blocked').length,
    monitored: matching.filter(attack => attack.status === 'monitored').length,
  };
  const rows = status === 'all' ? matching : matching.filter(attack => attack.status === status);
  const contextAttack = ATTACKS.find(attack => attack.id === contextId);

  return (
    <AppShell data-testid='app-shell'>
      <AppShellHeader>
        <TopHeader>
          <TopHeaderLogo href='/' onClick={handleNavClick}>
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
            <ChatTrigger
              ref={toggleRef}
              aria-pressed={asideOpen}
              onClick={handleAssistantToggle}
              data-testid='wally-toggle'
            />
            <NotificationCenter data-testid='notifications'>
              <NotificationCenterTrigger />
              <NotificationCenterContent>
                <NotificationCenterHeader>
                  <NotificationCenterTitle />
                </NotificationCenterHeader>
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
              </NotificationCenterContent>
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
            <NavRailItem href='/' icon={Home} label='Home' onClick={handleNavClick} />
            <NavRailItem
              href='/assistant'
              icon={MessageSquare}
              label='Ask Wally'
              onClick={handleNavClick}
            />
            <NavRailSeparator />
            <NavRailItem href='/edge' icon={Cloud} label='Edge' active onClick={handleNavClick} />
            <NavRailItem
              href='/security-testing'
              icon={FlaskConical}
              label='Security Testing'
              onClick={handleNavClick}
            />
          </NavRailBody>
          <NavRailFooter>
            <NavRailItem
              href='/settings'
              icon={Settings}
              label='Settings'
              onClick={handleNavClick}
            />
            <DropdownMenu positioning={{ placement: 'right-end', gutter: 6 }}>
              <DropdownMenuTrigger>
                <NavRailItem icon={UserRound} label='Alex Morgan' avatar />
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-200'>
                <DropdownMenuItem onSelect={onSignOut}>
                  <DropdownMenuItemIcon>
                    <LogOut />
                  </DropdownMenuItemIcon>
                  <DropdownMenuItemText>Sign out</DropdownMenuItemText>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </NavRailFooter>
        </NavRail>
      </AppShellRail>

      <AppShellRemote role='main'>
        <RemoteShell
          config={EDGE_NAV}
          basePath='/edge'
          pathname={pathname}
          onNavigate={handleNavigate}
        >
          <RemoteShellBreadcrumb />
          <RemoteShellContent>
            <Page name='edge-attacks' fullSize fixedHeight data-testid='attacks-page'>
              <PageHeader>
                <PageHeaderGroup className='flex-1'>
                  <PageTitle>Attacks</PageTitle>
                  <PageDescription>
                    Malicious requests detected on api.shop-demo.io, grouped by attack and source.
                  </PageDescription>
                </PageHeaderGroup>
              </PageHeader>

              <PageToolbar>
                <SearchInput
                  value={query}
                  onChange={setQuery}
                  placeholder='Search attack, endpoint or IP'
                  className='w-[320px]'
                  data-testid='attacks-search'
                />
                <SegmentedTabs value={status} onChange={setStatus}>
                  <SegmentedTabsList>
                    <SegmentedTabsTrigger value='all'>
                      All <NumericBadge>{counts.all}</NumericBadge>
                    </SegmentedTabsTrigger>
                    <SegmentedTabsTrigger value='blocked'>
                      Blocked <NumericBadge>{counts.blocked}</NumericBadge>
                    </SegmentedTabsTrigger>
                    <SegmentedTabsTrigger value='monitored'>
                      Monitored <NumericBadge>{counts.monitored}</NumericBadge>
                    </SegmentedTabsTrigger>
                  </SegmentedTabsList>
                </SegmentedTabs>
              </PageToolbar>

              <PageContent>
                <Table
                  aria-label='Attacks'
                  data={rows}
                  columns={columns}
                  getRowId={getAttackId}
                  activeRowId={contextId}
                  data-testid='attacks-table'
                >
                  <TableEmptyState>
                    <EmptyState type='collection-empty'>
                      <EmptyStateIllustration>
                        <SearchX />
                      </EmptyStateIllustration>
                      <EmptyStateMessage>
                        <EmptyStateTitle>No results found</EmptyStateTitle>
                        <EmptyStateDescription>
                          No attacks match your search or status.
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
            </Page>
          </RemoteShellContent>
        </RemoteShell>
      </AppShellRemote>

      <AppShellAside open={asideOpen} aria-label='Wally'>
        <Chat className='min-h-0 flex-1' data-testid='wally-chat'>
          <ChatHeader>
            <ChatHeaderTitle />
            <ChatHeaderActions>
              <Button
                variant='ghost'
                color='neutral'
                size='small'
                aria-label='New chat'
                onClick={onNewChat}
              >
                <Plus />
              </Button>
              <Button
                variant='ghost'
                color='neutral'
                size='small'
                aria-label='Chat history'
                onClick={onOpenHistory}
              >
                <History />
              </Button>
              <Separator orientation='vertical' />
              <Button
                variant='ghost'
                color='neutral'
                size='small'
                aria-label='Close chat'
                onClick={handleCloseChat}
                data-testid='wally-close'
              >
                <X />
              </Button>
            </ChatHeaderActions>
          </ChatHeader>

          <Conversation autoScrollKey='q-1'>
            <ConversationContent>
              <UserMessage>
                <UserMessageBubble>{DOCKED_QUESTION}</UserMessageBubble>
                <MessageActions>
                  <MessageTimestamp dateTime='2026-11-06T14:05:00Z'>14:05</MessageTimestamp>
                </MessageActions>
              </UserMessage>
              <AssistantMessage>
                <ChainOfThought>
                  <ChainOfThoughtStep
                    icon={<Search />}
                    label='Searched attacks on /api/v2/auth/login'
                    metric='16,279'
                  />
                  <ChainOfThoughtStep icon={<Globe />} label='Checked IP reputation' />
                </ChainOfThought>
                <AssistantMessageContent>
                  <AssistantMessageMarkdown text={DOCKED_ANSWER} />
                </AssistantMessageContent>
                <MessageActions visible>
                  <Copyable text={DOCKED_ANSWER}>
                    <MessageAction aria-label='Copy'>
                      <CopyableIcon />
                    </MessageAction>
                  </Copyable>
                  <MessageAction aria-label='Good response'>
                    <ThumbsUp />
                  </MessageAction>
                  <MessageAction aria-label='Bad response'>
                    <ThumbsDown />
                  </MessageAction>
                  <MessageTimestamp dateTime='2026-11-06T14:05:00Z'>14:05</MessageTimestamp>
                </MessageActions>
              </AssistantMessage>
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <ChatFooter>
            <ChatSuggestions label='Suggestions'>
              {DOCKED_FOLLOW_UPS.map(text => (
                <ChatSuggestion key={text} value={text} onClick={handleSuggestionClick}>
                  {text}
                </ChatSuggestion>
              ))}
            </ChatSuggestions>
            <ChatInput
              value={value}
              onValueChange={setValue}
              onSubmit={handleSubmit}
              data-testid='wally-input'
              context={
                contextAttack && (
                  <Badge type='secondary' color='blue' data-testid='wally-context'>
                    <Quote />
                    {contextAttack.type} · {contextAttack.sourceIp}
                    <TagClose
                      aria-label={`Remove ${contextAttack.type} from context`}
                      className='rounded-4 focus-visible:ring-3 focus-visible:ring-focus-primary'
                      onClick={handleContextRemove}
                    />
                  </Badge>
                )
              }
            >
              <ChatInputTextarea />
              <ChatInputSubmit />
            </ChatInput>
          </ChatFooter>
        </Chat>
      </AppShellAside>
    </AppShell>
  );
};

/**
 * A reply in flight. The finished steps stay, the current one shimmers, and the summary streams
 * in through `AssistantMessageMarkdown streaming`. `aria-busy` marks the log and the message,
 * and the submit turns into Stop; Stop (or Esc in the textarea) ends the run.
 */
export const Streaming: StoryFn = () => {
  const [value, setValue] = useState('');
  const [isRunning, setIsRunning] = useState(true);

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onNavigate(event.currentTarget.getAttribute('href'));
  };
  const handleSubmit = () => setValue('');
  const handleStop = () => setIsRunning(false);

  return (
    <AppShell data-testid='app-shell'>
      <AppShellHeader>
        <TopHeader>
          <TopHeaderLogo href='/' onClick={handleNavClick}>
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
            <NavRailItem href='/' icon={Home} label='Home' onClick={handleNavClick} />
            <NavRailItem
              href='/assistant'
              icon={MessageSquare}
              label='Ask Wally'
              active
              onClick={handleNavClick}
            />
            <NavRailSeparator />
            <NavRailItem href='/edge' icon={Cloud} label='Edge' onClick={handleNavClick} />
            <NavRailItem
              href='/security-testing'
              icon={FlaskConical}
              label='Security Testing'
              onClick={handleNavClick}
            />
          </NavRailBody>
          <NavRailFooter>
            <NavRailItem
              href='/settings'
              icon={Settings}
              label='Settings'
              onClick={handleNavClick}
            />
            <DropdownMenu positioning={{ placement: 'right-end', gutter: 6 }}>
              <DropdownMenuTrigger>
                <NavRailItem icon={UserRound} label='Alex Morgan' avatar />
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-200'>
                <DropdownMenuItem onSelect={onSignOut}>
                  <DropdownMenuItemIcon>
                    <LogOut />
                  </DropdownMenuItemIcon>
                  <DropdownMenuItemText>Sign out</DropdownMenuItemText>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </NavRailFooter>
        </NavRail>
      </AppShellRail>

      <AppShellRemote role='main'>
        <Chat data-testid='wally-chat'>
          <ChatHeader>
            <ChatHeaderTitle />
            <ChatHeaderActions>
              <Button
                variant='ghost'
                color='neutral'
                size='small'
                aria-label='New chat'
                onClick={onNewChat}
              >
                <Plus />
              </Button>
              <Button
                variant='ghost'
                color='neutral'
                size='small'
                aria-label='Chat history'
                onClick={onOpenHistory}
              >
                <History />
              </Button>
            </ChatHeaderActions>
          </ChatHeader>

          <Conversation autoScrollKey='q-1'>
            <ConversationContent aria-busy={isRunning} contentClassName='mx-auto w-full max-w-768'>
              <UserMessage>
                <UserMessageBubble>{QUESTION}</UserMessageBubble>
                <MessageActions>
                  <MessageTimestamp dateTime='2026-11-06T14:02:00Z'>14:02</MessageTimestamp>
                </MessageActions>
              </UserMessage>
              <AssistantMessage data-testid='wally-answer' aria-busy={isRunning}>
                <ChainOfThought>
                  <ChainOfThoughtStep icon={<Brain />} label='Thought for 4s' />
                  <ChainOfThoughtStep
                    icon={<Search />}
                    label='Searched attacks on api.shop-demo.io'
                    metric='18,420'
                  />
                  <ChainOfThoughtStep
                    icon={<Database />}
                    label={isRunning ? 'Grouping by source network...' : 'Stopped'}
                    status={isRunning ? 'running' : 'done'}
                    data-testid='wally-current-step'
                  />
                </ChainOfThought>
                <AssistantMessageContent>
                  <AssistantMessageMarkdown text={STREAMING_SUMMARY} streaming={isRunning} />
                </AssistantMessageContent>
              </AssistantMessage>
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <ChatFooter className='mx-auto w-full max-w-800'>
            <ChatInput
              value={value}
              onValueChange={setValue}
              onSubmit={handleSubmit}
              isRunning={isRunning}
              onStop={handleStop}
            >
              <ChatInputTextarea />
              <ChatInputSubmit data-testid='wally-submit' />
            </ChatInput>
          </ChatFooter>
        </Chat>
      </AppShellRemote>
    </AppShell>
  );
};

/**
 * The landing state before the first message: Wally greets over the `strong` background with
 * suggested prompts. A prompt fills the composer, where the tool permissions sit before Send.
 */
export const Empty: StoryFn = () => {
  const [value, setValue] = useState('');
  const [allowed, setAllowed] = useState(TOOL_DEFAULTS);

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onNavigate(event.currentTarget.getAttribute('href'));
  };
  const handlePromptClick = (event: MouseEvent<HTMLButtonElement>) =>
    setValue(event.currentTarget.value);
  const handleSubmit = () => setValue('');
  const handlePermissionChange = ({ checked, name }: ChatPermissionsItemCheckedChangeDetails) =>
    setAllowed(previous => ({ ...previous, [name]: checked }));

  return (
    <AppShell data-testid='app-shell'>
      <AppShellHeader>
        <TopHeader>
          <TopHeaderLogo href='/' onClick={handleNavClick}>
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
            <NavRailItem href='/' icon={Home} label='Home' onClick={handleNavClick} />
            <NavRailItem
              href='/assistant'
              icon={MessageSquare}
              label='Ask Wally'
              active
              onClick={handleNavClick}
            />
            <NavRailSeparator />
            <NavRailItem href='/edge' icon={Cloud} label='Edge' onClick={handleNavClick} />
            <NavRailItem
              href='/security-testing'
              icon={FlaskConical}
              label='Security Testing'
              onClick={handleNavClick}
            />
          </NavRailBody>
          <NavRailFooter>
            <NavRailItem
              href='/settings'
              icon={Settings}
              label='Settings'
              onClick={handleNavClick}
            />
            <DropdownMenu positioning={{ placement: 'right-end', gutter: 6 }}>
              <DropdownMenuTrigger>
                <NavRailItem icon={UserRound} label='Alex Morgan' avatar />
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-200'>
                <DropdownMenuItem onSelect={onSignOut}>
                  <DropdownMenuItemIcon>
                    <LogOut />
                  </DropdownMenuItemIcon>
                  <DropdownMenuItemText>Sign out</DropdownMenuItemText>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </NavRailFooter>
        </NavRail>
      </AppShellRail>

      <AppShellRemote role='main'>
        <Chat background='strong' data-testid='wally-chat'>
          <ChatHeader>
            <ChatHeaderTitle />
            <ChatHeaderActions>
              <Button
                variant='ghost'
                color='neutral'
                size='small'
                aria-label='Chat history'
                onClick={onOpenHistory}
              >
                <History />
              </Button>
            </ChatHeaderActions>
          </ChatHeader>

          <Conversation>
            <ConversationContent contentClassName='mx-auto w-full max-w-768'>
              <ConversationEmptyState title='What should we look into today?'>
                <ChatSuggestions placement='greeting' label='Suggestions'>
                  {LANDING_PROMPTS.map((text, index) => (
                    <ChatSuggestion
                      key={text}
                      value={text}
                      onClick={handlePromptClick}
                      data-testid={`wally-prompt-${index}`}
                    >
                      {text}
                    </ChatSuggestion>
                  ))}
                </ChatSuggestions>
              </ConversationEmptyState>
            </ConversationContent>
          </Conversation>

          <ChatFooter className='mx-auto w-full max-w-800'>
            <ChatInput value={value} onValueChange={setValue} onSubmit={handleSubmit}>
              <ChatInputTextarea data-testid='wally-textarea' />
              <ChatPermissions>
                <ChatPermissionsTrigger />
                <ChatPermissionsContent>
                  {TOOLS.map(tool => (
                    <ChatPermissionsItem
                      key={tool.name}
                      name={tool.name}
                      title={tool.name}
                      description={tool.description}
                      checked={allowed[tool.name]}
                      onCheckedChange={handlePermissionChange}
                    />
                  ))}
                </ChatPermissionsContent>
              </ChatPermissions>
              <ChatInputSubmit />
            </ChatInput>
          </ChatFooter>
        </Chat>
      </AppShellRemote>
    </AppShell>
  );
};
