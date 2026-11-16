/**
 * Investigating one attacker: the agent lays out the requests in a table whose rows open a detail
 * drawer, the attack's timeline in a second tab, and the raw request behind a drawer button. Every
 * figure is bound; the app fills the paths from its attack log.
 */
import type { GenUiAction } from '../core/define';
import { bind, type LayoutNode, node as n, type Scenario } from './stream';

// ── The app's data (what its attack log returns for 203.0.113.77) ──────────────

export const ATTACK_INVESTIGATION_DATA = {
  source: {
    ip: '203.0.113.77',
    country: 'NL',
    firstSeen: '2026-11-12T13:02:00Z',
    requests: 8_940,
    rule: 'wallarm:bruteforce/oauth-token',
  },
  requests: [
    {
      id: 'req-9f2a',
      time: '2026-11-12T21:58:12Z',
      method: 'POST',
      path: '/oauth/token',
      status: 429,
      attack: 'brute',
      point: 'post.form_urlencoded.password',
      country: 'NL',
      host: 'auth.example.com',
      userAgent: 'python-requests/2.32',
    },
    {
      id: 'req-9f29',
      time: '2026-11-12T21:58:09Z',
      method: 'POST',
      path: '/oauth/token',
      status: 401,
      attack: 'brute',
      point: 'post.form_urlencoded.password',
      country: 'NL',
      host: 'auth.example.com',
      userAgent: 'python-requests/2.32',
    },
    {
      id: 'req-9e71',
      time: '2026-11-12T19:41:30Z',
      method: 'GET',
      path: '/api/v1/users',
      status: 403,
      attack: 'sqli',
      point: 'get.filter',
      country: 'NL',
      host: 'api.example.com',
      userAgent: 'sqlmap/1.8',
    },
  ],
  timeline: [
    {
      title: 'First request',
      time: '2026-11-12T13:02:00Z',
      description: 'POST /oauth/token from a hosting provider range',
    },
    {
      title: 'Brute force detected',
      time: '2026-11-12T13:09:00Z',
      badge: { text: 'brute', color: 'red' },
      description: '120 failed logins in 5 minutes',
    },
    {
      title: 'Source blocked',
      time: '2026-11-12T13:10:00Z',
      badge: { text: 'blocked', color: 'green' },
    },
    {
      title: 'SQL injection attempt',
      time: '2026-11-12T19:41:30Z',
      badge: { text: 'sqli', color: 'amber' },
      description: 'Blocked by the deny list',
    },
  ],
  rawRequest: [
    'POST /oauth/token HTTP/1.1',
    'Host: auth.example.com',
    'User-Agent: python-requests/2.32',
    'Content-Type: application/x-www-form-urlencoded',
    '',
    'grant_type=password&username=admin&password=********',
  ].join('\n'),
};

export const ATTACK_INVESTIGATION_ACTIONS: readonly GenUiAction[] = [
  {
    name: 'open_attacks',
    description: 'Open the Attacks page with the given filter.',
  },
];

// ── The agent's layout, written once ─────────────────────────────────────────

const LAYOUT: LayoutNode[][] = [
  [
    n('root', 'Section', { title: 'Attacks from 203.0.113.77', subtitle: 'Last 24 hours' }, [
      'source',
      'tabs',
      'actions',
    ]),
    n('source', 'KeyValueList', {
      fields: [
        { key: 'ip', label: 'Source', type: 'ip' },
        { key: 'country', label: 'Country', type: 'country' },
        { key: 'firstSeen', label: 'First seen', type: 'datetime', format: 'relative' },
        { key: 'requests', label: 'Requests', type: 'number' },
        { key: 'rule', label: 'Rule', type: 'code' },
      ],
      record: bind('/source'),
    }),
    n('tabs', 'Tabs', { labels: ['Requests', 'Timeline'] }, ['requests', 'timeline']),
  ],
  [
    n('requests', 'Table', {
      rowKey: 'id',
      columns: [
        { key: 'time', header: 'Time', type: 'datetime', format: 'datetime' },
        { key: 'method', header: 'Method', type: 'method' },
        { key: 'path', header: 'Path', type: 'code' },
        { key: 'status', header: 'Status', type: 'status' },
        { key: 'attack', header: 'Attack', type: 'badge' },
      ],
      rows: bind('/requests'),
      detail: {
        titleKey: 'path',
        fields: [
          { key: 'id', label: 'Request', type: 'code' },
          { key: 'host', label: 'Host' },
          { key: 'point', label: 'Point', type: 'parameter' },
          { key: 'country', label: 'Country', type: 'country' },
          { key: 'userAgent', label: 'User agent', type: 'code' },
        ],
      },
    }),
    n('timeline', 'Timeline', { items: bind('/timeline') }),
  ],
  [
    n('actions', 'Stack', { direction: 'row', gap: '8' }, ['raw', 'open']),
    n(
      'raw',
      'Drawer',
      { triggerLabel: 'Show the last request', title: 'Last request', description: 'Raw HTTP' },
      ['raw_code'],
    ),
    n('raw_code', 'CodeSnippet', { code: bind('/rawRequest'), language: 'http' }),
    {
      ...n('open', 'Button', { label: 'Open in Attacks', variant: 'primary' }),
      press: { action: 'open_attacks', params: { filter: 'ip:203.0.113.77' } },
    },
  ],
];

/** One attacker: its profile, its requests with row details, a timeline and the raw request. */
export const ATTACK_INVESTIGATION_SCENARIO: Scenario = {
  id: 'attack-investigation',
  prompt: 'What did 203.0.113.77 do?',
  summary: 'The source profile, its requests with row details, a timeline and the raw request',
  surfaceId: 'attack_investigation',
  actions: ATTACK_INVESTIGATION_ACTIONS,
  layout: LAYOUT,
  data: [
    { after: 0, values: [{ path: '/source', value: ATTACK_INVESTIGATION_DATA.source }] },
    {
      after: 1,
      values: [
        { path: '/requests', value: ATTACK_INVESTIGATION_DATA.requests },
        { path: '/timeline', value: ATTACK_INVESTIGATION_DATA.timeline },
      ],
    },
    { after: 2, values: [{ path: '/rawRequest', value: ATTACK_INVESTIGATION_DATA.rawRequest }] },
  ],
};
