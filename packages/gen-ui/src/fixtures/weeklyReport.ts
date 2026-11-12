/**
 * A weekly security report as an agent would write it: a summary, KPIs, the attack trend, a few
 * breakdowns and recommendations. The agent writes the words, the app fills every figure.
 */
import type { GenUiAction } from '../core/define';
import { bind, type LayoutNode, node as n, type Scenario } from './stream';

// ── The app's data (what its API returns for the week of 5-11 Nov) ────────────

const DAYS = Array.from({ length: 7 }, (_, i) => new Date(Date.UTC(2026, 10, 5 + i)).toISOString());
const daily = DAYS.map((x, i) => {
  const attacks = 52_000 + 4_000 * i + (i % 2 ? 3_000 : 0);
  return { x, attacks, blocked: Math.round(attacks * 0.964) };
});

export const WEEKLY_REPORT_DATA = {
  kpi: {
    requests: 92_418_306,
    requestsDelta: { value: 4, trend: 'up', sentiment: 'neutral' },
    attacks: daily.reduce((sum, d) => sum + d.attacks, 0),
    attacksDelta: { value: 18, trend: 'up', sentiment: 'negative' },
    blockedPercent: 96.4,
    blockedDelta: { value: 1.2, trend: 'up', sentiment: 'positive' },
  },
  daily,
  responseCodes: [
    { name: '2xx Success', value: 88_604_020, color: 'green' },
    { name: '3xx Redirect', value: 2_114_870, color: 'blue' },
    { name: '4xx Blocked', value: 1_486_210, color: 'amber' },
    { name: '5xx Error', value: 213_206, color: 'red' },
  ],
  attackTypes: [
    { label: 'SQL injection', value: 164_520, color: 'red' },
    { label: 'Cross-site scripting', value: 121_300, color: 'amber' },
    { label: 'BOLA', value: 78_440, color: 'purple' },
    { label: 'Brute force', value: 52_180, color: 'blue' },
    { label: 'Path traversal', value: 40_560, color: 'slate' },
  ],
};

export const WEEKLY_REPORT_ACTIONS: readonly GenUiAction[] = [
  {
    name: 'share_report',
    description: 'Share the report with the given team (asks the user to pick recipients first).',
  },
];

// ── The agent's layout, written once ─────────────────────────────────────────

/** Arrival order: the shell first, then one part of the report per chunk. */
const LAYOUT: LayoutNode[][] = [
  [
    n(
      'root',
      'Section',
      { title: 'Weekly security report', subtitle: '5-11 Nov · all applications' },
      ['summary', 'kpis', 'charts', 'response_codes', 'recommendations', 'actions'],
    ),
    n('summary', 'Text', {
      text: 'Attacks rose again this week, led by SQL injection against the login endpoint. Nearly all of them were blocked, and error rates stayed flat.',
    }),
    n('kpis', 'Grid', { columns: '3' }, ['m_requests', 'm_attacks', 'm_blocked']),
    n('charts', 'Grid', { columns: '2' }, ['attack_trend', 'attack_types']),
  ],
  [
    n('m_requests', 'Metric', {
      title: 'Requests',
      value: bind('/kpi/requests'),
      format: 'compact',
      delta: bind('/kpi/requestsDelta'),
      caption: 'vs the previous week',
    }),
    n('m_attacks', 'Metric', {
      title: 'Attacks',
      value: bind('/kpi/attacks'),
      format: 'compact',
      delta: bind('/kpi/attacksDelta'),
      caption: 'vs the previous week',
    }),
    n('m_blocked', 'Metric', {
      title: 'Blocked',
      value: bind('/kpi/blockedPercent'),
      format: 'percent',
      delta: bind('/kpi/blockedDelta'),
      caption: 'of attacks',
    }),
  ],
  [
    n('attack_trend', 'AreaChart', {
      title: 'Attacks vs blocked',
      // Blocked is a part of attacks, not added on top of them.
      variant: 'standard',
      series: [
        { key: 'attacks', label: 'Attacks', color: 'red' },
        { key: 'blocked', label: 'Blocked', color: 'green' },
      ],
      points: bind('/daily'),
      xFormat: 'date',
      yFormat: 'compact',
    }),
    n('attack_types', 'BarList', { title: 'Top attack types', items: bind('/attackTypes') }),
  ],
  [
    n('response_codes', 'HorizontalBarStack', {
      title: 'Response codes',
      items: bind('/responseCodes'),
      legend: true,
    }),
  ],
  [
    n('recommendations', 'Stack', { gap: '8' }, ['rec_title', 'rec_1', 'rec_2', 'rec_3']),
    n('rec_title', 'Heading', { text: 'Recommendations', size: 'md' }),
    n('rec_1', 'Alert', {
      tone: 'info',
      title: 'Turn on brute-force protection',
      description: 'POST /api/v2/auth/login takes most of the credential attacks.',
    }),
    n('rec_2', 'Alert', {
      tone: 'info',
      title: 'Enforce object ownership checks',
      description: 'The BOLA hits on /api/v2/orders read orders that belong to other users.',
    }),
    n('rec_3', 'Alert', {
      tone: 'info',
      title: 'Block path traversal',
      description: 'Move the path traversal rules from monitoring to blocking mode.',
    }),
    n('actions', 'Stack', { direction: 'row', gap: '8' }, ['share']),
    {
      ...n('share', 'Button', { label: 'Share with the team', variant: 'primary' }),
      press: { action: 'share_report', params: { report: 'weekly-security', week: '2026-W45' } },
    },
  ],
];

/** Weekly security report: summary, KPIs, attack trend, breakdowns and recommendations. */
export const WEEKLY_REPORT_SCENARIO: Scenario = {
  id: 'weekly-report',
  prompt: 'Write a weekly security report for my team',
  summary: 'A summary, KPI tiles, attacks vs blocked by day, breakdowns and recommendations',
  surfaceId: 'weekly_report',
  actions: WEEKLY_REPORT_ACTIONS,
  layout: LAYOUT,
  // Each batch follows the chunk that binds it.
  data: [
    { after: 1, values: [{ path: '/kpi', value: WEEKLY_REPORT_DATA.kpi }] },
    {
      after: 2,
      values: [
        { path: '/daily', value: WEEKLY_REPORT_DATA.daily },
        { path: '/attackTypes', value: WEEKLY_REPORT_DATA.attackTypes },
      ],
    },
    { after: 3, values: [{ path: '/responseCodes', value: WEEKLY_REPORT_DATA.responseCodes }] },
  ],
};
