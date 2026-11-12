/**
 * Live traffic: the agent lays the page out once, then the app keeps it current on its own,
 * sending new values for the same bound paths every 2 s. No agent call per update.
 */
import type { GenUiAction } from '../core/define';
import { bind, type DataValue, node as n, type Scenario } from './stream';

const wave = (m: number, base: number, amp: number, phase = 0) =>
  Math.round(base + amp * Math.sin((m + phase) / 4) + amp * 0.4 * Math.sin(m * 1.3));

/** The last 30 minutes, `shift` minutes after the first answer's. */
const minutes = (shift: number) =>
  Array.from({ length: 30 }, (_, i) => {
    const m = i + shift;
    return {
      x: new Date(Date.UTC(2026, 10, 12, 14, m)).toISOString(),
      requests: wave(m, 9_000, 1_500),
      baseline: 9_000,
      attacks: wave(m, 40, 15, 3),
    };
  });

const ENDPOINTS = [
  'POST /api/v2/auth/login',
  'GET /api/v2/orders/{id}',
  'POST /graphql',
  'GET /search',
];
const COLORS = ['red', 'amber', 'blue', 'slate'] as const;

/** Everything the page binds, as it stands `shift` minutes in. */
const snapshot = (shift: number): DataValue[] => {
  const window = minutes(shift);
  const last = window[window.length - 1];
  return [
    {
      path: '/now',
      value: {
        requests: last?.requests ?? 0,
        attacks: last?.attacks ?? 0,
        blocked: Math.round((96 + 2 * Math.sin(shift / 5)) * 10) / 10,
      },
    },
    {
      path: '/minutes',
      value: window.map(({ x, requests, baseline }) => ({ x, requests, baseline })),
    },
    { path: '/attacksSpark', value: window.map(({ x, attacks }) => ({ x, y: attacks })) },
    {
      path: '/top',
      value: ENDPOINTS.map((label, i) => ({
        label,
        value: wave(shift + i * 7, 2_400 - i * 500, 300 - i * 50),
        color: COLORS[i],
      })).sort((a, b) => b.value - a.value),
    },
  ];
};

export const LIVE_MONITOR_ACTIONS: readonly GenUiAction[] = [
  { name: 'open_traffic', description: 'Open the traffic page for the last hour.' },
];

/** Live traffic monitor: per-minute KPIs, a moving chart and top endpoints, kept current by the app. */
export const LIVE_MONITOR_SCENARIO: Scenario = {
  id: 'live-monitor',
  prompt: 'Watch traffic live for the next few minutes',
  summary:
    'Per-minute KPIs, a moving requests chart and top endpoints, refreshed by the app every 2 s',
  surfaceId: 'live_monitor',
  actions: LIVE_MONITOR_ACTIONS,
  layout: [
    [
      n(
        'root',
        'Section',
        { title: 'Live traffic', subtitle: 'Per minute · the app refreshes it every 2 s' },
        ['kpis', 'charts', 'actions'],
      ),
      n('kpis', 'Grid', { columns: '3' }, ['rpm', 'apm', 'blocked']),
    ],
    [
      n('rpm', 'Metric', {
        title: 'Requests / min',
        value: bind('/now/requests'),
        format: 'compact',
        caption: 'right now',
      }),
      n('apm', 'Metric', {
        title: 'Attacks / min',
        value: bind('/now/attacks'),
        caption: 'last 30 minutes',
        sparkline: bind('/attacksSpark'),
        sparklineColor: 'negative',
      }),
      n('blocked', 'Metric', {
        title: 'Blocked',
        value: bind('/now/blocked'),
        format: 'percent',
        caption: 'of attacks this minute',
      }),
    ],
    [
      n('charts', 'Grid', { columns: '2' }, ['traffic', 'top']),
      n('traffic', 'LineChart', {
        title: 'Requests per minute',
        series: [
          { key: 'requests', label: 'Requests', color: 'brand' },
          { key: 'baseline', label: 'Usual', color: 'slate', variant: 'dashed' },
        ],
        points: bind('/minutes'),
        xFormat: 'time',
        yFormat: 'compact',
      }),
      n('top', 'BarList', { title: 'Most requested right now', items: bind('/top') }),
    ],
    [
      n('actions', 'Stack', { direction: 'row', gap: '8' }, ['open']),
      {
        ...n('open', 'Button', { label: 'Open traffic' }),
        press: { action: 'open_traffic', params: { range: 'last:1h' } },
      },
    ],
  ],
  // The KPIs after the tiles, the series after the charts; then the app keeps them current.
  data: [
    { after: 1, values: snapshot(0).filter(d => d.path === '/now' || d.path === '/attacksSpark') },
    { after: 2, values: snapshot(0).filter(d => d.path === '/minutes' || d.path === '/top') },
  ],
  live: { every: 2000, update: tick => snapshot(tick) },
};
