import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { fn } from 'storybook/test';
import {
  Alert,
  AlertContent,
  AlertControls,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '../../components/Alert';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
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
  EmptyStateDescription,
  EmptyStateIllustration,
  EmptyStateMessage,
  EmptyStateTitle,
} from '../../components/EmptyState';
import { FormatDateTime } from '../../components/FormatDateTime';
import { Heading } from '../../components/Heading';
import { HttpMethod, type HttpMethodName } from '../../components/HttpMethod';
import { Ip, IpAddress, IpCountry } from '../../components/Ip';
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
import { SegmentedControl, SegmentedControlItem } from '../../components/SegmentedControl';
import {
  BarList,
  BarListBar,
  BarListItem,
  BarListLabel,
  BarListPercent,
  BarListSkeleton,
  BarListValue,
  Chart,
  ChartActions,
  type ChartColor,
  ChartHeader,
  ChartTitle,
  HorizontalBarStack,
  type HorizontalBarStackDatum,
  HorizontalBarStackSkeleton,
  LegendDot,
  LineChart,
  LineChartBody,
  LineChartEmpty,
  LineChartGrid,
  LineChartHoverPopoverDot,
  LineChartLegend,
  LineChartLegendItem,
  LineChartLine,
  type LineChartSeries,
  LineChartTooltip,
  LineChartXAxis,
  LineChartYAxis,
  Metric,
  MetricCaption,
  MetricDelta,
  MetricHeader,
  MetricSkeleton,
  MetricSparkline,
  type MetricSparklinePoint,
  MetricTotal,
  MetricValue,
  PieChart,
  PieChartCenter,
  PieChartCenterLabel,
  PieChartCenterValue,
  type PieChartDatum,
  PieChartDonut,
  PieChartLegend,
  PieChartLegendItem,
  PieChartLegendPercent,
  PieChartLegendValue,
  PieChartSkeleton,
  useChartTimeFormatters,
} from '../../components/SimpleCharts';
import { Skeleton } from '../../components/Skeleton';
import { HStack, VStack } from '../../components/Stack';
import type { TableCellContext, TableColumnDef, TableRow } from '../../components/Table';
import { Table, TableEmptyState } from '../../components/Table';
import { Text } from '../../components/Text';
import { ArrowRight, Download, Ellipsis, ExternalLink, ShieldCheck } from '../../icons';

type Period = '24h' | '7d' | '30d';

type TrafficPoint = {
  timestamp: number;
  requests: number;
  attacks: number;
  blocked: number;
};

interface PeriodData {
  caption: string;
  traffic: TrafficPoint[];
  /** Multiplier for the per-period breakdowns (attack types, endpoints, threats). */
  scale: number;
  blockedDelta: number;
  incidents: number;
  /** Open incidents split as [critical, high, medium]; sums to `incidents`. */
  severity: [number, number, number];
  incidentsDelta: number;
  endpoints: number;
  newEndpoints: number;
}

type Severity = 'critical' | 'high' | 'medium';
type ThreatStatus = 'blocked' | 'monitoring' | 'passed';

interface Threat {
  id: string;
  type: string;
  severity: Severity;
  method: HttpMethodName;
  host: string;
  path: string;
  sourceIp: string;
  country: 'US' | 'DE' | 'BR' | 'NL' | 'SG' | 'IN' | 'FR';
  hits: number;
  status: ThreatStatus;
  lastSeen: string;
}

const HOUR = 60 * 60 * 1000;
const PERIOD_END = new Date(2026, 10, 5, 23, 0, 0).getTime();

// Deterministic noise in [0, 1): stable screenshots, no Math.random.
const noise = (i: number, salt: number) => {
  const v = Math.sin((i + 1) * salt) * 43758.5453;
  return v - Math.floor(v);
};

const buildTraffic = (count: number, stepHours: number, base: number): TrafficPoint[] =>
  Array.from({ length: count }, (_, i) => {
    const requests = Math.round(
      base * (1 + 0.3 * Math.sin(i / 3) + 0.25 * (noise(i, 12.9898) - 0.5)),
    );
    const attacks = Math.round(requests * (0.003 + 0.004 * noise(i, 78.233)));
    const blocked = Math.round(attacks * (0.9 + 0.09 * noise(i, 39.346)));
    return {
      timestamp: PERIOD_END - (count - 1 - i) * stepHours * HOUR,
      requests,
      attacks,
      blocked,
    };
  });

