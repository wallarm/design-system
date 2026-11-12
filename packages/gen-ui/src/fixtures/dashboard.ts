/**
 * A security dashboard as an agent would build it: the agent sends the layout, with every number
 * bound to a path, and the app fills those paths from its own API. The tree is written once and
 * emitted in both formats, chunk by chunk, so a renderer shows placeholders until a part arrives.
 */
import type { SpecStreamLine } from '@json-render/core';
import { type A2uiMessage, WALLARM_A2UI_CATALOG_ID } from '../a2ui';
import type { GenUiAction } from '../core/define';

// ── The app's data (what its API returns for "last 24 hours") ──────────────────

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const at = new Date(Date.UTC(2026, 10, 12, i));
  return at.toISOString();
});
const wave = (i: number, base: number, amp: number, phase = 0) =>
  Math.round(base + amp * Math.sin((i + phase) / 3.2) + amp * 0.35 * Math.sin(i * 1.7));

export const DASHBOARD_DATA = {
  kpi: {
    requests: 13_204_118,
    attacks: 64_204,
    blockedPercent: 95.7,
    incidents: 3,
    attacksDelta: { value: 12, trend: 'up', sentiment: 'negative' },
    incidentsDelta: { value: 2, trend: 'down', sentiment: 'positive' },
  },
  traffic: HOURS.map((x, i) => ({ x, requests: wave(i, 550_000, 90_000) })),
  attacks: HOURS.map((x, i) => {
    const attacks = wave(i, 2_700, 900, 2);
    return { x, attacks, blocked: Math.round(attacks * 0.957) };
  }),
  requestsSpark: HOURS.map((x, i) => ({ x, y: wave(i, 550_000, 90_000) })),
  attacksSpark: HOURS.map((x, i) => ({ x, y: wave(i, 2_700, 900, 2) })),
  attackTypes: [
    { label: 'SQL injection', value: 14_820, color: 'red' },
    { label: 'Cross-site scripting', value: 9_410, color: 'amber' },
    { label: 'BOLA', value: 6_205, color: 'purple' },
    { label: 'Brute force', value: 4_930, color: 'blue' },
  ],
  endpoints: [
    { label: 'POST /api/v2/auth/login', value: 11_204, color: 'red' },
    { label: 'GET /api/v2/orders/{id}', value: 7_386, color: 'amber' },
    { label: 'POST /graphql', value: 5_142, color: 'blue' },
    { label: 'GET /api/v2/users/{id}', value: 3_920, color: 'slate' },
  ],
  severity: [
    { name: 'Critical', value: 1, color: 'red' },
    { name: 'High', value: 1, color: 'amber' },
    { name: 'Medium', value: 1, color: 'blue' },
  ],
  threats: [
    {
      ip: '203.0.113.24',
      attack: 'SQL injection',
      method: 'POST',
      path: '/api/v2/auth/login',
      status: 403,
      hits: 4_120,
      last: '2026-11-12T22:41:00Z',
    },
    {
      ip: '198.51.100.160',
      attack: 'BOLA',
      method: 'GET',
      path: '/api/v2/orders/100482',
      status: 200,
      hits: 2_870,
      last: '2026-11-12T22:36:00Z',
    },
    {
      ip: '198.51.100.212',
      attack: 'Cross-site scripting',
      method: 'POST',
      path: '/search',
      status: 403,
      hits: 1_940,
      last: '2026-11-12T22:12:00Z',
    },
    {
      ip: '203.0.113.5',
      attack: 'Brute force',
      method: 'POST',
      path: '/oauth/token',
      status: 429,
      hits: 1_310,
      last: '2026-11-12T21:58:00Z',
    },
  ],
  topIps: ['203.0.113.24', '198.51.100.160', '198.51.100.212'],
};

export const DASHBOARD_ACTIONS: readonly GenUiAction[] = [
  {
    name: 'block_ips',
    description: 'Block the given source IPs (asks the user to approve first).',
  },
  { name: 'open_attacks', description: 'Open the Attacks page with the given filter.' },
];

// ── The agent's layout, written once ─────────────────────────────────────────

/** A value the app fills: becomes `{ "@path" }` in A2UI and `{ "$state" }` in json-render. */
const bind = (path: string) => ({ bind: path });
type Bound = ReturnType<typeof bind>;
const isBound = (v: unknown): v is Bound =>
  typeof v === 'object' && v !== null && 'bind' in v && Object.keys(v).length === 1;

