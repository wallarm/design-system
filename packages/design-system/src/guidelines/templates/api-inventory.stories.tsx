import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { fn } from 'storybook/test';
import { Attribute, AttributeLabel, AttributeValue } from '../../components/Attribute';
import { Badge, type BadgeColor } from '../../components/Badge';
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
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIllustration,
  EmptyStateMessage,
  EmptyStateTitle,
} from '../../components/EmptyState';
import { FormatDateTime } from '../../components/FormatDateTime';
import { FormatNumber } from '../../components/FormatNumber';
import { Heading } from '../../components/Heading';
import { HttpMethod, type HttpMethodName } from '../../components/HttpMethod';
import { NumericBadge } from '../../components/NumericBadge';
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
import { ParameterPath } from '../../components/ParameterPath';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../../components/Resizable';
import { ResponseCode } from '../../components/ResponseCode';
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaViewport,
} from '../../components/ScrollArea';
import { SearchInput } from '../../components/SearchInput';
import {
  SegmentedTabs,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from '../../components/SegmentedTabs';
import { Separator } from '../../components/Separator';
import { Skeleton } from '../../components/Skeleton';
import { HStack, VStack } from '../../components/Stack';
import type { TableCellContext, TableColumnDef } from '../../components/Table';
import { Table } from '../../components/Table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/Tabs';
import { Tag } from '../../components/Tag';
import { Text } from '../../components/Text';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/Tooltip';
import { TreeView, TreeViewItem } from '../../components/TreeView';
import {
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  CloudOff,
  Download,
  FilterX,
  Globe,
  RefreshCcw,
  SearchX,
} from '../../icons';

type SensitiveData = 'PII' | 'Credentials' | 'Payment card' | 'Auth token' | 'Phone number';

type Auth = 'JWT bearer' | 'API key' | 'Session cookie' | 'None';

interface Parameter {
  id: string;
  segments: string[];
  type: string;
  required: boolean;
  sensitive: SensitiveData | null;
}

interface EndpointResponse {
  code: number;
  share: number;
}

interface Endpoint {
  id: string;
  method: HttpMethodName;
  path: string;
  risk: number;
  auth: Auth;
  sensitive: SensitiveData[];
  isNew: boolean;
  requests: number;
  firstSeen: string;
  lastSeen: string;
  application: string;
  parameters: Parameter[];
  responses: EndpointResponse[];
}

interface ApiHost {
  id: string;
  host: string;
  endpoints: Endpoint[];
}

const OK_ONLY: EndpointResponse[] = [{ code: 200, share: 99 }];

const HOSTS: ApiHost[] = [
  {
    id: 'host-api',
    host: 'api.shop-demo.io',
    endpoints: [
      {
        id: 'api-products-get',
        method: 'GET',
        path: '/v2/products',
        risk: 2.1,
        auth: 'None',
        sensitive: [],
        isNew: false,
        requests: 1284000,
        firstSeen: '2026-03-02T09:14:00Z',
        lastSeen: '2026-11-05T11:58:00Z',
        application: 'Storefront',
        parameters: [
          {
            id: 'p1',
            segments: ['query', 'category'],
            type: 'string',
            required: false,
            sensitive: null,
          },
          {
            id: 'p2',
            segments: ['query', 'page'],
            type: 'integer',
            required: false,
            sensitive: null,
          },
          {
            id: 'p3',
            segments: ['query', 'limit'],
            type: 'integer',
            required: false,
            sensitive: null,
          },
        ],
        responses: [
          { code: 200, share: 97 },
          { code: 304, share: 3 },
        ],
      },
      {
        id: 'api-product-get',
        method: 'GET',
        path: '/v2/products/{id}',
        risk: 1.8,
        auth: 'None',
        sensitive: [],
        isNew: false,
        requests: 903000,
        firstSeen: '2026-03-02T09:14:00Z',
        lastSeen: '2026-11-05T11:59:00Z',
        application: 'Storefront',
        parameters: [
          { id: 'p1', segments: ['path', '2'], type: 'uuid', required: true, sensitive: null },
        ],
        responses: [
          { code: 200, share: 92 },
          { code: 404, share: 8 },
        ],
      },
      {
        id: 'api-cart-post',
        method: 'POST',
        path: '/v2/cart/items',
        risk: 4.6,
        auth: 'Session cookie',
        sensitive: [],
        isNew: false,
        requests: 214000,
        firstSeen: '2026-03-04T15:40:00Z',
        lastSeen: '2026-11-05T11:57:00Z',
        application: 'Storefront',
        parameters: [
          {
            id: 'p1',
            segments: ['cookie', 'session_id'],
            type: 'string',
            required: true,
            sensitive: 'Auth token',
          },
          {
            id: 'p2',
            segments: ['JSON', 'product_id'],
            type: 'uuid',
            required: true,
            sensitive: null,
          },
          {
            id: 'p3',
            segments: ['JSON', 'quantity'],
            type: 'integer',
            required: true,
            sensitive: null,
          },
        ],
        responses: [
          { code: 201, share: 95 },
          { code: 422, share: 5 },
        ],
      },
      {
        id: 'api-checkout-post',
        method: 'POST',
        path: '/v2/checkout',
        risk: 7.4,
        auth: 'Session cookie',
        sensitive: ['PII', 'Phone number'],
        isNew: false,
        requests: 48200,
        firstSeen: '2026-03-04T15:40:00Z',
        lastSeen: '2026-11-05T11:52:00Z',
        application: 'Storefront',
        parameters: [
          {
            id: 'p1',
            segments: ['JSON', 'shipping', 'full_name'],
            type: 'string',
            required: true,
            sensitive: 'PII',
          },
          {
            id: 'p2',
            segments: ['JSON', 'shipping', 'phone'],
            type: 'string',
            required: true,
            sensitive: 'Phone number',
          },
          {
            id: 'p3',
            segments: ['JSON', 'shipping', 'address'],
            type: 'string',
            required: true,
            sensitive: 'PII',
          },
          {
            id: 'p4',
            segments: ['JSON', 'coupon'],
            type: 'string',
            required: false,
            sensitive: null,
          },
        ],
        responses: [
          { code: 200, share: 91 },
          { code: 400, share: 6 },
          { code: 502, share: 3 },
        ],
      },
      {
        id: 'api-orders-get',
        method: 'GET',
        path: '/v2/orders',
        risk: 5.2,
        auth: 'JWT bearer',
        sensitive: ['PII'],
        isNew: false,
        requests: 96400,
        firstSeen: '2026-03-04T15:40:00Z',
        lastSeen: '2026-11-05T11:55:00Z',
        application: 'Account',
        parameters: [
          {
            id: 'p1',
            segments: ['header', 'Authorization'],
            type: 'string',
            required: true,
            sensitive: 'Auth token',
          },
          {
            id: 'p2',
            segments: ['query', 'status'],
            type: 'string',
            required: false,
            sensitive: null,
          },
        ],
        responses: [
          { code: 200, share: 96 },
          { code: 401, share: 4 },
        ],
      },
      {
        id: 'api-order-delete',
        method: 'DELETE',
        path: '/v2/orders/{id}',
        risk: 6.8,
        auth: 'JWT bearer',
        sensitive: [],
        isNew: true,
        requests: 310,
        firstSeen: '2026-11-03T08:21:00Z',
        lastSeen: '2026-11-05T10:12:00Z',
        application: 'Account',
        parameters: [
          { id: 'p1', segments: ['path', '2'], type: 'uuid', required: true, sensitive: null },
          {
            id: 'p2',
            segments: ['header', 'Authorization'],
            type: 'string',
            required: true,
            sensitive: 'Auth token',
          },
        ],
        responses: [
          { code: 204, share: 71 },
          { code: 403, share: 29 },
        ],
      },
      {
        id: 'api-profile-patch',
        method: 'PATCH',
        path: '/v2/users/me',
        risk: 6.1,
        auth: 'JWT bearer',
        sensitive: ['PII', 'Phone number'],
        isNew: false,
        requests: 12700,
        firstSeen: '2026-04-11T12:03:00Z',
        lastSeen: '2026-11-05T11:41:00Z',
        application: 'Account',
        parameters: [
          {
            id: 'p1',
            segments: ['JSON', 'email'],
            type: 'email',
            required: false,
            sensitive: 'PII',
          },
          {
            id: 'p2',
            segments: ['JSON', 'phone'],
            type: 'string',
            required: false,
            sensitive: 'Phone number',
          },
        ],
        responses: [
          { code: 200, share: 94 },
          { code: 422, share: 6 },
        ],
      },
      {
        id: 'api-health-head',
        method: 'HEAD',
        path: '/health',
        risk: 1.0,
        auth: 'None',
        sensitive: [],
        isNew: false,
        requests: 518000,
        firstSeen: '2026-03-02T09:14:00Z',
        lastSeen: '2026-11-05T11:59:00Z',
        application: 'Platform',
        parameters: [],
        responses: OK_ONLY,
      },
    ],
  },
  {
    id: 'host-auth',
    host: 'auth.shop-demo.io',
    endpoints: [
      {
        id: 'auth-login-post',
        method: 'POST',
        path: '/oauth/token',
        risk: 8.2,
        auth: 'None',
        sensitive: ['Credentials', 'Auth token'],
        isNew: false,
        requests: 142000,
        firstSeen: '2026-03-02T09:20:00Z',
        lastSeen: '2026-11-05T11:59:00Z',
        application: 'Identity',
        parameters: [
          {
            id: 'p1',
            segments: ['form', 'username'],
            type: 'string',
            required: true,
            sensitive: 'PII',
          },
          {
            id: 'p2',
            segments: ['form', 'password'],
            type: 'string',
            required: true,
            sensitive: 'Credentials',
          },
          {
            id: 'p3',
            segments: ['form', 'grant_type'],
            type: 'string',
            required: true,
            sensitive: null,
          },
        ],
        responses: [
          { code: 200, share: 82 },
          { code: 401, share: 17 },
          { code: 429, share: 1 },
        ],
      },
      {
        id: 'auth-refresh-post',
        method: 'POST',
        path: '/oauth/refresh',
        risk: 6.4,
        auth: 'None',
        sensitive: ['Auth token'],
        isNew: false,
        requests: 388000,
        firstSeen: '2026-03-02T09:20:00Z',
        lastSeen: '2026-11-05T11:59:00Z',
        application: 'Identity',
        parameters: [
          {
            id: 'p1',
            segments: ['JSON', 'refresh_token'],
            type: 'string',
            required: true,
            sensitive: 'Auth token',
          },
        ],
        responses: [
          { code: 200, share: 98 },
          { code: 400, share: 2 },
        ],
      },
      {
        id: 'auth-reset-post',
        method: 'POST',
        path: '/password/reset',
        risk: 7.1,
        auth: 'None',
        sensitive: ['PII'],
        isNew: false,
        requests: 2900,
        firstSeen: '2026-05-19T07:45:00Z',
        lastSeen: '2026-11-05T09:33:00Z',
        application: 'Identity',
        parameters: [
          {
            id: 'p1',
            segments: ['JSON', 'email'],
            type: 'email',
            required: true,
            sensitive: 'PII',
          },
        ],
        responses: [{ code: 202, share: 100 }],
      },
      {
        id: 'auth-jwks-get',
        method: 'GET',
        path: '/.well-known/jwks.json',
        risk: 1.2,
        auth: 'None',
        sensitive: [],
        isNew: false,
        requests: 61000,
        firstSeen: '2026-03-02T09:20:00Z',
        lastSeen: '2026-11-05T11:58:00Z',
        application: 'Identity',
        parameters: [],
        responses: OK_ONLY,
      },
    ],
  },
  {
    id: 'host-payments',
    host: 'payments.shop-demo.io',
    endpoints: [
      {
        id: 'pay-cards-post',
        method: 'POST',
        path: '/v1/cards',
        risk: 9.1,
        auth: 'JWT bearer',
        sensitive: ['Payment card', 'PII', 'Auth token'],
        isNew: false,
        requests: 18400,
        firstSeen: '2026-03-09T10:02:00Z',
        lastSeen: '2026-11-05T11:47:00Z',
        application: 'Payments',
        parameters: [
          {
            id: 'p1',
            segments: ['header', 'Authorization'],
            type: 'string',
            required: true,
            sensitive: 'Auth token',
          },
          {
            id: 'p2',
            segments: ['JSON', 'card', 'number'],
            type: 'string',
            required: true,
            sensitive: 'Payment card',
          },
          {
            id: 'p3',
            segments: ['JSON', 'card', 'cvc'],
            type: 'string',
            required: true,
            sensitive: 'Payment card',
          },
          {
            id: 'p4',
            segments: ['JSON', 'card', 'expiry'],
            type: 'string',
            required: true,
            sensitive: 'Payment card',
          },
          {
            id: 'p5',
            segments: ['JSON', 'holder_name'],
            type: 'string',
            required: true,
            sensitive: 'PII',
          },
          {
            id: 'p6',
            segments: ['JSON', 'billing', 'postal_code'],
            type: 'string',
            required: false,
            sensitive: 'PII',
          },
          {
            id: 'p7',
            segments: ['query', 'idempotency_key'],
            type: 'uuid',
            required: false,
            sensitive: null,
          },
        ],
        responses: [
          { code: 201, share: 88 },
          { code: 402, share: 7 },
          { code: 422, share: 4 },
          { code: 500, share: 1 },
        ],
      },
      {
        id: 'pay-cards-get',
        method: 'GET',
        path: '/v1/cards',
        risk: 6.9,
        auth: 'JWT bearer',
        sensitive: ['Payment card'],
        isNew: false,
        requests: 40100,
        firstSeen: '2026-03-09T10:02:00Z',
        lastSeen: '2026-11-05T11:50:00Z',
        application: 'Payments',
        parameters: [
          {
            id: 'p1',
            segments: ['header', 'Authorization'],
            type: 'string',
            required: true,
            sensitive: 'Auth token',
          },
        ],
        responses: [
          { code: 200, share: 97 },
          { code: 401, share: 3 },
        ],
      },
      {
        id: 'pay-intents-post',
        method: 'POST',
        path: '/v1/payment-intents',
        risk: 7.8,
        auth: 'API key',
        sensitive: ['Payment card'],
        isNew: false,
        requests: 51300,
        firstSeen: '2026-03-09T10:02:00Z',
        lastSeen: '2026-11-05T11:56:00Z',
        application: 'Payments',
        parameters: [
          {
            id: 'p1',
            segments: ['header', 'X-Api-Key'],
            type: 'string',
            required: true,
            sensitive: 'Credentials',
          },
          {
            id: 'p2',
            segments: ['JSON', 'amount'],
            type: 'integer',
            required: true,
            sensitive: null,
          },
          {
            id: 'p3',
            segments: ['JSON', 'currency'],
            type: 'string',
            required: true,
            sensitive: null,
          },
        ],
        responses: [
          { code: 200, share: 93 },
          { code: 402, share: 7 },
        ],
      },
      {
        id: 'pay-refund-put',
        method: 'PUT',
        path: '/v1/refunds/{id}',
        risk: 5.9,
        auth: 'API key',
        sensitive: [],
        isNew: true,
        requests: 870,
        firstSeen: '2026-11-02T16:30:00Z',
        lastSeen: '2026-11-05T08:04:00Z',
        application: 'Payments',
        parameters: [
          { id: 'p1', segments: ['path', '2'], type: 'uuid', required: true, sensitive: null },
          {
            id: 'p2',
            segments: ['JSON', 'reason'],
            type: 'string',
            required: false,
            sensitive: null,
          },
        ],
        responses: [{ code: 200, share: 100 }],
      },
      {
        id: 'pay-webhook-post',
        method: 'POST',
        path: '/v1/webhooks/acquirer',
        risk: 4.3,
        auth: 'None',
        sensitive: [],
        isNew: false,
        requests: 22800,
        firstSeen: '2026-06-21T13:11:00Z',
        lastSeen: '2026-11-05T11:44:00Z',
        application: 'Payments',
        parameters: [
          {
            id: 'p1',
            segments: ['header', 'X-Signature'],
            type: 'string',
            required: true,
            sensitive: null,
          },
          {
            id: 'p2',
            segments: ['JSON', 'event'],
            type: 'string',
            required: true,
            sensitive: null,
          },
        ],
        responses: OK_ONLY,
      },
    ],
  },
  {
    id: 'host-partners',
    host: 'partners.shop-demo.io',
    endpoints: [
      {
        id: 'partner-catalog-get',
        method: 'GET',
        path: '/feed/catalog.xml',
        risk: 3.2,
        auth: 'API key',
        sensitive: [],
        isNew: false,
        requests: 7600,
        firstSeen: '2026-07-14T06:00:00Z',
        lastSeen: '2026-11-05T06:00:00Z',
        application: 'Partner feed',
        parameters: [
          {
            id: 'p1',
            segments: ['query', 'api_key'],
            type: 'string',
            required: true,
            sensitive: 'Credentials',
          },
        ],
        responses: OK_ONLY,
      },
      {
        id: 'partner-export-get',
        method: 'GET',
        path: '/legacy/customers/export',
        risk: 8.7,
        auth: 'None',
        sensitive: ['PII', 'Phone number'],
        isNew: true,
        requests: 140,
        firstSeen: '2026-11-04T22:17:00Z',
        lastSeen: '2026-11-05T03:40:00Z',
        application: 'Partner feed',
        parameters: [
          { id: 'p1', segments: ['query', 'from'], type: 'date', required: false, sensitive: null },
          {
            id: 'p2',
            segments: ['query', 'format'],
            type: 'string',
            required: false,
            sensitive: null,
          },
        ],
        responses: [{ code: 200, share: 100 }],
      },
      {
        id: 'partner-options',
        method: 'OPTIONS',
        path: '/feed/*',
        risk: 1.0,
        auth: 'None',
        sensitive: [],
        isNew: false,
        requests: 3100,
        firstSeen: '2026-07-14T06:00:00Z',
        lastSeen: '2026-11-05T11:02:00Z',
        application: 'Partner feed',
        parameters: [],
        responses: [{ code: 204, share: 100 }],
      },
    ],
  },
];

const ALL_ENDPOINTS = HOSTS.flatMap(host => host.endpoints);
const HOST_IDS = HOSTS.map(host => host.id);
const HOST_BY_ENDPOINT = new Map(
  HOSTS.flatMap(host => host.endpoints.map(endpoint => [endpoint.id, host.host] as const)),
);

const SENSITIVE_COLOR: Record<SensitiveData, BadgeColor> = {
  PII: 'violet',
  Credentials: 'red',
  'Payment card': 'amber',
  'Auth token': 'rose',
  'Phone number': 'indigo',
};

const getRisk = (score: number) => {
  if (score >= 7) {
    return { label: 'High', color: 'red' } as const;
  }
  if (score >= 4) {
    return { label: 'Medium', color: 'amber' } as const;
  }
  return { label: 'Low', color: 'green' } as const;
};

const pluralize = (count: number, noun: string) => `${count} ${noun}${count === 1 ? '' : 's'}`;

const getParameterId = (parameter: Parameter) => parameter.id;
const getResponseId = (response: EndpointResponse) => String(response.code);

const onExport = fn().mockName('onExport');
const onUploadSpec = fn().mockName('onUploadSpec');
const onViewRequests = fn().mockName('onViewRequests');
const onMarkReviewed = fn().mockName('onMarkReviewed');
const onAddToPolicy = fn().mockName('onAddToPolicy');
const onHideEndpoint = fn().mockName('onHideEndpoint');
const onRetryInventory = fn().mockName('onRetryInventory');

const meta = {
  title: 'Templates/API inventory',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when building an API discovery screen: a host and endpoint tree on the left and an inspector with risk, sensitive data and parameters on the right.',
      },
    },
  },
} satisfies Meta;