const PERIODS: Record<Period, PeriodData> = {
  '24h': {
    caption: 'vs previous 24 hours',
    traffic: buildTraffic(24, 1, 518_000),
    scale: 1,
    blockedDelta: 1_284,
    incidents: 3,
    severity: [1, 1, 1],
    incidentsDelta: -2,
    endpoints: 1_284,
    newEndpoints: 6,
  },
  '7d': {
    caption: 'vs previous 7 days',
    traffic: buildTraffic(28, 6, 3_020_000),
    scale: 7,
    blockedDelta: 6_912,
    incidents: 14,
    severity: [2, 5, 7],
    incidentsDelta: 3,
    endpoints: 1_291,
    newEndpoints: 23,
  },
  '30d': {
    caption: 'vs previous 30 days',
    traffic: buildTraffic(30, 24, 12_400_000),
    scale: 30,
    blockedDelta: 18_406,
    incidents: 41,
    severity: [6, 13, 22],
    incidentsDelta: -9,
    endpoints: 1_318,
    newEndpoints: 57,
  },
};

const compactNumber = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const formatCompact = (value: unknown) => compactNumber.format(Number(value));
const formatFull = (value: number) => value.toLocaleString('en-US');

const formatHoveredAttacks = (datum: PieChartDatum) => formatCompact(datum.value);

const sumOf = (points: TrafficPoint[], key: 'requests' | 'attacks' | 'blocked') =>
  points.reduce((total, point) => total + point[key], 0);

const sparklineOf = (
  points: TrafficPoint[],
  key: 'requests' | 'attacks' | 'blocked',
): MetricSparklinePoint[] => points.map(point => ({ x: point.timestamp, value: point[key] }));

const ENDPOINT_TREND: MetricSparklinePoint[] = [
  1_262, 1_265, 1_265, 1_270, 1_271, 1_274, 1_278, 1_278, 1_281, 1_284,
].map((value, i) => ({ x: PERIOD_END - (9 - i) * 24 * HOUR, value }));

const INCIDENT_TREND: MetricSparklinePoint[] = [6, 4, 5, 7, 3, 4, 2, 5, 4, 3].map((value, i) => ({
  x: PERIOD_END - (9 - i) * 24 * HOUR,
  value,
}));

const TRAFFIC_SERIES: LineChartSeries<'requests'>[] = [
  { key: 'requests', label: 'Requests', color: 'brand' },
];

const ATTACK_SERIES: LineChartSeries<'attacks' | 'blocked'>[] = [
  { key: 'attacks', label: 'Attacks', color: 'red' },
  { key: 'blocked', label: 'Blocked', color: 'green' },
];

const ATTACK_TYPES: { name: string; label: string; value: number; color: ChartColor }[] = [
  { name: 'sqli', label: 'SQL injection', value: 14_820, color: 'red' },
  { name: 'xss', label: 'Cross-site scripting', value: 9_410, color: 'amber' },
  { name: 'bola', label: 'BOLA', value: 6_205, color: 'purple' },
  { name: 'brute', label: 'Brute force', value: 4_930, color: 'blue' },
  { name: 'ptrav', label: 'Path traversal', value: 2_118, color: 'teal' },
];

const TOP_ENDPOINTS: { path: string; value: number; color: ChartColor }[] = [
  { path: 'POST /api/v2/auth/login', value: 11_204, color: 'red' },
  { path: 'GET /api/v2/orders/{id}', value: 7_386, color: 'brand' },
  { path: 'POST /graphql', value: 5_142, color: 'brand' },
  { path: 'GET /api/v2/users/{id}', value: 3_920, color: 'brand' },
  { path: 'PUT /api/v2/cart/items', value: 1_608, color: 'brand' },
];

const SEVERITY: Omit<HorizontalBarStackDatum, 'value'>[] = [
  { name: 'Critical', color: 'red' },
  { name: 'High', color: 'brand' },
  { name: 'Medium', color: 'amber' },
];

