/**
 * The eval cases: what the user asks, the app data the answer may bind, the actions it may fire,
 * and what a good answer does. Most mirror a recorded answer in `fixtures/` (which scores clean
 * against its case); `fintech-onboarding` is the tailored first dashboard no fixture covers.
 */
import type { GenUiAction } from '../core/define';

/** Something a good answer does, checked on its node tree. */
export type Expectation =
  /** Some component is one of `uses`, with a prop bound to `bound` (or a path under it). */
  | { description: string; uses: readonly string[]; bound?: string }
  /** No component is one of `avoids` (bound to `bound`, when given). */
  | { description: string; avoids: readonly string[]; bound?: string }
  /** Some component fires the action. */
  | { description: string; fires: string };

export interface EvalCase {
  id: string;
  /** What the user asks. */
  prompt: string;
  /**
   * Every path the answer may bind, with what it holds: the app's data, and the paths a form's
   * fields write. A binding to any other path is an error.
   */
  data: Readonly<Record<string, string>>;
  actions: readonly GenUiAction[];
  expect: readonly Expectation[];
  /** A number written into a prop is an error. Default true; a form's limits are numbers. */
  boundFigures?: boolean;
}

const TIME_SERIES = ['LineChart', 'AreaChart', 'ColumnChart'];
const PARTS = ['PieChart', 'HorizontalBarStack', 'BarList'];
const KPI = (path: string): Expectation => ({
  description: `KPI tiles read ${path}`,
  uses: ['Metric'],
  bound: path,
});

const BLOCK_IPS: GenUiAction = {
  name: 'block_ips',
  description: 'Block the given source IPs (asks the user to approve first).',
};
const OPEN_ATTACKS: GenUiAction = {
  name: 'open_attacks',
  description: 'Open the Attacks page with the given filter.',
};

