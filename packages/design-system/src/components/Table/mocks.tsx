import { Check } from '../../icons';
import { Badge } from '../Badge';
import { InlineCodeSnippet } from '../CodeSnippet';
import { HStack, VStack } from '../Stack';
import { Tag } from '../Tag';
import { Text } from '../Text';
import { createTableColumnHelper } from './lib';
import type { TableColumnDef } from './types';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface SecurityEvent {
  id: string;
  objectName: string;
  tags: string[];
  isActive: boolean;
  requests: number;
  sourceIp: string;
  sourceProvider: string;
  parameter: string;
  status: 'Blocked' | 'Monitoring';
  firstDetected: string;
  cweId: string;
  lastSeen: string;
  endpointMethod: string;
  endpointPath: string;
}

export interface SecurityHeaderEntry {
  id: string;
  objectName: string;
  ip: string;
  ipCountryFlag: string;
  provider: string;
  requests: number;
  status: 'New' | 'Active' | 'Resolved';
  lastEdited: string;
  lastSynced: string;
  version: 'Up to date' | 'Outdated';
  children?: SecurityHeaderEntry[];
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export function formatRequests(n: number): string {
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

export function formatDate(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  return { date, time };
}

export const METHOD_COLORS: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'violet'> = {
  GET: 'green',
  POST: 'blue',
  PUT: 'amber',
  PATCH: 'violet',
  DELETE: 'red',
};

// ---------------------------------------------------------------------------
// Security Events — flat data
// ---------------------------------------------------------------------------

export const securityEvents: SecurityEvent[] = [
  {
    id: '1',
    objectName: 'Rate limiting abuse on the payment endpoint',
    tags: ['api-abuse', 'account-takeover'],
    isActive: false,
    requests: 22000,
    sourceIp: '34.74.73.20',
    sourceProvider: 'AWS',
    parameter: 'header.X-SESSION-ID',
    status: 'Blocked',
    firstDetected: '2026-01-28T15:00:00',
    cweId: 'CWE-287',
    lastSeen: '5 days ago',
    endpointMethod: 'POST',
    endpointPath: '/api/v1/payments',
  },
  {
    id: '2',
    objectName: 'Mass assignment vulnerability in user profile',
    tags: ['api-abuse', 'account-takeover'],
    isActive: false,
    requests: 25000,
    sourceIp: '34.74.73.20',
    sourceProvider: 'AWS',
    parameter: 'header.X-DEVICE-ID',
    status: 'Blocked',
    firstDetected: '2026-01-27T16:20:10',
    cweId: 'CWE-416',
    lastSeen: '6 days ago',
    endpointMethod: 'PUT',
    endpointPath: '/api/v1/users/profile',
  },
  {
    id: '3',
    objectName: 'Insecure direct object reference in user data',
    tags: ['api-abuse', 'account-takeover'],
    isActive: true,
    requests: 30000,
    sourceIp: '34.74.73.20',
    sourceProvider: 'AWS',
    parameter: 'header.X-CLIENT-VERSION',
    status: 'Monitoring',
    firstDetected: '2026-01-26T17:35:25',
    cweId: 'CWE-89',
    lastSeen: '7 days ago',
    endpointMethod: 'GET',
    endpointPath: '/api/v1/users/:id',
  },
  {
    id: '4',
    objectName: 'Improper error handling leading to info leak',
    tags: ['api-abuse', 'account-takeover'],
    isActive: true,
    requests: 35000,
    sourceIp: '34.74.73.20',
    sourceProvider: 'AWS',
    parameter: 'header.X-ORIGIN',
    status: 'Blocked',
    firstDetected: '2026-01-25T18:50:15',
    cweId: 'CWE-22',
    lastSeen: '1 week ago',
    endpointMethod: 'GET',
    endpointPath: '/api/v1/errors/debug',
  },
  {
    id: '5',
    objectName: 'Broken authentication in the login API',
    tags: ['api-abuse', 'account-takeover'],
    isActive: true,
    requests: 20000,
    sourceIp: '34.74.73.20',
    sourceProvider: 'AWS',
    parameter: 'header.X-TIMESTAMP',
    status: 'Blocked',
    firstDetected: '2026-01-29T14:45:30',
    cweId: 'CWE-200',
    lastSeen: '4 days ago',
    endpointMethod: 'POST',
    endpointPath: '/api/v1/auth/login',
  },
  {
    id: '6',
    objectName: 'Lack of resource validation in file upload',
    tags: ['api-abuse', 'account-takeover'],
    isActive: false,
    requests: 40000,
    sourceIp: '34.74.73.20',
    sourceProvider: 'AWS',
    parameter: 'header.X-REQUEST-TYPE',
    status: 'Blocked',
    firstDetected: '2026-01-24T19:05:45',
    cweId: 'CWE-352',
    lastSeen: '2 days ago',
    endpointMethod: 'POST',
    endpointPath: '/api/v1/files/upload',
  },
  {
    id: '7',
    objectName: 'Server-side request forgery in image proxy',
    tags: ['api-abuse', 'account-takeover'],
    isActive: false,
    requests: 50000,
    sourceIp: '34.74.73.20',
    sourceProvider: 'AWS',
    parameter: 'header.X-CLIENT-ID',
    status: 'Monitoring',
    firstDetected: '2026-01-23T20:30:00',
    cweId: 'CWE-125',
    lastSeen: '3 days ago',
    endpointMethod: 'GET',
    endpointPath: '/api/v1/images/proxy',
  },
  {
    id: '8',
    objectName: 'Unvalidated redirects and forwards in auth flow',
    tags: ['api-abuse', 'account-takeover'],
    isActive: true,
    requests: 75000,
    sourceIp: '34.74.73.20',
    sourceProvider: 'AWS',
    parameter: 'header.X-RESPONSE-FORMAT',
    status: 'Monitoring',
    firstDetected: '2026-01-22T21:45:50',
    cweId: 'CWE-134',
    lastSeen: '4 days ago',
    endpointMethod: 'GET',
    endpointPath: '/api/v1/auth/redirect',
  },
  {
    id: '9',
    objectName: 'SQL injection in the user ID',
    tags: ['api-abuse', 'account-takeover'],
    isActive: false,
    requests: 15000,
    sourceIp: '34.74.73.20',
    sourceProvider: 'AWS',
    parameter: 'header.X-API-KEY',
    status: 'Blocked',
    firstDetected: '2026-01-31T12:15:00',
    cweId: 'CWE-79',
    lastSeen: '1 day ago',
    endpointMethod: 'DELETE',
    endpointPath: '/api/v1/users/:id',
  },
  {
    id: '10',
    objectName: 'Cross-site scripting in the API endpoint',
    tags: ['api-abuse', 'account-takeover'],
    isActive: false,
    requests: 18000,
    sourceIp: '34.74.73.20',
    sourceProvider: 'AWS',
    parameter: 'header.X-USER-ID',
    status: 'Blocked',
    firstDetected: '2026-01-30T13:30:45',
    cweId: 'CWE-89',
    lastSeen: '3 days ago',
    endpointMethod: 'PATCH',
    endpointPath: '/api/v1/content',
  },
];

// ---------------------------------------------------------------------------
// Security Events — columns
// ---------------------------------------------------------------------------

export const securityColumnHelper = createTableColumnHelper<SecurityEvent>();

export const securityColumns: TableColumnDef<SecurityEvent>[] = [
  securityColumnHelper.accessor('objectName', {
    header: 'Object name',
    size: 300,
    enableSorting: true,
    meta: { sortType: 'text' as const },
    cell: ({ row }) => (
      <VStack spacing={4}>
        <Text size='sm' truncate grow>
          {row.original.objectName}
        </Text>

        <HStack spacing={4}>
          {row.original.isActive && (
            <span className='flex items-center gap-4'>
              <span className='inline-block size-6 rounded-full bg-red-500' />
              <Text size='xs' color='secondary'>
                Now
              </Text>
            </span>
          )}
          {row.original.tags.map(tag => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </HStack>
      </VStack>
    ),
  }),
  securityColumnHelper.accessor('requests', {
    header: 'Requests',
    size: 100,
    enableSorting: true,
    meta: {
      sortType: 'number' as const,
      headerClassName: 'text-right',
      cellClassName: 'text-right',
    },
    cell: ({ getValue }) => <Text size='sm'>{formatRequests(getValue())}</Text>,
  }),
  securityColumnHelper.accessor('sourceIp', {
    header: 'Source',
    size: 180,
    enableSorting: true,
    meta: { sortType: 'text' as const },
    cell: ({ row }) => (
      <HStack spacing={8}>
        <HStack spacing={4}>
          <span className='text-sm'>🇺🇸</span>
          <Text size='sm'>{row.original.sourceIp}</Text>
        </HStack>
        <Badge color='slate' type='secondary' size='medium'>
          {row.original.sourceProvider}
        </Badge>
      </HStack>
    ),
  }),
  securityColumnHelper.accessor('parameter', {
    header: 'Parameters',
    size: 220,
    enableSorting: true,
    meta: { sortType: 'text' as const },
    cell: ({ getValue }) => <InlineCodeSnippet code={getValue()} size='sm' copyable={false} />,
  }),
  securityColumnHelper.accessor('status', {
    header: 'Status',
    size: 130,
    enableSorting: true,
    meta: { sortType: 'text' as const },
    cell: ({ getValue }) => {
      const status = getValue();
      return (
        <Badge
          variant='dotted'
          color={status === 'Blocked' ? 'red' : 'yellow'}
          type='secondary'
          size='medium'
        >
          {status}
        </Badge>
      );
    },
  }),
  securityColumnHelper.accessor('firstDetected', {
    header: 'First detected',
    size: 160,
    enableSorting: true,
    meta: { sortType: 'date' as const },
    cell: ({ getValue }) => {
      const { date, time } = formatDate(getValue());
      return (
        <VStack spacing={0}>
          <Text size='sm'>{date}</Text>
          <Text size='xs' color='secondary'>
            {time}
          </Text>
        </VStack>
      );
    },
  }),
  securityColumnHelper.accessor('cweId', {
    header: 'Security info',
    size: 130,
    enableSorting: true,
    meta: { sortType: 'text' as const },
    cell: ({ getValue }) => (
      <Badge color='gray' type='secondary' size='medium' textVariant='code'>
        {getValue()}
      </Badge>
    ),
  }),
  securityColumnHelper.accessor('lastSeen', {
    header: 'Last seen',
    size: 120,
    cell: ({ getValue }) => (
      <Text size='sm' color='secondary'>
        {getValue()}
      </Text>
    ),
  }),
  securityColumnHelper.display({
    id: 'endpoint',
    header: 'Endpoints',
    size: 220,
    cell: ({ row }) => (
      <HStack spacing={6}>
        <Badge
          color={METHOD_COLORS[row.original.endpointMethod] ?? 'slate'}
          type='secondary'
          size='medium'
          textVariant='code'
        >
          {row.original.endpointMethod}
        </Badge>
        <Text size='sm' truncate>
          {row.original.endpointPath}
        </Text>
      </HStack>
    ),
  }),
];

export const securityColumnIds = securityColumns
  .map(c => ('accessorKey' in c ? (c.accessorKey as string) : (c as { id?: string }).id) as string)
  .filter(Boolean);

// ---------------------------------------------------------------------------
// Grouped data — hierarchical with children
// ---------------------------------------------------------------------------

const createHeaderEntries = (groupId: string, count: number): SecurityHeaderEntry[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `${groupId}-${i + 1}`,
    objectName: '/v1/antibot/api/report/{parameter_1}',
    ip: '142.198.167.52/32',
    ipCountryFlag: '🇪🇸',
    provider: 'Azure',
    requests: 23000,
    status: 'New' as const,
    lastEdited: '2 days ago',
    lastSynced: '3 months ago',
    version: 'Up to date' as const,
  }));

export const groupedHeaderData: SecurityHeaderEntry[] = [
  {
    id: 'group-csp',
    objectName: 'Content Security Policy',
    ip: '',
    ipCountryFlag: '',
    provider: '',
    requests: 0,
    status: 'New',
    lastEdited: '',
    lastSynced: '',
    version: 'Up to date',
    children: createHeaderEntries('csp', 3),
  },
  {
    id: 'group-cto',
    objectName: 'Content-Type-Options',
    ip: '',
    ipCountryFlag: '',
    provider: '',
    requests: 0,
    status: 'New',
    lastEdited: '',
    lastSynced: '',
    version: 'Up to date',
    children: createHeaderEntries('cto', 5),
  },
  {
    id: 'group-xfo',
    objectName: 'X-Frame-Options',
    ip: '',
    ipCountryFlag: '',
    provider: '',
    requests: 0,
    status: 'New',
    lastEdited: '',
    lastSynced: '',
    version: 'Up to date',
    children: createHeaderEntries('xfo', 2),
  },
  {
    id: 'group-hsts',
    objectName: 'HTTP Strict Transport Security',
    ip: '',
    ipCountryFlag: '',
    provider: '',
    requests: 0,
    status: 'New',
    lastEdited: '',
    lastSynced: '',
    version: 'Up to date',
    children: createHeaderEntries('hsts', 4),
  },
];

// ---------------------------------------------------------------------------
// Grouped data — columns
// ---------------------------------------------------------------------------

export const headerColumnHelper = createTableColumnHelper<SecurityHeaderEntry>();

export const headerColumns: TableColumnDef<SecurityHeaderEntry>[] = [
  headerColumnHelper.accessor('objectName', {
    header: 'Object name',
    size: 300,
    enableSorting: true,
    meta: { sortType: 'text' as const },
    cell: ({ getValue }) => (
      <Text size='sm' truncate>
        {getValue()}
      </Text>
    ),
  }),
  headerColumnHelper.accessor('ip', {
    header: 'IP',
    size: 200,
    enableSorting: true,
    meta: { sortType: 'text' as const },
    cell: ({ row }) => (
      <HStack spacing={8}>
        <HStack spacing={4}>
          <span className='text-sm'>{row.original.ipCountryFlag}</span>
          <Text size='sm'>{row.original.ip}</Text>
        </HStack>
        <Badge color='slate' type='secondary' size='medium'>
          {row.original.provider}
        </Badge>
      </HStack>
    ),
  }),
  headerColumnHelper.accessor('requests', {
    header: 'Requests',
    size: 100,
    enableSorting: true,
    meta: {
      sortType: 'number' as const,
      headerClassName: 'text-right',
      cellClassName: 'text-right',
    },
    cell: ({ getValue }) => <Text size='sm'>{formatRequests(getValue())}</Text>,
  }),
  headerColumnHelper.accessor('status', {
    header: 'Status',
    size: 100,
    cell: ({ getValue }) => (
      <Badge color='blue' type='secondary' size='medium'>
        {getValue()}
      </Badge>
    ),
  }),
  headerColumnHelper.accessor('lastEdited', {
    header: 'Last edited',
    size: 130,
    enableSorting: true,
    meta: { sortType: 'date' as const },
    cell: ({ getValue }) => (
      <Text size='sm' color='secondary'>
        {getValue()}
      </Text>
    ),
  }),
  headerColumnHelper.accessor('lastSynced', {
    header: 'Last synced',
    size: 130,
    enableSorting: true,
    meta: { sortType: 'date' as const },
    cell: ({ getValue }) => (
      <Text size='sm' color='secondary'>
        {getValue()}
      </Text>
    ),
  }),
  headerColumnHelper.display({
    id: 'version',
    header: 'Version',
    size: 140,
    cell: ({ row }) => (
      <HStack spacing={4} align='center'>
        <Check size='sm' className='text-text-success' />
        <Text size='sm' color='inherit'>
          {row.original.version}
        </Text>
      </HStack>
    ),
  }),
];

export const headerColumnIds = headerColumns
  .map(c => ('accessorKey' in c ? (c.accessorKey as string) : (c as { id?: string }).id) as string)
  .filter(Boolean);

// ---------------------------------------------------------------------------
// Large grouped data — for FullFeatured + virtualization
// ---------------------------------------------------------------------------

const HEADER_GROUPS = [
  'Content Security Policy',
  'Content-Type-Options',
  'X-Frame-Options',
  'HTTP Strict Transport Security',
  'Referrer-Policy',
  'Permissions-Policy',
  'Cross-Origin-Opener-Policy',
  'Cross-Origin-Resource-Policy',
  'X-Content-Type-Options',
  'Cache-Control',
  'X-XSS-Protection',
  'Expect-CT',
] as const;

const IPS = ['142.198.167.52/32', '10.0.42.7/24', '192.168.1.100/32', '172.16.0.55/16'] as const;
const FLAGS = ['🇪🇸', '🇺🇸', '🇩🇪', '🇯🇵'] as const;
const PROVIDERS = ['Azure', 'AWS', 'GCP', 'Cloudflare'] as const;
const STATUSES = ['New', 'Active', 'Resolved'] as const;
const VERSIONS = ['Up to date', 'Outdated'] as const;
const ENDPOINTS = [
  '/v1/antibot/api/report/{parameter_1}',
  '/v1/auth/verify/{token}',
  '/v1/users/{id}/settings',
  '/v1/webhooks/process/{event_type}',
  '/v1/analytics/track/{metric}',
] as const;

export function createLargeGroupedData(
  groupCount = 12,
  childrenPerGroup = 50,
): SecurityHeaderEntry[] {
  return Array.from({ length: groupCount }, (_, gi) => {
    const groupName = HEADER_GROUPS.at(gi % HEADER_GROUPS.length)!;
    const groupId = `group-${gi}`;

    return {
      id: groupId,
      objectName: groupName,
      ip: '',
      ipCountryFlag: '',
      provider: '',
      requests: 0,
      status: 'New' as const,
      lastEdited: '',
      lastSynced: '',
      version: 'Up to date' as const,
      children: Array.from({ length: childrenPerGroup }, (_, ci) => ({
        id: `${groupId}-${ci}`,
        objectName: ENDPOINTS.at(ci % ENDPOINTS.length)!,
        ip: IPS.at(ci % IPS.length)!,
        ipCountryFlag: FLAGS.at(ci % FLAGS.length)!,
        provider: PROVIDERS.at(ci % PROVIDERS.length)!,
        requests: 5000 + ci * 1000,
        status: STATUSES.at(ci % STATUSES.length)!,
        lastEdited: `${(ci % 14) + 1} days ago`,
        lastSynced: `${(ci % 6) + 1} months ago`,
        version: VERSIONS.at(ci % VERSIONS.length)!,
      })),
    };
  });
}

// ---------------------------------------------------------------------------
// Large flat data — for a Virtualized story
// ---------------------------------------------------------------------------

export function createLargeSecurityEvents(count = 1000): SecurityEvent[] {
  return Array.from({ length: count }, (_, i) => {
    const base = securityEvents.at(i % securityEvents.length)!;

    return {
      ...base,
      id: String(i + 1),
      requests: Math.round(Math.random() * 100_000),
      firstDetected: `2026-01-${String((i % 28) + 1).padStart(2, '0')}T${String(i % 24).padStart(2, '0')}:00:00`,
    };
  });
}