export default meta;

/**
 * The whole screen with an endpoint open. Search and the status tabs filter the tree; hosts
 * expand and collapse; selecting an endpoint fills the inspector with its risk, sensitive data,
 * traffic and a parameters table built from `ParameterPath`. Drag the handle to resize.
 */
export const Default: StoryFn = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [openIds, setOpenIds] = useState<string[]>(HOST_IDS);
  const [selectedId, setSelectedId] = useState<string | null>('pay-cards-post');
  const [tab, setTab] = useState('parameters');

  const search = query.trim().toLowerCase();
  const matchesSearch = (host: ApiHost, endpoint: Endpoint) =>
    host.host.includes(search) || endpoint.path.toLowerCase().includes(search);
  const searched = HOSTS.map(host => ({
    ...host,
    endpoints: host.endpoints.filter(endpoint => matchesSearch(host, endpoint)),
  }));
  const counts = {
    all: searched.flatMap(host => host.endpoints).length,
    sensitive: searched.flatMap(host => host.endpoints).filter(e => e.sensitive.length > 0).length,
    new: searched.flatMap(host => host.endpoints).filter(e => e.isNew).length,
  };
  const visibleHosts = searched
    .map(host => ({
      ...host,
      endpoints: host.endpoints.filter(
        endpoint =>
          status === 'all' ||
          (status === 'sensitive' && endpoint.sensitive.length > 0) ||
          (status === 'new' && endpoint.isNew),
      ),
    }))
    .filter(host => host.endpoints.length > 0);

  const visibleEndpointCount = visibleHosts.flatMap(host => host.endpoints).length;

  const endpoint = ALL_ENDPOINTS.find(item => item.id === selectedId) ?? null;
  const risk = endpoint ? getRisk(endpoint.risk) : null;

  const toggleHost = (id: string) =>
    setOpenIds(prev => (prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]));
  // Hosts are branches: a click on a host row toggles it instead of selecting it.
  const handleSelectionChange = (ids: string[]) => {
    const [id] = ids;
    if (id && HOST_IDS.includes(id)) {
      toggleHost(id);
      return;
    }
    setSelectedId(id ?? null);
    setTab('parameters');
  };
  const handleHostOpenChange = (id: string) => () => toggleHost(id);
  const handleExpandAll = () => setOpenIds(HOST_IDS);
  const handleCollapseAll = () => setOpenIds([]);
  // A new search reopens every host so matches are never hidden in a collapsed branch.
  const handleSearchChange = (value: string) => {
    setQuery(value);
    setOpenIds(HOST_IDS);
  };
  const handleReset = () => {
    setQuery('');
    setStatus('all');
  };
  const handleViewRequests = () => onViewRequests(endpoint);
  const handleMarkReviewed = () => onMarkReviewed(endpoint);
  const handleAddToPolicy = () => onAddToPolicy(endpoint);
  const handleHide = () => onHideEndpoint(endpoint);

  const renderParameter = ({ row }: TableCellContext<Parameter, unknown>) => (
    <ParameterPath segments={row.original.segments} />
  );
  const renderRequired = ({ row }: TableCellContext<Parameter, unknown>) =>
    row.original.required ? 'Required' : 'Optional';
  const renderSensitive = ({ row }: TableCellContext<Parameter, unknown>) =>
    row.original.sensitive ? (
      <Badge type='secondary' color={SENSITIVE_COLOR[row.original.sensitive]}>
        {row.original.sensitive}
      </Badge>
    ) : (
      '—'
    );
  const renderCode = ({ row }: TableCellContext<EndpointResponse, unknown>) => (
    <ResponseCode code={row.original.code} />
  );
  const renderShare = ({ row }: TableCellContext<EndpointResponse, unknown>) => (
    <FormatNumber value={row.original.share} type='percent' />
  );

  const parameterColumns: TableColumnDef<Parameter>[] = [
    { id: 'parameter', header: 'Parameter', size: 300, cell: renderParameter },
    { accessorKey: 'type', header: 'Type', size: 120 },
    { id: 'required', header: 'Presence', size: 120, cell: renderRequired },
    { id: 'sensitive', header: 'Sensitive data', size: 160, cell: renderSensitive },
  ];
  const responseColumns: TableColumnDef<EndpointResponse>[] = [
    { id: 'code', header: 'Status', size: 160, cell: renderCode },
    { id: 'share', header: 'Share of responses', size: 200, cell: renderShare },
  ];

  return (
    <Page name='api-inventory' fullSize fixedHeight data-testid='api-inventory-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>API inventory</PageTitle>
          <PageDescription>
            Hosts and endpoints discovered from live traffic, with the parameters and sensitive data
            each one carries.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button variant='secondary' color='neutral' size='medium' onClick={onExport}>
            <Download />
            Export
          </Button>
          <Button size='medium' onClick={onUploadSpec} data-testid='api-inventory-upload'>
            Upload specification
          </Button>
        </PageActions>
      </PageHeader>

      <PageToolbar>
        <SearchInput
          value={query}
          onChange={handleSearchChange}
          placeholder='Search host or path'
          className='w-[320px]'
          data-testid='api-inventory-search'
        />
        <SegmentedTabs value={status} onChange={setStatus} data-testid='api-inventory-status'>
          <SegmentedTabsList>
            <SegmentedTabsTrigger value='all'>
              All <NumericBadge>{counts.all}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='sensitive'>
              Sensitive data <NumericBadge>{counts.sensitive}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='new'>
              New <NumericBadge>{counts.new}</NumericBadge>
            </SegmentedTabsTrigger>
          </SegmentedTabsList>
        </SegmentedTabs>
      </PageToolbar>

      <PageContent>
        <div className='h-full overflow-hidden rounded-12 border border-border-primary'>
          <ResizablePanelGroup data-testid='api-inventory-split'>
            <ResizablePanel id='tree' defaultSize='32%' minSize='22%' maxSize='50%'>
              <div className='flex h-full flex-col'>
                <HStack justify='between' align='center' className='h-40 shrink-0 px-12'>
                  <Text size='xs' weight='medium' color='secondary'>
                    {pluralize(visibleHosts.length, 'host')} ·{' '}
                    {pluralize(visibleEndpointCount, 'endpoint')}
                  </Text>
                  <HStack gap={2}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          color='neutral'
                          size='small'
                          aria-label='Expand all hosts'
                          onClick={handleExpandAll}
                        >
                          <ChevronsUpDown />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Expand all</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          color='neutral'
                          size='small'
                          aria-label='Collapse all hosts'
                          onClick={handleCollapseAll}
                        >
                          <ChevronsDownUp />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Collapse all</TooltipContent>
                    </Tooltip>
                  </HStack>
                </HStack>
                <Separator />
                <ScrollArea className='min-h-0 flex-1'>
                  <ScrollAreaViewport>
                    <ScrollAreaContent className='min-w-0! py-4'>
                      {visibleHosts.length > 0 ? (
                        <TreeView
                          selectable
                          selectedIds={selectedId ? [selectedId] : []}
                          onSelectionChange={handleSelectionChange}
                          aria-label='Hosts and endpoints'
                          data-testid='api-inventory-tree'
                        >
                          {visibleHosts.map(host => (
                            <TreeViewItem
                              key={host.id}
                              id={host.id}
                              open={openIds.includes(host.id)}
                              onOpenChange={handleHostOpenChange(host.id)}
                              data-testid={`api-inventory-host-${host.id}`}
                            >
                              <Globe />
                              {host.host}
                              <NumericBadge>{host.endpoints.length}</NumericBadge>
                              {host.endpoints.map(item => (
                                <TreeViewItem
                                  key={item.id}
                                  id={item.id}
                                  data-testid={`api-inventory-endpoint-${item.id}`}
                                >
                                  <span className='flex w-64 shrink-0'>
                                    <HttpMethod method={item.method} size='small' />
                                  </span>
                                  {item.path}
                                  <Badge
                                    variant='dotted'
                                    type='text-color'
                                    size='small'
                                    color={getRisk(item.risk).color}
                                  >
                                    {item.risk.toFixed(1)}
                                  </Badge>
                                </TreeViewItem>
                              ))}
                            </TreeViewItem>
                          ))}
                        </TreeView>
                      ) : (
                        <div className='flex justify-center py-48'>
                          <EmptyState
                            type='collection-empty'
                            data-testid='api-inventory-no-results'
                          >
                            <EmptyStateIllustration>
                              <SearchX />
                            </EmptyStateIllustration>
                            <EmptyStateMessage>
                              <EmptyStateTitle>No results found</EmptyStateTitle>
                              <EmptyStateDescription>
                                Nothing matches your search or status.
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
                        </div>
                      )}
                    </ScrollAreaContent>
                  </ScrollAreaViewport>
                  <ScrollAreaScrollbar />
                </ScrollArea>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel id='inspector' defaultSize='68%' minSize='40%'>
              {endpoint && risk ? (
                <ScrollArea className='h-full' data-testid='api-inventory-inspector'>
                  <ScrollAreaViewport>
                    <ScrollAreaContent className='min-w-0!'>
                      <HStack
                        justify='between'
                        align='start'
                        gap={16}
                        className='px-24 pt-20 pb-16'
                      >
                        <VStack gap={6} className='min-w-0'>
                          <HStack gap={8} align='center'>
                            <HttpMethod method={endpoint.method} size='large' />
                            <Heading
                              as='h2'
                              size='lg'
                              weight='medium'
                              truncate
                              data-testid='api-inventory-title'
                            >
                              {endpoint.path}
                            </Heading>
                          </HStack>
                          <HStack gap={6} align='center'>
                            <Text size='sm' color='secondary'>
                              {HOST_BY_ENDPOINT.get(endpoint.id)}
                            </Text>
                            {endpoint.isNew && (
                              <Badge type='secondary' color='blue' size='small'>
                                New
                              </Badge>
                            )}
                          </HStack>
                        </VStack>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='outline'
                              color='neutral'
                              size='small'
                              data-testid='api-inventory-actions'
                            >
                              Actions <ChevronDown />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onSelect={handleMarkReviewed}>
                              <DropdownMenuItemText>Mark as reviewed</DropdownMenuItemText>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={handleAddToPolicy}>
                              <DropdownMenuItemText>Add to API policy</DropdownMenuItemText>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={handleViewRequests}>
                              <DropdownMenuItemText>Go to requests</DropdownMenuItemText>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant='destructive' onSelect={handleHide}>
                              <DropdownMenuItemText>Hide endpoint</DropdownMenuItemText>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </HStack>

                      <div
                        className='grid grid-cols-2 gap-x-8 gap-y-6 px-24 pb-16'
                        data-testid='api-inventory-attributes'
                      >
                        <Attribute orientation='horizontal'>
                          <AttributeLabel>Risk score</AttributeLabel>
                          <AttributeValue>
                            <HStack gap={8} align='center'>
                              <Badge variant='dotted' type='secondary' color={risk.color}>
                                {risk.label}
                              </Badge>
                              <Text size='sm'>{endpoint.risk.toFixed(1)} of 10</Text>
                            </HStack>
                          </AttributeValue>
                        </Attribute>
                        <Attribute orientation='horizontal'>
                          <AttributeLabel>Requests, 24h</AttributeLabel>
                          <AttributeValue>
                            <FormatNumber value={endpoint.requests} unit='requests' />
                          </AttributeValue>
                        </Attribute>
                        <Attribute
                          orientation='horizontal'
                          isEmpty={endpoint.sensitive.length === 0}
                        >
                          <AttributeLabel>Sensitive data</AttributeLabel>
                          <AttributeValue>
                            <HStack gap={4} wrap='wrap'>
                              {endpoint.sensitive.map(item => (
                                <Badge key={item} type='secondary' color={SENSITIVE_COLOR[item]}>
                                  {item}
                                </Badge>
                              ))}
                            </HStack>
                          </AttributeValue>
                        </Attribute>
                        <Attribute orientation='horizontal'>
                          <AttributeLabel>First seen</AttributeLabel>
                          <AttributeValue>
                            <FormatDateTime
                              value={endpoint.firstSeen}
                              format='datetime'
                              layout='inline'
                            />
                          </AttributeValue>
                        </Attribute>
                        <Attribute orientation='horizontal'>
                          <AttributeLabel>Authentication</AttributeLabel>
                          <AttributeValue>
                            {endpoint.auth === 'None' ? (
                              <Badge variant='dotted' type='secondary' color='red'>
                                Unauthenticated
                              </Badge>
                            ) : (
                              <Tag>{endpoint.auth}</Tag>
                            )}
                          </AttributeValue>
                        </Attribute>
                        <Attribute orientation='horizontal'>
                          <AttributeLabel>Last seen</AttributeLabel>
                          <AttributeValue>
                            <FormatDateTime
                              value={endpoint.lastSeen}
                              format='datetime'
                              layout='inline'
                            />
                          </AttributeValue>
                        </Attribute>
                        <Attribute orientation='horizontal'>
                          <AttributeLabel>Status codes</AttributeLabel>
                          <AttributeValue>
                            <HStack gap={4}>
                              {endpoint.responses.map(response => (
                                <ResponseCode key={response.code} code={response.code} />
                              ))}
                            </HStack>
                          </AttributeValue>
                        </Attribute>
                        <Attribute orientation='horizontal'>
                          <AttributeLabel>Application</AttributeLabel>
                          <AttributeValue>
                            <Tag>{endpoint.application}</Tag>
                          </AttributeValue>
                        </Attribute>
                      </div>

                      <Tabs value={tab} onChange={setTab} data-testid='api-inventory-tabs'>
                        <TabsList>
                          <TabsTrigger value='parameters'>
                            Parameters <NumericBadge>{endpoint.parameters.length}</NumericBadge>
                          </TabsTrigger>
                          <TabsTrigger value='responses'>
                            Responses <NumericBadge>{endpoint.responses.length}</NumericBadge>
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value='parameters'>
                          <div className='px-16 pt-8 pb-16'>
                            <Table
                              aria-label='Parameters'
                              data={endpoint.parameters}
                              columns={parameterColumns}
                              getRowId={getParameterId}
                              data-testid='api-inventory-parameters'
                            >
                              {endpoint.parameters.length === 0 && (
                                <EmptyState type='collection-empty'>
                                  <EmptyStateMessage>
                                    <EmptyStateTitle>No parameters</EmptyStateTitle>
                                    <EmptyStateDescription>
                                      Requests to this endpoint carry no query, body or header
                                      parameters.
                                    </EmptyStateDescription>
                                  </EmptyStateMessage>
                                </EmptyState>
                              )}
                            </Table>
                          </div>
                        </TabsContent>
                        <TabsContent value='responses'>
                          <div className='px-16 pt-8 pb-16'>
                            <Table
                              aria-label='Responses'
                              data={endpoint.responses}
                              columns={responseColumns}
                              getRowId={getResponseId}
                              data-testid='api-inventory-responses'
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </ScrollAreaContent>
                  </ScrollAreaViewport>
                  <ScrollAreaScrollbar />
                </ScrollArea>
              ) : (
                <div
                  className='flex h-full items-center justify-center'
                  data-testid='api-inventory-inspector-empty'
                >
                  <Text size='sm' color='secondary'>
                    Select an endpoint to view details
                  </Text>
                </div>
              )}
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </PageContent>
    </Page>
  );
};

