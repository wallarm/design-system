/**
 * The structure of one API: the host's profile beside a tree of its paths and endpoints, with
 * the risky ones badged. The tree and the figures come from the app's API Discovery data.
 */
import type { GenUiAction } from '../core/define';
import { bind, type LayoutNode, node as n, type Scenario } from './stream';

// ── The app's data (what API Discovery returns for api.example.com) ────────────

const endpoint = (label: string, depth: number, badge?: { text: string; color: string }) => ({
  label,
  depth,
  ...(badge ? { badge } : {}),
});

export const API_STRUCTURE_DATA = {
  host: {
    host: 'api.example.com',
    endpoints: 42,
    sensitive: 9,
    lastChange: '2026-11-12T16:20:00Z',
    topMethod: 'GET',
  },
  tree: [
    endpoint('api.example.com', 0),
    endpoint('/v1', 1),
    endpoint('/users', 2, { text: 'PII', color: 'amber' }),
    endpoint('GET /users/{id}', 3),
    endpoint('PUT /users/{id}/email', 3, { text: 'no auth', color: 'red' }),
    endpoint('/payments', 2, { text: 'cards', color: 'amber' }),
    endpoint('POST /payments/charge', 3),
    endpoint('GET /payments/{id}/receipt', 3),
    endpoint('/v2', 1, { text: 'new', color: 'blue' }),
    endpoint('/patients', 2, { text: 'health', color: 'amber' }),
    endpoint('GET /patients/{id}/records', 3),
    endpoint('/internal', 1),
    endpoint('POST /internal/auth/token', 2, { text: 'credentials', color: 'red' }),
  ],
};

export const API_STRUCTURE_ACTIONS: readonly GenUiAction[] = [
  {
    name: 'open_api_inventory',
    description: 'Open the API Inventory page with the given filter.',
  },
];

// ── The agent's layout, written once ─────────────────────────────────────────

const LAYOUT: LayoutNode[][] = [
  [
    n('root', 'Section', { title: 'api.example.com', subtitle: 'API structure · API Discovery' }, [
      'layout',
      'open',
    ]),
    n('layout', 'Grid', { columns: '3', gap: '16' }, ['profile', 'tree_cell']),
    n('profile', 'Card', {}, ['host']),
  ],
  [
    n('host', 'KeyValueList', {
      fields: [
        { key: 'endpoints', label: 'Endpoints', type: 'number' },
        { key: 'sensitive', label: 'With sensitive data', type: 'number' },
        { key: 'topMethod', label: 'Most used method', type: 'method' },
        { key: 'lastChange', label: 'Last change', type: 'datetime', format: 'relative' },
      ],
      record: bind('/host'),
    }),
    n('tree_cell', 'GridItem', { span: '2' }, ['tree_card']),
    n('tree_card', 'Card', {}, ['tree']),
    n('tree', 'Tree', { nodes: bind('/tree') }),
  ],
  [
    n('actions', 'Stack', { direction: 'row' }, ['open']),
    {
      ...n('open', 'Button', { label: 'Open in API Inventory', variant: 'primary' }),
      press: { action: 'open_api_inventory', params: { filter: 'host:api.example.com' } },
    },
  ],
];

/** API structure: the host's profile and a tree of paths and endpoints with risk badges. */
export const API_STRUCTURE_SCENARIO: Scenario = {
  id: 'api-structure',
  prompt: 'Show me the structure of api.example.com',
  summary: "The host's profile and a tree of its paths and endpoints, risky ones badged",
  surfaceId: 'api_structure',
  actions: API_STRUCTURE_ACTIONS,
  layout: LAYOUT,
  data: [
    {
      after: 1,
      values: [
        { path: '/host', value: API_STRUCTURE_DATA.host },
        { path: '/tree', value: API_STRUCTURE_DATA.tree },
      ],
    },
  ],
};
