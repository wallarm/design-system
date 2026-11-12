/**
 * Investigating one incident: the agent lays out an alert, KPI tiles, the attempts trend, the
 * top source IPs and the latest requests, every figure bound; the app fills them from its API.
 */
import type { GenUiAction } from '../core/define';
import { bind, type LayoutNode, node as n, type Scenario } from './stream';

// ── The app's data (what its API returns for the incident) ─────────────────────

const HOURS = Array.from({ length: 12 }, (_, i) =>
  new Date(Date.UTC(2026, 10, 12, 10 + i)).toISOString(),
);
// The attack ramps up from 13:00, peaks at 17:00 and is throttled after.
const ATTEMPTS = [140, 152, 168, 1_920, 4_860, 7_340, 9_410, 10_280, 6_120, 3_540, 2_310, 1_972];

export const INCIDENT_DATA = {
  incident: {
    summary:
      'Credential stuffing against POST /oauth/token since 13:00 UTC from a rotating pool of IPs. Most attempts were blocked; 6 logins succeeded and need review.',
  },
  kpi: {
    attempts: ATTEMPTS.reduce((sum, v) => sum + v, 0),
    uniqueIps: 1_284,
    successfulLogins: 6,
    blockedPercent: 97.4,
    attemptsDelta: { value: 3_120, trend: 'up', sentiment: 'negative' },
  },
  attempts: HOURS.map((x, i) => ({ x, attempts: ATTEMPTS[i] ?? 0, baseline: 150 + (i % 3) * 10 })),
  sourceIps: [
    { label: '203.0.113.77', value: 8_940, color: 'red' },
    { label: '198.51.100.14', value: 6_215, color: 'red' },
    { label: '192.0.2.201', value: 4_870, color: 'amber' },
    { label: '203.0.113.150', value: 3_302, color: 'amber' },
    { label: '198.51.100.88', value: 2_164, color: 'slate' },
  ],
  requests: [
    {
      id: 'r1',
      time: '2026-11-12T21:58:12Z',
      ip: '203.0.113.77',
      method: 'POST',
      path: '/oauth/token',
      status: 429,
    },
    {
      id: 'r2',
      time: '2026-11-12T21:58:09Z',
      ip: '198.51.100.14',
      method: 'POST',
      path: '/oauth/token',
      status: 401,
    },
    {
      id: 'r3',
      time: '2026-11-12T21:57:55Z',
      ip: '192.0.2.201',
      method: 'POST',
      path: '/oauth/token',
      status: 403,
    },
    {
      id: 'r4',
      time: '2026-11-12T21:57:41Z',
      ip: '198.51.100.23',
      method: 'POST',
      path: '/oauth/token',
      status: 200,
    },
    {
      id: 'r5',
      time: '2026-11-12T21:57:30Z',
      ip: '203.0.113.150',
      method: 'POST',
      path: '/oauth/token',
      status: 401,
    },
  ],
  blockIps: ['203.0.113.77', '198.51.100.14', '192.0.2.201', '203.0.113.150', '198.51.100.88'],
};

export const INCIDENT_ACTIONS: readonly GenUiAction[] = [
  {
    name: 'block_ips',
    description: 'Block the given source IPs (asks the user to approve first).',
  },
  {
    name: 'create_rule',
    description: 'Open the rule editor with a draft rule for the given endpoint and rule type.',
  },
];

// ── The agent's layout, written once ─────────────────────────────────────────

const LAYOUT: LayoutNode[][] = [
  [
    n(
      'root',
      'Section',
      { title: 'Brute force on /oauth/token', subtitle: 'Incident · started 13:00 UTC' },
      ['summary', 'kpis', 'charts', 'requests', 'actions'],
    ),
    n('kpis', 'Grid', { columns: '4' }, ['m_attempts', 'm_ips', 'm_logins', 'm_blocked']),
    n('charts', 'Grid', { columns: '2' }, ['attempts', 'source_ips']),
  ],
  [
    n('summary', 'Alert', {
      title: 'Active brute force attack',
      description: bind('/incident/summary'),
      tone: 'destructive',
    }),
    n('m_attempts', 'Metric', {
      title: 'Login attempts',
      value: bind('/kpi/attempts'),
      format: 'compact',
      delta: bind('/kpi/attemptsDelta'),
      caption: 'vs the previous hour',
    }),
    n('m_ips', 'Metric', { title: 'Unique IPs', value: bind('/kpi/uniqueIps') }),
    n('m_logins', 'Metric', {
      title: 'Successful logins',
      value: bind('/kpi/successfulLogins'),
      caption: 'need review',
    }),
    n('m_blocked', 'Metric', {
      title: 'Blocked',
      value: bind('/kpi/blockedPercent'),
      format: 'percent',
      caption: 'of attempts',
    }),
  ],
  [
    n('attempts', 'LineChart', {
      title: 'Attempts per hour',
      series: [
        { key: 'attempts', label: 'Attempts', color: 'red' },
        { key: 'baseline', label: 'Baseline', color: 'slate', variant: 'dashed' },
      ],
      points: bind('/attempts'),
      xFormat: 'time',
      yFormat: 'compact',
    }),
    n('source_ips', 'BarList', { title: 'Top source IPs', items: bind('/sourceIps') }),
  ],
  [
    n('requests', 'Table', {
      title: 'Recent requests',
      rowKey: 'id',
      columns: [
        { key: 'time', header: 'Time', type: 'datetime', format: 'datetime' },
        { key: 'ip', header: 'Source IP', type: 'ip' },
        { key: 'method', header: 'Method', type: 'method' },
        { key: 'path', header: 'Path', type: 'code' },
        { key: 'status', header: 'Status', type: 'status' },
      ],
      rows: bind('/requests'),
    }),
  ],
  [
    n('actions', 'Stack', { direction: 'row', gap: '8' }, ['block', 'rule']),
    {
      ...n('block', 'Button', {
        label: 'Block the top 5 IPs',
        variant: 'primary',
        destructive: true,
      }),
      press: { action: 'block_ips', params: { ips: bind('/blockIps') } },
    },
    {
      ...n('rule', 'Button', { label: 'Create a rate limit rule' }),
      press: { action: 'create_rule', params: { path: '/oauth/token', type: 'rate_limit' } },
    },
  ],
];

/** Incident investigation: an alert, KPI tiles, the attempts trend, top IPs, recent requests. */
export const INCIDENT_SCENARIO: Scenario = {
  id: 'incident',
  prompt: 'Investigate the brute force incident on /oauth/token',
  summary: 'An alert, KPI tiles, attempts per hour vs baseline, top source IPs, recent requests',
  surfaceId: 'incident',
  actions: INCIDENT_ACTIONS,
  layout: LAYOUT,
  // Each part's data arrives right after the chunk that binds it.
  data: [
    {
      after: 1,
      values: [
        { path: '/incident', value: INCIDENT_DATA.incident },
        { path: '/kpi', value: INCIDENT_DATA.kpi },
      ],
    },
    {
      after: 2,
      values: [
        { path: '/attempts', value: INCIDENT_DATA.attempts },
        { path: '/sourceIps', value: INCIDENT_DATA.sourceIps },
      ],
    },
    { after: 3, values: [{ path: '/requests', value: INCIDENT_DATA.requests }] },
    { after: 4, values: [{ path: '/blockIps', value: INCIDENT_DATA.blockIps }] },
  ],
};