/**
 * Nothing is selected yet: the tree is ready and the inspector names the choice that fills it,
 * with no action of its own.
 */
export const NothingSelected: StoryFn = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const counts = {
    all: ALL_ENDPOINTS.length,
    sensitive: ALL_ENDPOINTS.filter(endpoint => endpoint.sensitive.length > 0).length,
    new: ALL_ENDPOINTS.filter(endpoint => endpoint.isNew).length,
  };

  return (
    <Page name='api-inventory' fullSize fixedHeight data-testid='api-inventory-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>API inventory</PageTitle>
          <PageDescription>
            Hosts and endpoints discovered from live traffic, with the parameters and sensitive data
            each one carries.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button variant='secondary' color='neutral' size='medium' onClick={onExport}>
            <Download />
            Export
          </Button>
          <Button size='medium' onClick={onUploadSpec} data-testid='api-inventory-upload'>
            Upload specification
          </Button>
        </PageActions>
      </PageHeader>

      <PageToolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder='Search host or path'
          className='w-[320px]'
          data-testid='api-inventory-search'
        />
        <SegmentedTabs value={status} onChange={setStatus} data-testid='api-inventory-status'>
          <SegmentedTabsList>
            <SegmentedTabsTrigger value='all'>
              All <NumericBadge>{counts.all}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='sensitive'>
              Sensitive data <NumericBadge>{counts.sensitive}</NumericBadge>
            </SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='new'>
              New <NumericBadge>{counts.new}</NumericBadge>
            </SegmentedTabsTrigger>
          </SegmentedTabsList>
        </SegmentedTabs>
      </PageToolbar>

      <PageContent>
        <div className='h-full overflow-hidden rounded-12 border border-border-primary'>
          <ResizablePanelGroup data-testid='api-inventory-split'>
            <ResizablePanel id='tree' defaultSize='32%' minSize='22%' maxSize='50%'>
              <div className='flex h-full flex-col'>
                <HStack align='center' className='h-40 shrink-0 px-12'>
                  <Text size='xs' weight='medium' color='secondary'>
                    {HOSTS.length} hosts · {ALL_ENDPOINTS.length} endpoints
                  </Text>
                </HStack>
                <Separator />
                <ScrollArea className='min-h-0 flex-1'>
                  <ScrollAreaViewport>
                    <ScrollAreaContent className='min-w-0! py-4'>
                      <TreeView
                        selectable
                        aria-label='Hosts and endpoints'
                        data-testid='api-inventory-tree'
                      >
                        {HOSTS.map(host => (
                          <TreeViewItem key={host.id} defaultOpen>
                            <Globe />
                            {host.host}
                            <NumericBadge>{host.endpoints.length}</NumericBadge>
                            {host.endpoints.map(item => (
                              <TreeViewItem key={item.id} id={item.id}>
                                <span className='flex w-64 shrink-0'>
                                  <HttpMethod method={item.method} size='small' />
                                </span>
                                {item.path}
                                <Badge
                                  variant='dotted'
                                  type='text-color'
                                  size='small'
                                  color={getRisk(item.risk).color}
                                >
                                  {item.risk.toFixed(1)}
                                </Badge>
                              </TreeViewItem>
                            ))}
                          </TreeViewItem>
                        ))}
                      </TreeView>
                    </ScrollAreaContent>
                  </ScrollAreaViewport>
                  <ScrollAreaScrollbar />
                </ScrollArea>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel id='inspector' defaultSize='68%' minSize='40%'>
              <div
                className='flex h-full items-center justify-center'
                data-testid='api-inventory-inspector-empty'
              >
                <Text size='sm' color='secondary'>
                  Select an endpoint to view details
                </Text>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </PageContent>
    </Page>
  );
};