export const EVAL_CASES: readonly EvalCase[] = [
  {
    id: 'security-dashboard',
    prompt: 'Build a security dashboard for the last 24 hours',
    data: {
      '/kpi':
        '{ requests, attacks, blockedPercent, incidents: number, attacksDelta, incidentsDelta: { value, trend, sentiment } }',
      '/requestsSpark': 'hourly requests, [{ x: ISO time, y: number }]',
      '/attacksSpark': 'hourly attacks, [{ x: ISO time, y: number }]',
      '/traffic': 'hourly requests, [{ x: ISO time, requests: number }]',
      '/attacks': 'hourly attacks and blocked, [{ x: ISO time, attacks, blocked: number }]',
      '/attackTypes': 'attacks per type, 4 types, [{ label, value, color }]',
      '/endpoints': 'most attacked endpoints, sorted, [{ label, value, color }]',
      '/severity': 'open incidents per severity, [{ name, value, color }]',
      '/threats': 'top threats, [{ ip, attack, method, path, status, hits, last: ISO time }]',
      '/topIps': 'the 3 worst source IPs, string[]',
    },
    actions: [BLOCK_IPS, OPEN_ATTACKS],
    expect: [
      KPI('/kpi'),
      { description: 'a time-series chart for /traffic', uses: TIME_SERIES, bound: '/traffic' },
      { description: 'a ranked BarList for /endpoints', uses: ['BarList'], bound: '/endpoints' },
      { description: 'a Table for /threats', uses: ['Table'], bound: '/threats' },
      { description: 'a Button that blocks the top IPs', fires: 'block_ips' },
    ],
  },
  {
    id: 'weekly-report',
    prompt: 'Write a weekly security report for my team',
    data: {
      '/kpi':
        '{ requests, attacks, blockedPercent: number, requestsDelta, attacksDelta, blockedDelta: { value, trend, sentiment } }',
      '/daily': 'attacks per day, 7 days, [{ x: ISO date, attacks, blocked: number }]',
      '/attackTypes': 'attacks per type, sorted, 5 types, [{ label, value, color }]',
      '/responseCodes': 'responses per status class, 4 classes, [{ name, value, color }]',
    },
    actions: [{ name: 'share_report', description: 'Share the report with the team.' }],
    expect: [
      KPI('/kpi'),
      { description: 'a time-series chart for /daily', uses: TIME_SERIES, bound: '/daily' },
      { description: 'a breakdown of /attackTypes', uses: PARTS, bound: '/attackTypes' },
      { description: 'no Table for the attack types', avoids: ['Table'], bound: '/attackTypes' },
      { description: 'a Button that shares the report', fires: 'share_report' },
    ],
  },
  {
    id: 'incident',
    prompt: 'Investigate the brute force incident on /oauth/token',
    data: {
      '/incident': '{ summary: string }',
      '/kpi':
        '{ attempts, uniqueIps, successfulLogins, blockedPercent: number, attemptsDelta: { value, trend, sentiment } }',
      '/attempts': 'login attempts per hour, [{ x: ISO time, attempts, baseline: number }]',
      '/sourceIps': 'top source IPs, sorted, [{ label, value }]',
      '/requests': 'the latest requests, [{ id, time, ip, method, path, status }]',
      '/blockIps': 'the IPs worth blocking, string[]',
    },
    actions: [
      BLOCK_IPS,
      { name: 'create_rule', description: 'Create a rule of the given type for a path.' },
    ],
    expect: [
      KPI('/kpi'),
      { description: 'a time-series chart for /attempts', uses: TIME_SERIES, bound: '/attempts' },
      { description: 'a ranked BarList for /sourceIps', uses: ['BarList'], bound: '/sourceIps' },
      { description: 'a Table for /requests', uses: ['Table'], bound: '/requests' },
      { description: 'a Button that blocks the IPs', fires: 'block_ips' },
    ],
  },
  {
    id: 'attack-investigation',
    prompt: 'What did 203.0.113.77 do?',
    data: {
      '/source': 'the IP, one record: { ip, country, firstSeen: ISO time, requests: number, rule }',
      '/requests':
        'its requests, [{ id, time, method, path, status, attack, point, country, host, userAgent }]',
      '/timeline': 'its attack chain, oldest first, [{ title, description, time, badge }]',
      '/rawRequest': 'the full HTTP request of the worst hit, string',
    },
    actions: [OPEN_ATTACKS],
    expect: [
      {
        description: 'a KeyValueList for the one /source',
        uses: ['KeyValueList'],
        bound: '/source',
      },
      { description: 'no Table for the one /source', avoids: ['Table'], bound: '/source' },
      { description: 'a Table for /requests', uses: ['Table'], bound: '/requests' },
      { description: 'a Timeline for /timeline', uses: ['Timeline'], bound: '/timeline' },
    ],
  },
  {
    id: 'block-sources',
    prompt: 'Block the sources brute-forcing /oauth/token',
    data: {
      '/sources': 'the source IPs, [{ ip, country, requests: number }]',
      '/selection': 'the rows the user selects, string[] (a form field)',
      '/target': 'the row whose action the user pressed (a form field)',
      '/duration': 'how long to block, "1h" | "24h" | "7d" | "forever" (a form field)',
      '/reason': 'why, string (a form field)',
      '/subnet': 'also block the /24 subnet, boolean (a form field)',
      '/notify': 'notify the on-call team, boolean (a form field)',
    },
    actions: [BLOCK_IPS, { name: 'allow_ip', description: 'Add one IP to the allow list.' }],
    boundFigures: false,
    expect: [
      { description: 'a Table to pick /sources from', uses: ['Table'], bound: '/sources' },
      {
        description: 'a field for /duration',
        uses: ['Select', 'RadioGroup', 'SegmentedControl'],
        bound: '/duration',
      },
      { description: 'a submit Button that blocks', fires: 'block_ips' },
    ],
  },
  {
    id: 'rate-limit',
    prompt: 'Rate-limit POST /oauth/token',
    data: {
      '/limit': 'requests allowed per window, number (a form field)',
      '/window': 'the window, "1m" | "5m" | "1h" (a form field)',
      '/reaction':
        '"block" | "challenge" | "monitor", each needs a line of explanation (a form field)',
      '/burst': 'burst tolerance 0-100 % (a form field)',
      '/period': 'the active period, { start, end } dates (a form field)',
      '/startsAt': 'the daily start time, "HH:MM" (a form field)',
      '/note': 'a note, string (a form field)',
    },
    actions: [
      { name: 'create_rate_limit', description: 'Create a rate limit rule for an endpoint.' },
    ],
    boundFigures: false,
    expect: [
      { description: 'a NumberInput for the exact /limit', uses: ['NumberInput'], bound: '/limit' },
      { description: 'a RadioGroup for /reaction', uses: ['RadioGroup'], bound: '/reaction' },
      { description: 'a DateRangeInput for /period', uses: ['DateRangeInput'], bound: '/period' },
      { description: 'a submit Button', fires: 'create_rate_limit' },
    ],
  },
  {
    id: 'no-results',
    prompt: 'Any attacks from Antarctica this week?',
    data: { '/reason': 'why nothing matched, string' },
    actions: [
      {
        name: 'search_attacks',
        description: 'Search attacks again with the given filter and period.',
      },
    ],
    expect: [
      { description: 'an EmptyState', uses: ['EmptyState'] },
      { description: 'no empty Table or chart', avoids: ['Table', ...TIME_SERIES, ...PARTS] },
      { description: 'a way to widen the search', fires: 'search_attacks' },
    ],
  },
  {
    id: 'fintech-onboarding',
    prompt:
      'A new user signed up from the scanner. Their domain is a payments company. Build their first dashboard.',
    data: {
      '/scan':
        'the scan of their domain, one record: { domain, industry: "fintech", hosts, apis, scannedAt }',
      '/kpi': '{ exposedApis, sensitiveEndpoints, tlsIssues, openFindings: number }',
      '/pciChecks':
        'PCI DSS requirements the scan could check, [{ requirement, title, status: "pass" | "fail" | "unknown" }]',
      '/pciStatus': 'PCI DSS checks per status, [{ name, value, color }]',
      '/findings': 'findings by severity, sorted, [{ label, value, color }]',
      '/nextSteps': 'onboarding steps, in order, string[]',
    },
    actions: [
      {
        name: 'connect_traffic',
        description: 'Start connecting a traffic source (a guided flow).',
      },
      { name: 'open_compliance', description: 'Open the compliance report for a standard.' },
    ],
    expect: [
      KPI('/kpi'),
      { description: 'a KeyValueList for the one /scan', uses: ['KeyValueList'], bound: '/scan' },
      { description: 'a Table of the /pciChecks', uses: ['Table'], bound: '/pciChecks' },
      { description: 'the PCI DSS status as parts of a whole', uses: PARTS, bound: '/pciStatus' },
      { description: 'the /nextSteps as an ordered List', uses: ['List'], bound: '/nextSteps' },
      { description: 'a Button that starts connecting traffic', fires: 'connect_traffic' },
    ],
  },
];
