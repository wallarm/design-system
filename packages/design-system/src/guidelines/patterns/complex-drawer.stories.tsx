import { useState } from 'react';
import { fn } from 'storybook/test';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Attribute, AttributeLabel, AttributeValue } from '../../components/Attribute';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { InlineCodeSnippet } from '../../components/CodeSnippet';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerResizeHandle,
  DrawerTitle,
  DrawerTrigger,
} from '../../components/Drawer';
import { EmptyState, EmptyStateMessage, EmptyStateTitle } from '../../components/EmptyState';
import { FormatDateTime } from '../../components/FormatDateTime';
import { Ip, IpAddress } from '../../components/Ip';
import { NumericBadge } from '../../components/NumericBadge';
import { Page, PageContent, PageHeader, PageHeaderGroup, PageTitle } from '../../components/Page';
import {
  BarList,
  BarListBar,
  BarListItem,
  BarListLabel,
  BarListPercent,
  BarListSkeleton,
  BarListValue,
  Chart,
  ChartHeader,
  ChartTitle,
  LegendDot,
  LineChart,
  LineChartBody,
  type LineChartDatum,
  LineChartEmpty,
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
  PieChartSkeleton,
  useChartTimeFormatters,
} from '../../components/SimpleCharts';
import { HStack, VStack } from '../../components/Stack';
import type { TableCellContext, TableColumnDef } from '../../components/Table';
import { Table } from '../../components/Table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/Tabs';
import { Tag } from '../../components/Tag';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/Tooltip';
import { Link } from '../../icons';

interface Share {
  name: string;
  value: number;
}

interface AttackRequest {
  id: string;
  time: string;
  method: string;
  path: string;
  status: number;
  ip: string;
}

interface Attack {
  id: string;
  name: string;
  type: string;
  status: 'Monitoring' | 'Blocked';
  host: string;
  firstSeen: string;
  lastSeen: string;
  total: number;
  blocked: number;
  sessions: number;
  ips: Share[];
  users: Share[];
  hosts: Share[];
  statusCodes: Share[];
  requests: AttackRequest[];
}

const RCE: Attack = {
  id: 'atk-rce',
  name: 'Remote code execution from 2 IPs in post.json_doc.params.account_id',
  type: 'RCE',
  status: 'Monitoring',
  host: 'crm.example.com',
  firstSeen: '2026-11-06T00:13:13Z',
  lastSeen: '2026-11-06T10:13:48Z',
  total: 55,
  blocked: 0,
  sessions: 4,
  ips: [
    { name: '10.56.2.15', value: 35 },
    { name: '10.56.1.9', value: 20 },
  ],
  users: [
    { name: 'attacker1@malicious.example', value: 15 },
    { name: 'attacker3@malicious.example', value: 15 },
    { name: 'attacker4@malicious.example', value: 15 },
    { name: 'attacker2@malicious.example', value: 10 },
  ],
  hosts: [{ name: 'crm.example.com', value: 55 }],
  statusCodes: [
    { name: '2XX', value: 41 },
    { name: '4XX', value: 14 },
  ],
  requests: [
    {
      id: 'req-1',
      time: '2026-11-06T10:13:48Z',
      method: 'POST',
      path: '/api/v1/accounts/sync',
      status: 200,
      ip: '10.56.2.15',
    },
    {
      id: 'req-2',
      time: '2026-11-06T10:12:31Z',
      method: 'POST',
      path: '/api/v1/accounts/sync',
      status: 403,
      ip: '10.56.1.9',
    },
    {
      id: 'req-3',
      time: '2026-11-06T09:58:02Z',
      method: 'POST',
      path: '/api/v1/accounts/export',
      status: 200,
      ip: '10.56.2.15',
    },
  ],
};