/**
 * The inventory failed to load: the header and toolbar stay, the tree panel shows the error in
 * place of the hosts with "Try again", and the inspector has nothing to show.
 */
export const LoadError: StoryFn = () => (
  <Page name='api-inventory' fullSize fixedHeight data-testid='api-inventory-page'>
    <PageHeader>
      <PageHeaderGroup className='flex-1'>
        <PageTitle>API inventory</PageTitle>
        <PageDescription>
          Hosts and endpoints discovered from live traffic, with the parameters and sensitive data
          each one carries.
        </PageDescription>
      </PageHeaderGroup>
      <PageActions>
        <Button variant='secondary' color='neutral' size='medium' onClick={onExport}>
          <Download />
          Export
        </Button>
        <Button size='medium' onClick={onUploadSpec} data-testid='api-inventory-upload'>
          Upload specification
        </Button>
      </PageActions>
    </PageHeader>

    <PageToolbar>
      <SearchInput
        placeholder='Search host or path'
        className='w-[320px]'
        data-testid='api-inventory-search'
      />
      <SegmentedTabs defaultValue='all' data-testid='api-inventory-status'>
        <SegmentedTabsList>
          <SegmentedTabsTrigger value='all'>All</SegmentedTabsTrigger>
          <SegmentedTabsTrigger value='sensitive'>Sensitive data</SegmentedTabsTrigger>
          <SegmentedTabsTrigger value='new'>New</SegmentedTabsTrigger>
        </SegmentedTabsList>
      </SegmentedTabs>
    </PageToolbar>

    <PageContent>
      <div className='h-full overflow-hidden rounded-12 border border-border-primary'>
        <ResizablePanelGroup data-testid='api-inventory-split'>
          <ResizablePanel id='tree' defaultSize='32%' minSize='22%' maxSize='50%'>
            <div className='flex justify-center py-48'>
              <EmptyState data-testid='api-inventory-error'>
                <EmptyStateIllustration>
                  <CloudOff />
                </EmptyStateIllustration>
                <EmptyStateMessage>
                  <EmptyStateTitle>Couldn't load endpoints</EmptyStateTitle>
                  <EmptyStateDescription>
                    The server didn't respond. Try again in a moment.
                  </EmptyStateDescription>
                </EmptyStateMessage>
                <EmptyStateActions>
                  <Button
                    size='medium'
                    variant='outline'
                    color='neutral'
                    onClick={onRetryInventory}
                  >
                    <RefreshCcw />
                    Try again
                  </Button>
                </EmptyStateActions>
              </EmptyState>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel id='inspector' defaultSize='68%' minSize='40%'>
            <div className='flex h-full items-center justify-center'>
              <Text size='sm' color='secondary'>
                Select an endpoint to view details
              </Text>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </PageContent>
  </Page>
);