const THREATS: Threat[] = [
  {
    id: 'atk-7f3a21',
    type: 'SQL injection',
    severity: 'critical',
    method: 'POST',
    host: 'api.shop-demo.io',
    path: '/api/v2/auth/login',
    sourceIp: '203.0.113.42',
    country: 'NL',
    hits: 4_812,
    status: 'blocked',
    lastSeen: '2026-11-05T22:48:00Z',
  },
  {
    id: 'atk-7f3a0c',
    type: 'BOLA',
    severity: 'critical',
    method: 'GET',
    host: 'api.shop-demo.io',
    path: '/api/v2/orders/{id}',
    sourceIp: '198.51.100.17',
    country: 'US',
    hits: 2_306,
    status: 'passed',
    lastSeen: '2026-11-05T22:31:00Z',
  },
  {
    id: 'atk-7f39e4',
    type: 'Brute force',
    severity: 'high',
    method: 'POST',
    host: 'auth.shop-demo.io',
    path: '/oauth/token',
    sourceIp: '203.0.113.9',
    country: 'BR',
    hits: 1_955,
    status: 'blocked',
    lastSeen: '2026-11-05T21:57:00Z',
  },
  {
    id: 'atk-7f39b8',
    type: 'Cross-site scripting',
    severity: 'high',
    method: 'POST',
    host: 'shop-demo.io',
    path: '/api/v2/reviews',
    sourceIp: '198.51.100.203',
    country: 'DE',
    hits: 1_204,
    status: 'blocked',
    lastSeen: '2026-11-05T21:12:00Z',
  },
  {
    id: 'atk-7f3977',
    type: 'Path traversal',
    severity: 'medium',
    method: 'GET',
    host: 'cdn.shop-demo.io',
    path: '/static/../../etc/passwd',
    sourceIp: '203.0.113.150',
    country: 'SG',
    hits: 618,
    status: 'monitoring',
    lastSeen: '2026-11-05T20:40:00Z',
  },
  {
    id: 'atk-7f3951',
    type: 'GraphQL batching',
    severity: 'medium',
    method: 'POST',
    host: 'api.shop-demo.io',
    path: '/graphql',
    sourceIp: '198.51.100.64',
    country: 'IN',
    hits: 402,
    status: 'monitoring',
    lastSeen: '2026-11-05T19:05:00Z',
  },
];

const SEVERITY_BADGE = {
  critical: { label: 'Critical', color: 'red' },
  high: { label: 'High', color: 'w-orange' },
  medium: { label: 'Medium', color: 'amber' },
} as const;

const STATUS_BADGE = {
  blocked: { label: 'Blocked', color: 'green' },
  monitoring: { label: 'Monitoring', color: 'yellow' },
  passed: { label: 'Not blocked', color: 'red' },
} as const;

const onExportReport = fn().mockName('onExportReport');
const onOpenAttacks = fn().mockName('onOpenAttacks');
const onOpenInventory = fn().mockName('onOpenInventory');
const onOpenThreat = fn().mockName('onOpenThreat');
const onBlockSource = fn().mockName('onBlockSource');
const onMarkFalsePositive = fn().mockName('onMarkFalsePositive');
const onSetUpNode = fn().mockName('onSetUpNode');

const getThreatId = (threat: Threat) => threat.id;

const renderAttack = ({ row }: TableCellContext<Threat, unknown>) => (
  <VStack gap={2}>
    <Text size='sm'>{row.original.type}</Text>
    <Text size='xs' color='secondary'>
      {row.original.id}
    </Text>
  </VStack>
);

const renderSeverity = ({ row }: TableCellContext<Threat, unknown>) => (
  <Badge type='secondary' color={SEVERITY_BADGE[row.original.severity].color}>
    {SEVERITY_BADGE[row.original.severity].label}
  </Badge>
);

const renderTarget = ({ row }: TableCellContext<Threat, unknown>) => (
  <HStack gap={8}>
    <HttpMethod method={row.original.method} />
    <VStack gap={2}>
      <Text size='sm'>{row.original.path}</Text>
      <Text size='xs' color='secondary'>
        {row.original.host}
      </Text>
    </VStack>
  </HStack>
);

const renderSource = ({ row }: TableCellContext<Threat, unknown>) => (
  <Ip>
    <IpCountry code={row.original.country} />
    <IpAddress>{row.original.sourceIp}</IpAddress>
  </Ip>
);

const renderStatus = ({ row }: TableCellContext<Threat, unknown>) => (
  <Badge variant='dotted' type='secondary' color={STATUS_BADGE[row.original.status].color}>
    {STATUS_BADGE[row.original.status].label}
  </Badge>
);

const renderLastSeen = ({ row }: TableCellContext<Threat, unknown>) => (
  <FormatDateTime value={row.original.lastSeen} format='datetime' layout='inline' />
);