interface Node {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  children?: string[];
  /** For a Button: the action and its context, which may hold bindings too. */
  press?: { action: string; params: Record<string, unknown> };
}

const n = (id: string, type: string, props: Node['props'] = {}, children?: string[]): Node => ({
  id,
  type,
  props,
  children,
});

/** Arrival order: the shell first, then one part of the page per chunk. */
const LAYOUT: Node[][] = [
  [
    n(
      'root',
      'Section',
      { title: 'Security dashboard', subtitle: 'Last 24 hours · all applications' },
      ['kpis', 'charts', 'breakdowns', 'threats', 'actions'],
    ),
    n('kpis', 'Grid', { columns: '4' }, ['m_requests', 'm_attacks', 'm_blocked', 'm_incidents']),
  ],
  [
    n('m_requests', 'Metric', {
      title: 'Requests',
      value: bind('/kpi/requests'),
      format: 'compact',
      caption: 'All applications',
      sparkline: bind('/requestsSpark'),
    }),
    n('m_attacks', 'Metric', {
      title: 'Attacks',
      value: bind('/kpi/attacks'),
      format: 'compact',
      delta: bind('/kpi/attacksDelta'),
      caption: 'vs the previous 24 hours',
      sparkline: bind('/attacksSpark'),
      sparklineColor: 'negative',
    }),
    n('m_blocked', 'Metric', {
      title: 'Blocked',
      value: bind('/kpi/blockedPercent'),
      format: 'percent',
      caption: 'of attacks',
    }),
    n('m_incidents', 'Metric', {
      title: 'Open incidents',
      value: bind('/kpi/incidents'),
      delta: bind('/kpi/incidentsDelta'),
      caption: 'vs the previous 24 hours',
    }),
  ],
  [
    n('charts', 'Grid', { columns: '2' }, ['traffic', 'attack_trend']),
    n('traffic', 'LineChart', {
      title: 'Traffic',
      series: [{ key: 'requests', label: 'Requests', color: 'brand' }],
      points: bind('/traffic'),
      xFormat: 'time',
      yFormat: 'compact',
    }),
    n('attack_trend', 'AreaChart', {
      title: 'Attacks',
      // Blocked is a part of attacks, not added on top of them.
      variant: 'standard',
      series: [
        { key: 'attacks', label: 'Attacks', color: 'red' },
        { key: 'blocked', label: 'Blocked', color: 'green' },
      ],
      points: bind('/attacks'),
      xFormat: 'time',
      yFormat: 'compact',
    }),
  ],
  [
    n('breakdowns', 'Grid', { columns: '3' }, ['attack_types', 'endpoints', 'severity']),
    n('attack_types', 'PieChart', {
      title: 'Attack types',
      items: bind('/attackTypes'),
      centerLabel: 'attacks',
      format: 'compact',
    }),
    n('endpoints', 'BarList', { title: 'Most attacked endpoints', items: bind('/endpoints') }),
    n('severity', 'HorizontalBarStack', {
      title: 'Incidents by severity',
      value: bind('/kpi/incidents'),
      items: bind('/severity'),
      legend: true,
    }),
  ],
  [
    n('threats', 'Table', {
      title: 'Top threats',
      rowKey: 'ip',
      columns: [
        { key: 'ip', header: 'Source IP', type: 'ip' },
        { key: 'attack', header: 'Attack', type: 'badge' },
        { key: 'method', header: 'Method', type: 'method' },
        { key: 'path', header: 'Path', type: 'code' },
        { key: 'status', header: 'Status', type: 'status' },
        { key: 'hits', header: 'Hits', type: 'number' },
        { key: 'last', header: 'Last seen', type: 'datetime', format: 'datetime' },
      ],
      rows: bind('/threats'),
    }),
    n('actions', 'Stack', { direction: 'row', gap: '8' }, ['block', 'open']),
    {
      ...n('block', 'Button', {
        label: 'Block the top 3 IPs',
        variant: 'primary',
        destructive: true,
      }),
      press: { action: 'block_ips', params: { ips: bind('/topIps') } },
    },
    {
      ...n('open', 'Button', { label: 'Open in Attacks' }),
      press: { action: 'open_attacks', params: { filter: 'last:24h' } },
    },
  ],
];