const TRAVERSAL: Attack = {
  ...RCE,
  id: 'atk-traversal',
  name: 'Path traversal from 10.56.2.15 in post.json_doc.params.file_path',
  type: 'Path traversal',
  status: 'Blocked',
  total: 12,
  blocked: 12,
  sessions: 1,
  ips: [{ name: '10.56.2.15', value: 12 }],
  users: [{ name: 'attacker1@malicious.example', value: 12 }],
  hosts: [{ name: 'crm.example.com', value: 12 }],
  statusCodes: [{ name: '4XX', value: 12 }],
  requests: RCE.requests.slice(0, 1),
};

const ATTACKS: Attack[] = [RCE, TRAVERSAL];

// Requests per half hour over one day, with a burst in the morning.
const TIMELINE: LineChartDatum[] = Array.from({ length: 48 }, (_, i) => ({
  timestamp: new Date(2026, 10, 6, 0, i * 30).getTime(),
  requests: i >= 18 && i <= 21 ? [6, 14, 9, 4][i - 18] : i % 7 === 0 ? 1 : 0,
}));
const TIMELINE_SERIES: LineChartSeries[] = [{ key: 'requests', label: 'Requests', color: 'brand' }];

const STATUS_COLOR = { '2XX': 'green', '3XX': 'blue', '4XX': 'amber', '5XX': 'red' } as const;

const onCopyLink = fn().mockName('onCopyLink');
const onSaveDrawerWidth = fn().mockName('onSaveDrawerWidth');

const RCE_STATUS_CODES = RCE.statusCodes.map(row => ({
  ...row,
  color: STATUS_COLOR[row.name as keyof typeof STATUS_COLOR],
}));

const getAttackId = (attack: Attack) => attack.id;
const getRequestId = (request: AttackRequest) => request.id;
const sumValues = (rows: Share[]) => rows.reduce((sum, row) => sum + row.value, 0);
const formatCount = (value: number) => value.toLocaleString('en-US');

const meta = {
  title: 'Patterns/Complex drawer',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when a row click opens a wide drawer about one event (an attack, an incident, a session) with a status summary, pinned tabs, attributes and analytics charts.',
      },
    },
  },
} satisfies Meta;

export default meta;

// The host shell gives a page its height; 720px stands in for it.
const hostShell: StoryFn['decorators'] = [
  Story => (
    <div className='h-720'>
      <Story />
    </div>
  ),
];

/**
 * Click an attack name: one shared, non-modal 960px drawer opens. `Tabs asChild` pins the header
 * and the tabs; only the body scrolls. Overview holds attributes and chart cards, Requests the
 * event's own requests.
 */