const renderMenuAction = (row: TableRow<Threat>) => {
  const threat = row.original;
  const handleOpen = () => onOpenThreat(threat);
  const handleBlock = () => onBlockSource(threat);
  const handleFalsePositive = () => onMarkFalsePositive(threat);

  return (
    <DropdownMenu data-testid='threats-row-menu'>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          color='neutral'
          size='small'
          aria-label={`Actions for ${threat.id}`}
        >
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={handleOpen}>
          <DropdownMenuItemText>Open attack</DropdownMenuItemText>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleBlock}>
          <DropdownMenuItemText>Block source IP</DropdownMenuItemText>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleFalsePositive}>
          <DropdownMenuItemText>Mark as false positive</DropdownMenuItemText>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const THREAT_COLUMNS: TableColumnDef<Threat>[] = [
  {
    accessorKey: 'type',
    header: 'Attack',
    size: 280,
    cell: renderAttack,
    meta: { renderMenuAction },
  },
  { accessorKey: 'severity', header: 'Severity', size: 120, cell: renderSeverity },
  { accessorKey: 'path', header: 'Target', size: 340, cell: renderTarget },
  { accessorKey: 'sourceIp', header: 'Source', size: 200, cell: renderSource },
  { accessorKey: 'hits', header: 'Hits', size: 100 },
  { accessorKey: 'status', header: 'Status', size: 140, cell: renderStatus },
  { accessorKey: 'lastSeen', header: 'Last seen', size: 200, cell: renderLastSeen },
];

const meta = {
  title: 'Templates/Security dashboard',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when building the overview screen of a security product, with KPI tiles, traffic and attack charts, breakdowns and a top threats table under one period selector.',
      },
    },
  },
} satisfies Meta;

export default meta;

/**
 * The whole dashboard. The period selector drives every card: KPI tiles with deltas and
 * sparklines, traffic and attacks over time on two synced line charts, attack types,
 * the most attacked endpoints, incidents by severity, and the top threats table.
 */