const SKELETON_ROWS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12'];
const SKELETON_ATTRIBUTES = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'];

/**
 * First load: the real header and toolbar stay, the tree and the inspector fill with skeletons,
 * and the parameters table shows placeholder rows. Never a `Loader` in place of the screen.
 */
export const Loading: StoryFn = () => {
  const parameterColumns: TableColumnDef<Parameter>[] = [
    { id: 'parameter', header: 'Parameter', size: 300 },
    { accessorKey: 'type', header: 'Type', size: 120 },
    { id: 'required', header: 'Presence', size: 120 },
    { id: 'sensitive', header: 'Sensitive data', size: 160 },
  ];

  return (
    <Page name='api-inventory' fullSize fixedHeight data-testid='api-inventory-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>API inventory</PageTitle>
          <PageDescription>
            Hosts and endpoints discovered from live traffic, with the parameters and sensitive data
            each one carries.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button variant='secondary' color='neutral' size='medium' onClick={onExport}>
            <Download />
            Export
          </Button>
          <Button size='medium' onClick={onUploadSpec} data-testid='api-inventory-upload'>
            Upload specification
          </Button>
        </PageActions>
      </PageHeader>

      <PageToolbar>
        <SearchInput
          placeholder='Search host or path'
          className='w-[320px]'
          disabled
          data-testid='api-inventory-search'
        />
        <SegmentedTabs defaultValue='all' data-testid='api-inventory-status'>
          <SegmentedTabsList>
            <SegmentedTabsTrigger value='all'>All</SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='sensitive'>Sensitive data</SegmentedTabsTrigger>
            <SegmentedTabsTrigger value='new'>New</SegmentedTabsTrigger>
          </SegmentedTabsList>
        </SegmentedTabs>
      </PageToolbar>

      <PageContent>
        <div className='h-full overflow-hidden rounded-12 border border-border-primary'>
          <ResizablePanelGroup data-testid='api-inventory-split'>
            <ResizablePanel id='tree' defaultSize='32%' minSize='22%' maxSize='50%'>
              <VStack gap={12} className='px-12 py-12' data-testid='api-inventory-tree-loading'>
                {SKELETON_ROWS.map(row => (
                  <Skeleton key={row} width='100%' height='16px' />
                ))}
              </VStack>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel id='inspector' defaultSize='68%' minSize='40%'>
              <VStack gap={16} className='px-24 pt-20 pb-16'>
                <Skeleton width='320px' height='24px' />
                <Skeleton width='160px' height='16px' />
              </VStack>
              <div className='grid grid-cols-2 gap-x-8 gap-y-6 px-24 pb-16'>
                {SKELETON_ATTRIBUTES.map(item => (
                  <Attribute key={item} orientation='horizontal' loading />
                ))}
              </div>
              <Tabs defaultValue='parameters' data-testid='api-inventory-tabs'>
                <TabsList>
                  <TabsTrigger value='parameters'>Parameters</TabsTrigger>
                  <TabsTrigger value='responses'>Responses</TabsTrigger>
                </TabsList>
                <TabsContent value='parameters'>
                  <div className='px-16 pt-8 pb-16'>
                    <Table
                      aria-label='Parameters'
                      data={[]}
                      columns={parameterColumns}
                      getRowId={getParameterId}
                      isLoading
                      skeletonCount={6}
                      data-testid='api-inventory-parameters'
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </PageContent>
    </Page>
  );
};