export const Default: StoryFn = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('overview');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();

  const attack = ATTACKS.find(item => item.id === selectedId) ?? null;
  const statusCodes = (attack?.statusCodes ?? []).map(row => ({
    ...row,
    color: STATUS_COLOR[row.name as keyof typeof STATUS_COLOR],
  }));
  const statusTotal = sumValues(statusCodes);

  const columns: TableColumnDef<Attack>[] = [
    { accessorKey: 'name', header: 'Attack', size: 420 },
    { accessorKey: 'type', header: 'Type', size: 160 },
    { accessorKey: 'status', header: 'Status', size: 140 },
    { accessorKey: 'total', header: 'Requests', size: 120 },
  ];
  const request = attack?.requests.find(item => item.id === selectedRequestId) ?? null;

  const renderRequest = ({ row }: TableCellContext<AttackRequest, unknown>) => (
    <VStack gap={4}>
      <HStack gap={6} align='center'>
        <Tag>{row.original.method}</Tag>
        <span>{row.original.path}</span>
      </HStack>
      <FormatDateTime value={row.original.time} format='datetime' layout='inline' />
    </VStack>
  );
  const requestColumns: TableColumnDef<AttackRequest>[] = [
    { id: 'request', header: 'Request', size: 300, cell: renderRequest },
  ];

  const handleMasterCellClick = (id: string) => {
    setSelectedId(id);
    setSelectedRequestId(null);
    setTab('overview');
    setOpen(true);
  };
  const handleCopyLink = () => onCopyLink(attack);

  return (
    <Page name='events-attacks' fullSize fixedHeight data-testid='attacks-page'>
      <PageHeader>
        <PageHeaderGroup>
          <PageTitle>Attacks</PageTitle>
        </PageHeaderGroup>
      </PageHeader>

      <PageContent>
        <Table
          aria-label='Attacks'
          data={ATTACKS}
          columns={columns}
          getRowId={getAttackId}
          activeRowId={open ? selectedId : null}
          onMasterCellClick={handleMasterCellClick}
          data-testid='attacks-table'
        />
      </PageContent>

      <Drawer
        open={open}
        onOpenChange={setOpen}
        modal={false}
        overlay={false}
        closeOnOutsideClick={false}
        width={960}
        data-testid='attack-drawer'
      >
        <DrawerContent>
          <DrawerResizeHandle onResizeEnd={onSaveDrawerWidth} />
          <Tabs value={tab} onChange={setTab} asChild data-testid='attack-drawer'>
            <DrawerHeader>
              <DrawerTitle>{attack?.name}</DrawerTitle>
              <DrawerDescription>
                <HStack gap={6} align='center'>
                  <Badge
                    variant='dotted'
                    type='secondary'
                    color={attack?.status === 'Blocked' ? 'red' : 'amber'}
                  >
                    {attack?.status}
                  </Badge>
                  <span>
                    {attack?.blocked}/{attack?.total} blocked
                  </span>
                </HStack>
              </DrawerDescription>
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
            </DrawerHeader>
            <TabsList>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='requests'>
                Requests <NumericBadge>{attack?.total ?? 0}</NumericBadge>
              </TabsTrigger>
            </TabsList>
            <DrawerBody>
              <TabsContent value='overview'>
                <VStack gap={12} className='pt-16 pb-24'>
                  <div className='grid grid-cols-2 gap-x-8 gap-y-6 pb-8'>
                    <Attribute>
                      <AttributeLabel>Attack type</AttributeLabel>
                      <AttributeValue>
                        <Tag>{attack?.type}</Tag>
                      </AttributeValue>
                    </Attribute>
                    <Attribute>
                      <AttributeLabel>Last seen</AttributeLabel>
                      <AttributeValue>
                        <FormatDateTime
                          value={attack?.lastSeen ?? ''}
                          format='datetime'
                          layout='inline'
                        />
                      </AttributeValue>
                    </Attribute>
                  </div>
                  <Chart>
                    <ChartHeader>
                      <ChartTitle>Timeline</ChartTitle>
                    </ChartHeader>
                    <LineChart data={TIMELINE} series={TIMELINE_SERIES} xKey='timestamp'>
                      <LineChartBody>
                        <LineChartGrid />
                        <LineChartXAxis tickFormatter={formatHour} minTickGap={48} />
                        <LineChartYAxis />
                        <LineChartLine seriesKey='requests' curve='linear' />
                        <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
                      </LineChartBody>
                    </LineChart>
                  </Chart>
                  <div className='grid grid-cols-2 gap-12'>
                    <Chart>
                      <ChartHeader>
                        <ChartTitle>Top 5 IPs</ChartTitle>
                      </ChartHeader>
                      <BarList max={sumValues(attack?.ips ?? [])}>
                        {attack?.ips.map(row => (
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
                      <PieChart data={statusCodes} total={statusTotal}>
                        <PieChartDonut>
                          <PieChartCenter>
                            <PieChartCenterValue>{formatCount(statusTotal)}</PieChartCenterValue>
                            <PieChartCenterLabel
                              pluralize={{ one: 'request', other: 'requests' }}
                            />
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
              </TabsContent>
              <TabsContent value='requests'>
                <div className='grid grid-cols-[320px_1fr] gap-16 py-16'>
                  <Table
                    aria-label='Requests'
                    data={attack?.requests ?? []}
                    columns={requestColumns}
                    getRowId={getRequestId}
                    activeRowId={selectedRequestId}
                    onMasterCellClick={setSelectedRequestId}
                    data-testid='attack-requests-table'
                  />
                  <div
                    className='border-l border-border-primary-light pl-16'
                    data-testid='attack-request'
                  >
                    {request ? (
                      <VStack gap={6}>
                        <Attribute orientation='horizontal'>
                          <AttributeLabel width={140}>Request</AttributeLabel>
                          <AttributeValue>
                            <InlineCodeSnippet
                              code={`${request.method} ${request.path}`}
                              size='md'
                            />
                          </AttributeValue>
                        </Attribute>
                        <Attribute orientation='horizontal'>
                          <AttributeLabel width={140}>Status</AttributeLabel>
                          <AttributeValue>
                            <Badge
                              color={request.status < 300 ? 'green' : 'amber'}
                              type='secondary'
                              textVariant='code'
                            >
                              {request.status}
                            </Badge>
                          </AttributeValue>
                        </Attribute>
                        <Attribute orientation='horizontal'>
                          <AttributeLabel width={140}>IP</AttributeLabel>
                          <AttributeValue>
                            <Ip>
                              <IpAddress>{request.ip}</IpAddress>
                            </Ip>
                          </AttributeValue>
                        </Attribute>
                        <Attribute orientation='horizontal'>
                          <AttributeLabel width={140}>Time</AttributeLabel>
                          <AttributeValue>
                            <FormatDateTime
                              value={request.time}
                              format='datetime'
                              layout='inline'
                            />
                          </AttributeValue>
                        </Attribute>
                      </VStack>
                    ) : (
                      <EmptyState type='no-results'>
                        <EmptyStateMessage>
                          <EmptyStateTitle>Select a request to view details</EmptyStateTitle>
                        </EmptyStateMessage>
                      </EmptyState>
                    )}
                  </div>
                </div>
              </TabsContent>
            </DrawerBody>
          </Tabs>
        </DrawerContent>
      </Drawer>
    </Page>
  );
};

Default.decorators = hostShell;

/**
 * The status `Badge` and the blocked count go in `DrawerDescription` under the title; one icon
 * button with a `Tooltip` sits before the built-in close X.
 */
export const Header: StoryFn = () => {
  const handleCopyLink = () => onCopyLink(RCE);

  return (
    <Drawer width={960} data-testid='attack-drawer'>
      <DrawerTrigger asChild>
        <Button variant='outline' color='neutral'>
          View attack
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{RCE.name}</DrawerTitle>
          <DrawerDescription>
            <HStack gap={6} align='center'>
              <Badge variant='dotted' type='secondary' color='amber'>
                {RCE.status}
              </Badge>
              <span>
                {RCE.blocked}/{RCE.total} blocked
              </span>
            </HStack>
          </DrawerDescription>
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
        </DrawerHeader>
        <DrawerBody>
          <div className='grid grid-cols-2 gap-x-8 gap-y-6 py-16' data-testid='attack-attributes'>
            <Attribute>
              <AttributeLabel>Attack type</AttributeLabel>
              <AttributeValue>
                <Tag>{RCE.type}</Tag>
              </AttributeValue>
            </Attribute>
            <Attribute>
              <AttributeLabel>Host</AttributeLabel>
              <AttributeValue>{RCE.host}</AttributeValue>
            </Attribute>
            <Attribute>
              <AttributeLabel>First seen</AttributeLabel>
              <AttributeValue>
                <FormatDateTime value={RCE.firstSeen} format='datetime' layout='inline' />
              </AttributeValue>
            </Attribute>
            <Attribute>
              <AttributeLabel>Last seen</AttributeLabel>
              <AttributeValue>
                <FormatDateTime value={RCE.lastSeen} format='datetime' layout='inline' />
              </AttributeValue>
            </Attribute>
            <Attribute>
              <AttributeLabel>Sessions</AttributeLabel>
              <AttributeValue>{formatCount(RCE.sessions)}</AttributeValue>
            </Attribute>
            <Attribute>
              <AttributeLabel>IPs</AttributeLabel>
              <AttributeValue>
                <HStack gap={8}>
                  {RCE.ips.map(ip => (
                    <Ip key={ip.name}>
                      <IpAddress>{ip.name}</IpAddress>
                    </Ip>
                  ))}
                </HStack>
              </AttributeValue>
            </Attribute>
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

Header.decorators = hostShell;

/**
 * The analytics block: a full-width timeline, then `Chart` cards two per row. Each card sizes to
 * its content; the grid row makes neighbours the same height.
 */
export const Charts: StoryFn = () => {
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();

  return (
    <Drawer width={960} data-testid='attack-drawer'>
      <DrawerTrigger asChild>
        <Button variant='outline' color='neutral'>
          View attack
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{RCE.name}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <VStack gap={12} className='pt-16 pb-24' data-testid='attack-charts'>
            <Chart>
              <ChartHeader>
                <ChartTitle>Timeline</ChartTitle>
              </ChartHeader>
              <LineChart data={TIMELINE} series={TIMELINE_SERIES} xKey='timestamp'>
                <LineChartBody>
                  <LineChartGrid />
                  <LineChartXAxis tickFormatter={formatHour} minTickGap={48} />
                  <LineChartYAxis />
                  <LineChartLine seriesKey='requests' curve='linear' />
                  <LineChartTooltip xTickFormatter={formatHourWithTimezone} />
                </LineChartBody>
              </LineChart>
            </Chart>
            <div className='grid grid-cols-2 gap-12'>
              <Chart>
                <ChartHeader>
                  <ChartTitle>Top 5 hosts</ChartTitle>
                </ChartHeader>
                <BarList max={sumValues(RCE.hosts)}>
                  {RCE.hosts.map(row => (
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
                <PieChart data={RCE_STATUS_CODES} total={sumValues(RCE_STATUS_CODES)}>
                  <PieChartDonut>
                    <PieChartCenter>
                      <PieChartCenterValue>{formatCount(RCE.total)}</PieChartCenterValue>
                      <PieChartCenterLabel pluralize={{ one: 'request', other: 'requests' }} />
                    </PieChartCenter>
                  </PieChartDonut>
                  <PieChartLegend>
                    {RCE_STATUS_CODES.map(row => (
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
              <Chart>
                <ChartHeader>
                  <ChartTitle>Top 5 IPs</ChartTitle>
                </ChartHeader>
                <BarList max={sumValues(RCE.ips)}>
                  {RCE.ips.map(row => (
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
                  <ChartTitle>Top 5 users</ChartTitle>
                </ChartHeader>
                <BarList max={sumValues(RCE.users)}>
                  {RCE.users.map(row => (
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
            </div>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

Charts.decorators = hostShell;

/**
 * Two columns inside the drawer: the event's records on the left as a one-column `Table`, the
 * selected record on the right. Nothing selected yet shows a one-line `EmptyState`.
 */
export const SplitView: StoryFn = () => {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>('req-1');

  const request = RCE.requests.find(item => item.id === selectedRequestId) ?? null;

  const renderRequest = ({ row }: TableCellContext<AttackRequest, unknown>) => (
    <VStack gap={4}>
      <HStack gap={6} align='center'>
        <Tag>{row.original.method}</Tag>
        <span>{row.original.path}</span>
      </HStack>
      <FormatDateTime value={row.original.time} format='datetime' layout='inline' />
    </VStack>
  );
  const requestColumns: TableColumnDef<AttackRequest>[] = [
    { id: 'request', header: 'Request', size: 300, cell: renderRequest },
  ];

  return (
    <Drawer width={960} data-testid='attack-drawer'>
      <DrawerTrigger asChild>
        <Button variant='outline' color='neutral'>
          View requests
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{RCE.name}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <div className='grid grid-cols-[320px_1fr] gap-16 py-16'>
            <Table
              aria-label='Requests'
              data={RCE.requests}
              columns={requestColumns}
              getRowId={getRequestId}
              activeRowId={selectedRequestId}
              onMasterCellClick={setSelectedRequestId}
              data-testid='attack-requests-table'
            />
            <div
              className='border-l border-border-primary-light pl-16'
              data-testid='attack-request'
            >
              {request ? (
                <VStack gap={6}>
                  <Attribute orientation='horizontal'>
                    <AttributeLabel width={140}>Request</AttributeLabel>
                    <AttributeValue>
                      <InlineCodeSnippet code={`${request.method} ${request.path}`} size='md' />
                    </AttributeValue>
                  </Attribute>
                  <Attribute orientation='horizontal'>
                    <AttributeLabel width={140}>Status</AttributeLabel>
                    <AttributeValue>
                      <Badge
                        color={request.status < 300 ? 'green' : 'amber'}
                        type='secondary'
                        textVariant='code'
                      >
                        {request.status}
                      </Badge>
                    </AttributeValue>
                  </Attribute>
                  <Attribute orientation='horizontal'>
                    <AttributeLabel width={140}>IP</AttributeLabel>
                    <AttributeValue>
                      <Ip>
                        <IpAddress>{request.ip}</IpAddress>
                      </Ip>
                    </AttributeValue>
                  </Attribute>
                  <Attribute orientation='horizontal'>
                    <AttributeLabel width={140}>Time</AttributeLabel>
                    <AttributeValue>
                      <FormatDateTime value={request.time} format='datetime' layout='inline' />
                    </AttributeValue>
                  </Attribute>
                </VStack>
              ) : (
                <EmptyState type='no-results'>
                  <EmptyStateMessage>
                    <EmptyStateTitle>Select a request to view details</EmptyStateTitle>
                  </EmptyStateMessage>
                </EmptyState>
              )}
            </div>
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

SplitView.decorators = hostShell;

/**
 * Still loading: attributes show their skeletons and every card keeps its title over a skeleton of
 * its own shape. No `Loader` over the body.
 */
export const Loading: StoryFn = () => (
  <Drawer width={960} data-testid='attack-drawer'>
    <DrawerTrigger asChild>
      <Button variant='outline' color='neutral'>
        View attack
      </Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>{RCE.name}</DrawerTitle>
      </DrawerHeader>
      <DrawerBody>
        <VStack gap={12} className='pt-16 pb-24' data-testid='attack-loading'>
          <div className='grid grid-cols-2 gap-x-8 gap-y-6 pb-8'>
            <Attribute loading>
              <AttributeLabel>Attack type</AttributeLabel>
              <AttributeValue />
            </Attribute>
            <Attribute loading>
              <AttributeLabel>Last seen</AttributeLabel>
              <AttributeValue />
            </Attribute>
          </div>
          <Chart>
            <ChartHeader>
              <ChartTitle>Timeline</ChartTitle>
            </ChartHeader>
            <LineChartEmpty />
          </Chart>
          <div className='grid grid-cols-2 gap-12'>
            <Chart>
              <ChartHeader>
                <ChartTitle>Top 5 IPs</ChartTitle>
              </ChartHeader>
              <BarListSkeleton rows={3} />
            </Chart>
            <Chart>
              <ChartHeader>
                <ChartTitle>Status codes</ChartTitle>
              </ChartHeader>
              <PieChartSkeleton rows={3} />
            </Chart>
          </div>
        </VStack>
      </DrawerBody>
    </DrawerContent>
  </Drawer>
);

Loading.decorators = hostShell;