export const Default: StoryFn = () => {
  const [period, setPeriod] = useState<Period>('24h');
  const { formatHour, formatDate, formatHourWithTimezone, formatDateWithTimezone } =
    useChartTimeFormatters();

  const data = PERIODS[period];
  const requests = sumOf(data.traffic, 'requests');
  const attacks = sumOf(data.traffic, 'attacks');
  const blocked = sumOf(data.traffic, 'blocked');
  const formatX = period === '24h' ? formatHour : formatDate;
  const formatTooltipX = period === '24h' ? formatHourWithTimezone : formatDateWithTimezone;
  const attackTypes = ATTACK_TYPES.map(row => ({ ...row, value: row.value * data.scale }));
  const attackTypesTotal = attackTypes.reduce((total, row) => total + row.value, 0);
  const endpoints = TOP_ENDPOINTS.map(row => ({ ...row, value: row.value * data.scale }));
  const endpointsMax = endpoints[0]?.value ?? 0;
  const severity = SEVERITY.map((row, i) => ({ ...row, value: data.severity[i] ?? 0 }));
  const threats = THREATS.map(row => ({ ...row, hits: row.hits * data.scale }));

  const handlePeriodChange = (value: string) => setPeriod(value as Period);

  return (
    <Page name='security-dashboard' fullSize data-testid='security-dashboard'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>Security dashboard</PageTitle>
          <PageDescription>
            Traffic, attacks and incidents across every application protected in this tenant.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button
            size='medium'
            variant='outline'
            color='neutral'
            onClick={onExportReport}
            data-testid='dashboard-export'
          >
            <Download />
            Export report
          </Button>
        </PageActions>
      </PageHeader>

      <PageToolbar>
        <SegmentedControl
          value={period}
          onChange={handlePeriodChange}
          aria-label='Period'
          data-testid='dashboard-period'
        >
          <SegmentedControlItem value='24h'>Last 24 hours</SegmentedControlItem>
          <SegmentedControlItem value='7d'>7 days</SegmentedControlItem>
          <SegmentedControlItem value='30d'>30 days</SegmentedControlItem>
        </SegmentedControl>
      </PageToolbar>

      <PageContent>
        <VStack gap={16} align='stretch'>
          <div className='grid grid-cols-4 gap-16'>
            <Chart data-testid='kpi-requests'>
              <ChartHeader>
                <ChartTitle>Requests</ChartTitle>
              </ChartHeader>
              <Metric>
                <MetricHeader>
                  <MetricValue>{formatCompact(requests)}</MetricValue>
                </MetricHeader>
                <MetricCaption>All applications</MetricCaption>
              </Metric>
              <MetricSparkline
                data={sparklineOf(data.traffic, 'requests')}
                color='neutral'
                label='Requests'
              />
            </Chart>

            <Chart data-testid='kpi-blocked'>
              <ChartHeader>
                <ChartTitle>Attacks blocked</ChartTitle>
              </ChartHeader>
              <Metric>
                <MetricHeader>
                  <MetricValue>{blocked}</MetricValue>
                  <MetricTotal connector='of'>{attacks}</MetricTotal>
                  <MetricDelta value={data.blockedDelta} trend='up' sentiment='negative' />
                </MetricHeader>
                <MetricCaption>{data.caption}</MetricCaption>
              </Metric>
              <MetricSparkline
                data={sparklineOf(data.traffic, 'blocked')}
                color='negative'
                label='Blocked'
              />
            </Chart>

            <Chart data-testid='kpi-incidents'>
              <ChartHeader>
                <ChartTitle>Open incidents</ChartTitle>
              </ChartHeader>
              <Metric>
                <MetricHeader>
                  <MetricValue>{data.incidents}</MetricValue>
                  <MetricDelta
                    value={data.incidentsDelta}
                    sentiment={data.incidentsDelta < 0 ? 'positive' : 'negative'}
                  />
                </MetricHeader>
                <MetricCaption>{data.caption}</MetricCaption>
              </Metric>
              <MetricSparkline data={INCIDENT_TREND} color='positive' label='Incidents' />
            </Chart>

            <Chart data-testid='kpi-endpoints'>
              <ChartHeader>
                <ChartTitle>API endpoints</ChartTitle>
              </ChartHeader>
              <Metric>
                <MetricHeader>
                  <MetricValue>{data.endpoints}</MetricValue>
                  <MetricDelta value={data.newEndpoints} trend='up' sentiment='neutral' />
                </MetricHeader>
                <MetricCaption>New endpoints discovered</MetricCaption>
              </Metric>
              <MetricSparkline data={ENDPOINT_TREND} label='Endpoints' />
            </Chart>
          </div>

          <div className='grid grid-cols-2 gap-16'>
            <Chart data-testid='traffic-chart'>
              <ChartHeader>
                <ChartTitle>Traffic</ChartTitle>
              </ChartHeader>
              <LineChart
                data={data.traffic}
                series={TRAFFIC_SERIES}
                xKey='timestamp'
                syncId='security-dashboard'
              >
                <LineChartLegend>
                  <LineChartLegendItem seriesKey='requests'>
                    <LineChartHoverPopoverDot color='brand' />
                    <Text size='xs'>Requests</Text>
                  </LineChartLegendItem>
                </LineChartLegend>
                <LineChartBody height={200}>
                  <LineChartGrid />
                  <LineChartXAxis tickFormatter={formatX} minTickGap={32} />
                  <LineChartYAxis tickFormatter={formatCompact} />
                  <LineChartLine seriesKey='requests' />
                  <LineChartTooltip xTickFormatter={formatTooltipX} />
                </LineChartBody>
              </LineChart>
            </Chart>

            <Chart data-testid='attacks-chart'>
              <ChartHeader>
                <ChartTitle>Attacks</ChartTitle>
              </ChartHeader>
              <LineChart
                data={data.traffic}
                series={ATTACK_SERIES}
                xKey='timestamp'
                syncId='security-dashboard'
              >
                <LineChartLegend>
                  <LineChartLegendItem seriesKey='attacks'>
                    <LineChartHoverPopoverDot color='red' />
                    <Text size='xs'>Attacks</Text>
                  </LineChartLegendItem>
                  <LineChartLegendItem seriesKey='blocked'>
                    <LineChartHoverPopoverDot color='green' />
                    <Text size='xs'>Blocked</Text>
                  </LineChartLegendItem>
                </LineChartLegend>
                <LineChartBody height={200}>
                  <LineChartGrid />
                  <LineChartXAxis tickFormatter={formatX} minTickGap={32} />
                  <LineChartYAxis tickFormatter={formatCompact} />
                  <LineChartLine seriesKey='attacks' />
                  <LineChartLine seriesKey='blocked' />
                  <LineChartTooltip xTickFormatter={formatTooltipX} />
                </LineChartBody>
              </LineChart>
            </Chart>
          </div>

          <div className='grid grid-cols-3 gap-16'>
            <Chart data-testid='attack-types-chart'>
              <ChartHeader>
                <ChartTitle>Attack types</ChartTitle>
              </ChartHeader>
              <PieChart data={attackTypes} total={attackTypesTotal}>
                <PieChartDonut>
                  <PieChartCenter>
                    <PieChartCenterValue formatHoveredValue={formatHoveredAttacks}>
                      {formatCompact(attackTypesTotal)}
                    </PieChartCenterValue>
                    <PieChartCenterLabel pluralize={{ one: 'attack', other: 'attacks' }} />
                  </PieChartCenter>
                </PieChartDonut>
                <PieChartLegend>
                  {attackTypes.map(row => (
                    <PieChartLegendItem key={row.name} name={row.name}>
                      <Text size='sm'>{row.label}</Text>
                      <PieChartLegendValue>
                        {formatFull(row.value)}
                        <LegendDot />
                        <PieChartLegendPercent />
                      </PieChartLegendValue>
                    </PieChartLegendItem>
                  ))}
                </PieChartLegend>
              </PieChart>
            </Chart>

            <Chart data-testid='top-endpoints-chart'>
              <ChartHeader>
                <ChartTitle>Most attacked endpoints</ChartTitle>
                <ChartActions>
                  <Button
                    variant='ghost'
                    color='neutral'
                    size='small'
                    aria-label='Open API inventory'
                    onClick={onOpenInventory}
                  >
                    <ExternalLink />
                  </Button>
                </ChartActions>
              </ChartHeader>
              <BarList max={endpointsMax}>
                {endpoints.map(row => (
                  <BarListItem key={row.path} value={row.value}>
                    <BarListBar color={row.color} />
                    <BarListLabel>{row.path}</BarListLabel>
                    <BarListValue>
                      {formatFull(row.value)}
                      <BarListPercent />
                    </BarListValue>
                  </BarListItem>
                ))}
              </BarList>
            </Chart>

            <Chart data-testid='severity-chart'>
              <ChartHeader>
                <ChartTitle>Incidents by severity</ChartTitle>
              </ChartHeader>
              <HorizontalBarStack data={severity}>
                <MetricHeader>
                  <MetricValue>{data.incidents}</MetricValue>
                  <MetricDelta
                    value={data.incidentsDelta}
                    sentiment={data.incidentsDelta < 0 ? 'positive' : 'negative'}
                  />
                </MetricHeader>
              </HorizontalBarStack>
            </Chart>
          </div>

          <VStack gap={12} align='stretch'>
            <HStack justify='between' align='center'>
              <Heading as='h2' size='lg' weight='medium'>
                Top threats
              </Heading>
              <Button
                variant='ghost'
                color='neutral'
                size='medium'
                onClick={onOpenAttacks}
                data-testid='threats-view-all'
              >
                View all attacks
                <ArrowRight />
              </Button>
            </HStack>
            <Table
              aria-label='Top threats'
              data={threats}
              columns={THREAT_COLUMNS}
              getRowId={getThreatId}
              data-testid='threats-table'
            />
          </VStack>
        </VStack>
      </PageContent>
    </Page>
  );
};