/** The app's data, in the order its API answers: the headline numbers first, the rest later. */
const DATA_CHUNKS: { path: string; value: unknown }[][] = [
  [
    { path: '/kpi', value: DASHBOARD_DATA.kpi },
    { path: '/requestsSpark', value: DASHBOARD_DATA.requestsSpark },
    { path: '/attacksSpark', value: DASHBOARD_DATA.attacksSpark },
    { path: '/traffic', value: DASHBOARD_DATA.traffic },
    { path: '/attacks', value: DASHBOARD_DATA.attacks },
  ],
  [
    { path: '/attackTypes', value: DASHBOARD_DATA.attackTypes },
    { path: '/endpoints', value: DASHBOARD_DATA.endpoints },
    { path: '/severity', value: DASHBOARD_DATA.severity },
    { path: '/threats', value: DASHBOARD_DATA.threats },
    { path: '/topIps', value: DASHBOARD_DATA.topIps },
  ],
];

// ── Emitting both formats ────────────────────────────────────────────────────

const mapBindings = (value: unknown, to: (path: string) => unknown): unknown => {
  if (isBound(value)) return to(value.bind);
  if (Array.isArray(value)) return value.map(v => mapBindings(v, to));
  if (typeof value === 'object' && value !== null)
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapBindings(v, to)]));
  return value;
};

/** Who sent a line: the agent (layout) or the app (data). */
export type StreamOrigin = 'agent' | 'app';
export interface StreamLine<T> {
  origin: StreamOrigin;
  line: T;
}

const SURFACE = 'security_dashboard';
const toA2uiPath = (path: string) => ({ '@path': path });

const a2uiComponent = (node: Node) => ({
  id: node.id,
  component: node.type,
  ...(mapBindings(node.props, toA2uiPath) as Record<string, unknown>),
  ...(node.children ? { children: node.children } : {}),
  ...(node.press
    ? {
        press: {
          event: {
            name: node.press.action,
            context: mapBindings(node.press.params, toA2uiPath),
          },
        },
      }
    : {}),
});

/**
 * Interleaved like a real session: the agent's chunks in order, and the app's data for a part right
 * after the agent has sent the components that bind it. Index 0 is createSurface (or /root), so
 * chunk 2 holds the KPI tiles and chunk 4 the breakdowns: the KPI and chart data follows chunk 2,
 * the rest follows chunk 4. Until then the bound components hold placeholders.
 */
const interleave = <T>(agent: T[][], app: T[][]): StreamLine<T>[] =>
  agent.flatMap((chunk, i) => [
    ...chunk.map(line => ({ origin: 'agent' as const, line })),
    ...(i === 2 ? (app[0] ?? []) : i === 4 ? (app[1] ?? []) : []).map(line => ({
      origin: 'app' as const,
      line,
    })),
  ]);

export const DASHBOARD_A2UI: StreamLine<A2uiMessage>[] = interleave<unknown>(
  [
    [{ version: '1.0', createSurface: { surfaceId: SURFACE, catalogId: WALLARM_A2UI_CATALOG_ID } }],
    ...LAYOUT.map(chunk => [
      {
        version: '1.0',
        updateComponents: { surfaceId: SURFACE, components: chunk.map(a2uiComponent) },
      },
    ]),
  ],
  // One message per path: a second write to '/' would replace the first.
  DATA_CHUNKS.map(chunk =>
    chunk.map(d => ({
      version: '1.0',
      updateDataModel: { surfaceId: SURFACE, path: d.path, value: d.value },
    })),
  ),
) as StreamLine<A2uiMessage>[];

const toJsonRenderPath = (path: string) => ({ $state: path });

const jsonRenderElement = (node: Node): SpecStreamLine => ({
  op: 'add',
  path: `/elements/${node.id}`,
  value: {
    type: node.type,
    props: mapBindings(node.props, toJsonRenderPath),
    children: node.children ?? [],
    ...(node.press
      ? {
          on: {
            press: {
              action: node.press.action,
              params: mapBindings(node.press.params, toJsonRenderPath),
            },
          },
        }
      : {}),
  },
});

export const DASHBOARD_JSON_RENDER: StreamLine<SpecStreamLine>[] = [
  // An empty state first, so the surface mounts with somewhere to put the app's data.
  { origin: 'app', line: { op: 'add', path: '/state', value: {} } },
  ...interleave<SpecStreamLine>(
    [
      [{ op: 'add', path: '/root', value: 'root' }],
      ...LAYOUT.map(chunk => chunk.map(jsonRenderElement)),
    ],
    DATA_CHUNKS.map(chunk =>
      chunk.map((d): SpecStreamLine => ({ op: 'add', path: `/state${d.path}`, value: d.value })),
    ),
  ),
];
