/**
 * An API inventory answer: the agent lays out where sensitive data is exposed, with every figure
 * bound to a path, and the app fills those paths from its API Discovery data.
 */
import type { GenUiAction } from '../core/define';
import { bind, type LayoutNode, node as n, type Scenario } from './stream';

// ── The app's data (what API Discovery returns for the last 7 days) ────────────

const DAYS = Array.from({ length: 7 }, (_, i) => new Date(Date.UTC(2026, 10, 6 + i)).toISOString());

export const API_INVENTORY_DATA = {
  kpi: { endpoints: 1_842, sensitive: 327, unauthenticated: 46, newThisWeek: 58 },
  dataTypes: [
    { label: 'PII', value: 168, color: 'purple' },
    { label: 'Credentials', value: 74, color: 'red' },
    { label: 'Payment cards', value: 52, color: 'amber' },
    { label: 'Health records', value: 33, color: 'blue' },
  ],
  newEndpoints: DAYS.map((x, i) => {
    const sensitive = 1 + ((i * 3) % 4);
    return { x, sensitive, other: 4 + ((i * 5) % 6) };
  }),
  endpoints: [
    {
      id: 'ep-1',
      method: 'GET',
      path: '/api/v1/users/{id}/profile',
      status: 200,
      dataType: 'PII',
      hits: 184_220,
      last: '2026-11-12T21:47:00Z',
    },
    {
      id: 'ep-2',
      method: 'POST',
      path: '/api/v1/payments/charge',
      status: 201,
      dataType: 'Payment cards',
      hits: 92_415,
      last: '2026-11-12T21:52:00Z',
    },
    {
      id: 'ep-3',
      method: 'POST',
      path: '/internal/auth/token',
      status: 200,
      dataType: 'Credentials',
      hits: 61_038,
      last: '2026-11-12T20:15:00Z',
    },
    {
      id: 'ep-4',
      method: 'GET',
      path: '/api/v2/patients/{id}/records',
      status: 200,
      dataType: 'Health records',
      hits: 8_771,
      last: '2026-11-12T18:03:00Z',
    },
    {
      id: 'ep-5',
      method: 'PUT',
      path: '/api/v1/accounts/{id}/email',
      status: 204,
      dataType: 'PII',
      hits: 3_402,
      last: '2026-11-11T09:30:00Z',
    },
  ],
};

export const API_INVENTORY_ACTIONS: readonly GenUiAction[] = [
  {
    name: 'open_api_inventory',
    description: 'Open the API Inventory page with the given filter.',
  },
  {
    name: 'export_endpoints',
    description: 'Download the listed endpoints as a CSV file.',
  },
];

// ── The agent's layout, written once ─────────────────────────────────────────

const LAYOUT: LayoutNode[][] = [
  [
    n(
      'root',
      'Section',
      { title: 'Sensitive data exposure', subtitle: 'API Discovery · last 7 days' },
      ['kpis', 'charts', 'endpoints', 'actions'],
    ),
    n('kpis', 'Grid', { columns: '4' }, ['m_endpoints', 'm_sensitive', 'm_unauth', 'm_new']),
    n('charts', 'Grid', { columns: '2' }, ['data_types', 'new_endpoints']),
  ],
  [
    n('m_endpoints', 'Metric', {
      title: 'Endpoints',
      value: bind('/kpi/endpoints'),
      caption: 'Discovered across all hosts',
    }),
    n('m_sensitive', 'Metric', {
      title: 'With sensitive data',
      value: bind('/kpi/sensitive'),
      caption: 'Return or accept PII, credentials, cards',
    }),
    n('m_unauth', 'Metric', {
      title: 'Unauthenticated',
      value: bind('/kpi/unauthenticated'),
      caption: 'Sensitive and reachable without auth',
    }),
    n('m_new', 'Metric', {
      title: 'New this week',
      value: bind('/kpi/newThisWeek'),
      caption: 'First seen in the last 7 days',
    }),
  ],
  [
    n('data_types', 'PieChart', {
      title: 'Sensitive data types',
      items: bind('/dataTypes'),
      centerLabel: 'endpoints',
    }),
    n('new_endpoints', 'ColumnChart', {
      title: 'New endpoints per day',
      series: [
        { key: 'sensitive', label: 'With sensitive data', color: 'red' },
        { key: 'other', label: 'Other', color: 'slate' },
      ],
      points: bind('/newEndpoints'),
      xFormat: 'date',
    }),
  ],
  [
    n('endpoints', 'Table', {
      title: 'Most used endpoints with sensitive data',
      rowKey: 'id',
      columns: [
        { key: 'method', header: 'Method', type: 'method' },
        { key: 'path', header: 'Path', type: 'code' },
        { key: 'status', header: 'Status', type: 'status' },
        { key: 'dataType', header: 'Data type', type: 'badge' },
        { key: 'hits', header: 'Hits', type: 'number' },
        { key: 'last', header: 'Last seen', type: 'datetime', format: 'datetime' },
      ],
      rows: bind('/endpoints'),
    }),
  ],
  [
    n('actions', 'Stack', { direction: 'row', gap: '8' }, ['open', 'export']),
    {
      ...n('open', 'Button', { label: 'Open in API Inventory', variant: 'primary' }),
      press: { action: 'open_api_inventory', params: { filter: 'sensitive_data:any' } },
    },
    {
      ...n('export', 'Button', { label: 'Export CSV', variant: 'outline' }),
      press: { action: 'export_endpoints', params: { filter: 'sensitive_data:any' } },
    },
  ],
];

/** API inventory: KPI tiles, sensitive data types, new endpoints per day and an endpoints table. */
export const API_INVENTORY_SCENARIO: Scenario = {
  id: 'api-inventory',
  prompt: 'Which API endpoints expose sensitive data?',
  summary:
    'Endpoint KPIs, sensitive data types, new endpoints per day, a table of exposed endpoints',
  surfaceId: 'api_inventory',
  actions: API_INVENTORY_ACTIONS,
  layout: LAYOUT,
  data: [
    { after: 1, values: [{ path: '/kpi', value: API_INVENTORY_DATA.kpi }] },
    {
      after: 2,
      values: [
        { path: '/dataTypes', value: API_INVENTORY_DATA.dataTypes },
        { path: '/newEndpoints', value: API_INVENTORY_DATA.newEndpoints },
      ],
    },
    { after: 3, values: [{ path: '/endpoints', value: API_INVENTORY_DATA.endpoints }] },
  ],
};