/**
 * First load. The header and period selector are real; every card swaps its body for the
 * chart's own skeleton (`MetricSkeleton`, `Skeleton` legend chips over a bare `LineChartEmpty`, `PieChartSkeleton`,
 * `BarListSkeleton`, `HorizontalBarStackSkeleton`) and the table shows skeleton rows.
 */
export const Loading: StoryFn = () => (
  <Page name='security-dashboard' fullSize data-testid='security-dashboard'>
    <PageHeader>
      <PageHeaderGroup className='flex-1'>
        <PageTitle>Security dashboard</PageTitle>
        <PageDescription>
          Traffic, attacks and incidents across every application protected in this tenant.
        </PageDescription>
      </PageHeaderGroup>
      <PageActions>
        <Button size='medium' variant='outline' color='neutral' disabled>
          <Download />
          Export report
        </Button>
      </PageActions>
    </PageHeader>

    <PageToolbar>
      <SegmentedControl value='24h' aria-label='Period' data-testid='dashboard-period'>
        <SegmentedControlItem value='24h'>Last 24 hours</SegmentedControlItem>
        <SegmentedControlItem value='7d'>7 days</SegmentedControlItem>
        <SegmentedControlItem value='30d'>30 days</SegmentedControlItem>
      </SegmentedControl>
    </PageToolbar>

    <PageContent>
      <VStack gap={16} align='stretch'>
        <div className='grid grid-cols-4 gap-16'>
          <Chart aria-busy='true' data-testid='kpi-requests'>
            <ChartHeader>
              <ChartTitle>Requests</ChartTitle>
            </ChartHeader>
            <MetricSkeleton />
          </Chart>
          <Chart aria-busy='true' data-testid='kpi-blocked'>
            <ChartHeader>
              <ChartTitle>Attacks blocked</ChartTitle>
            </ChartHeader>
            <MetricSkeleton />
          </Chart>
          <Chart aria-busy='true' data-testid='kpi-incidents'>
            <ChartHeader>
              <ChartTitle>Open incidents</ChartTitle>
            </ChartHeader>
            <MetricSkeleton />
          </Chart>
          <Chart aria-busy='true' data-testid='kpi-endpoints'>
            <ChartHeader>
              <ChartTitle>API endpoints</ChartTitle>
            </ChartHeader>
            <MetricSkeleton />
          </Chart>
        </div>

        <div className='grid grid-cols-2 gap-16'>
          <Chart aria-busy='true' data-testid='traffic-chart'>
            <ChartHeader>
              <ChartTitle>Traffic</ChartTitle>
            </ChartHeader>
            <LineChartLegend>
              <LineChartLegendItem seriesKey='skeleton-requests'>
                <Skeleton width='72px' height='16px' rounded={4} />
              </LineChartLegendItem>
            </LineChartLegend>
            <LineChartEmpty height={200} />
          </Chart>
          <Chart aria-busy='true' data-testid='attacks-chart'>
            <ChartHeader>
              <ChartTitle>Attacks</ChartTitle>
            </ChartHeader>
            <LineChartLegend>
              <LineChartLegendItem seriesKey='skeleton-attacks'>
                <Skeleton width='72px' height='16px' rounded={4} />
              </LineChartLegendItem>
              <LineChartLegendItem seriesKey='skeleton-blocked'>
                <Skeleton width='72px' height='16px' rounded={4} />
              </LineChartLegendItem>
            </LineChartLegend>
            <LineChartEmpty height={200} />
          </Chart>
        </div>

        <div className='grid grid-cols-3 gap-16'>
          <Chart aria-busy='true' data-testid='attack-types-chart'>
            <ChartHeader>
              <ChartTitle>Attack types</ChartTitle>
            </ChartHeader>
            <PieChartSkeleton rows={5} />
          </Chart>
          <Chart aria-busy='true' data-testid='top-endpoints-chart'>
            <ChartHeader>
              <ChartTitle>Most attacked endpoints</ChartTitle>
            </ChartHeader>
            <BarListSkeleton rows={5} />
          </Chart>
          <Chart aria-busy='true' data-testid='severity-chart'>
            <ChartHeader>
              <ChartTitle>Incidents by severity</ChartTitle>
            </ChartHeader>
            <HorizontalBarStackSkeleton />
          </Chart>
        </div>

        <VStack gap={12} align='stretch'>
          <HStack justify='between' align='center'>
            <Heading as='h2' size='lg' weight='medium'>
              Top threats
            </Heading>
          </HStack>
          <Table
            aria-label='Top threats'
            data={[]}
            columns={THREAT_COLUMNS}
            getRowId={getThreatId}
            isLoading
            skeletonCount={5}
            data-testid='threats-table'
          />
        </VStack>
      </VStack>
    </PageContent>
  </Page>
);

/**
 * A new tenant with no traffic yet. One alert carries the only action (set up a node);
 * KPIs show the em dash, each chart card says why it is empty, and the table explains what
 * will appear there.
 */
export const NoData: StoryFn = () => (
  <Page name='security-dashboard' fullSize data-testid='security-dashboard'>
    <PageHeader>
      <PageHeaderGroup className='flex-1'>
        <PageTitle>Security dashboard</PageTitle>
        <PageDescription>
          Traffic, attacks and incidents across every application protected in this tenant.
        </PageDescription>
      </PageHeaderGroup>
    </PageHeader>

    <PageToolbar>
      <SegmentedControl defaultValue='24h' aria-label='Period' data-testid='dashboard-period'>
        <SegmentedControlItem value='24h'>Last 24 hours</SegmentedControlItem>
        <SegmentedControlItem value='7d'>7 days</SegmentedControlItem>
        <SegmentedControlItem value='30d'>30 days</SegmentedControlItem>
      </SegmentedControl>
    </PageToolbar>

    <PageContent>
      <VStack gap={16} align='stretch'>
        <Alert color='info' data-testid='dashboard-no-node'>
          <AlertIcon />
          <AlertContent>
            <AlertTitle>No filtering node is sending traffic</AlertTitle>
            <AlertDescription>
              Deploy a node in front of your applications and the dashboard fills in within a few
              minutes.
            </AlertDescription>
          </AlertContent>
          <AlertControls>
            <Button
              variant='secondary'
              color='neutral'
              size='small'
              onClick={onSetUpNode}
              data-testid='dashboard-set-up-node'
            >
              Set up a node
            </Button>
          </AlertControls>
        </Alert>

        <div className='grid grid-cols-4 gap-16'>
          <Chart data-testid='kpi-requests'>
            <ChartHeader>
              <ChartTitle>Requests</ChartTitle>
            </ChartHeader>
            <Metric>
              <MetricHeader>
                <MetricValue>—</MetricValue>
              </MetricHeader>
              <MetricCaption>All applications</MetricCaption>
            </Metric>
          </Chart>
          <Chart data-testid='kpi-blocked'>
            <ChartHeader>
              <ChartTitle>Attacks blocked</ChartTitle>
            </ChartHeader>
            <Metric>
              <MetricHeader>
                <MetricValue>—</MetricValue>
              </MetricHeader>
              <MetricCaption>vs previous 24 hours</MetricCaption>
            </Metric>
          </Chart>
          <Chart data-testid='kpi-incidents'>
            <ChartHeader>
              <ChartTitle>Open incidents</ChartTitle>
            </ChartHeader>
            <Metric>
              <MetricHeader>
                <MetricValue>—</MetricValue>
              </MetricHeader>
              <MetricCaption>vs previous 24 hours</MetricCaption>
            </Metric>
          </Chart>
          <Chart data-testid='kpi-endpoints'>
            <ChartHeader>
              <ChartTitle>API endpoints</ChartTitle>
            </ChartHeader>
            <Metric>
              <MetricHeader>
                <MetricValue>—</MetricValue>
              </MetricHeader>
              <MetricCaption>New endpoints discovered</MetricCaption>
            </Metric>
          </Chart>
        </div>

        <div className='grid grid-cols-2 gap-16'>
          <Chart data-testid='traffic-chart'>
            <ChartHeader>
              <ChartTitle>Traffic</ChartTitle>
            </ChartHeader>
            <LineChartEmpty height={200}>No requests in this period</LineChartEmpty>
          </Chart>
          <Chart data-testid='attacks-chart'>
            <ChartHeader>
              <ChartTitle>Attacks</ChartTitle>
            </ChartHeader>
            <LineChartEmpty height={200}>No attacks in this period</LineChartEmpty>
          </Chart>
        </div>

        <div className='grid grid-cols-3 gap-16'>
          <Chart data-testid='attack-types-chart'>
            <ChartHeader>
              <ChartTitle>Attack types</ChartTitle>
            </ChartHeader>
            <div className='flex flex-1 items-center justify-center'>
              <EmptyState type='no-results'>
                <EmptyStateMessage>
                  <EmptyStateDescription>
                    Attack types appear once attacks are detected.
                  </EmptyStateDescription>
                </EmptyStateMessage>
              </EmptyState>
            </div>
          </Chart>
          <Chart data-testid='top-endpoints-chart'>
            <ChartHeader>
              <ChartTitle>Most attacked endpoints</ChartTitle>
            </ChartHeader>
            <div className='flex flex-1 items-center justify-center'>
              <EmptyState type='no-results'>
                <EmptyStateMessage>
                  <EmptyStateDescription>
                    Endpoints are ranked once traffic is analyzed.
                  </EmptyStateDescription>
                </EmptyStateMessage>
              </EmptyState>
            </div>
          </Chart>
          <Chart data-testid='severity-chart'>
            <ChartHeader>
              <ChartTitle>Incidents by severity</ChartTitle>
            </ChartHeader>
            <div className='flex flex-1 items-center justify-center'>
              <EmptyState type='no-results'>
                <EmptyStateMessage>
                  <EmptyStateDescription>No incidents have been opened.</EmptyStateDescription>
                </EmptyStateMessage>
              </EmptyState>
            </div>
          </Chart>
        </div>

        <VStack gap={12} align='stretch'>
          <HStack justify='between' align='center'>
            <Heading as='h2' size='lg' weight='medium'>
              Top threats
            </Heading>
          </HStack>
          <Table
            aria-label='Top threats'
            data={[]}
            columns={THREAT_COLUMNS}
            getRowId={getThreatId}
            data-testid='threats-table'
          >
            <TableEmptyState>
              <EmptyState type='collection-empty' data-testid='threats-empty'>
                <EmptyStateIllustration>
                  <ShieldCheck />
                </EmptyStateIllustration>
                <EmptyStateMessage>
                  <EmptyStateTitle>No threats detected</EmptyStateTitle>
                  <EmptyStateDescription>
                    Attacks on your applications are listed here, ranked by hits.
                  </EmptyStateDescription>
                </EmptyStateMessage>
              </EmptyState>
            </TableEmptyState>
          </Table>
        </VStack>
      </VStack>
    </PageContent>
  </Page>
);
