/**
 * One answer, "attacks in the last 24 hours", as an agent would stream it in each format.
 * Both describe the same tree and the same data model, so a renderer swap is the only difference.
 * Every array is in arrival order: feed it item by item to emulate streaming.
 */
import type { SpecStreamLine } from '@json-render/core';
import type { A2uiMessage } from '../a2ui';
import { WALLARM_A2UI_CATALOG_ID } from '../a2ui';
import type { GenUiAction } from '../core/define';

export const ATTACK_SUMMARY_ACTIONS: readonly GenUiAction[] = [
  {
    name: 'block_ips',
    description: 'Block the given source IPs (asks the user to approve first).',
  },
  { name: 'open_attacks', description: 'Open the Attacks page with the given filter.' },
];

const STATS = {
  attacks: 1240,
  blocked: 1187,
  sourceIps: ['203.0.113.7', '203.0.113.12', '198.51.100.40'],
  endpoints: [
    { label: '/api/v1/auth/login', value: 612, color: 'red' },
    { label: '/api/v1/users', value: 318, color: 'amber' },
    { label: '/api/v1/orders', value: 174, color: 'blue' },
    { label: '/api/v1/search', value: 136, color: 'slate' },
  ],
};

const ALERT = {
  title: 'SQLi spike on /api/v1/auth/login',
  description: '412 of the 612 hits came from 3 IPs in one hosting network over the last 2 hours.',
};

// ── A2UI v1.0 ────────────────────────────────────────────────────────────────

const SURFACE = 'attack_summary';

export const ATTACK_SUMMARY_A2UI: readonly A2uiMessage[] = [
  { version: '1.0', createSurface: { surfaceId: SURFACE, catalogId: WALLARM_A2UI_CATALOG_ID } },
  { version: '1.0', updateDataModel: { surfaceId: SURFACE, path: '/stats', value: STATS } },
  {
    version: '1.0',
    updateComponents: {
      surfaceId: SURFACE,
      components: [
        {
          id: 'root',
          component: 'Stack',
          children: ['title', 'metrics', 'endpoints', 'alert', 'actions'],
        },
        { id: 'title', component: 'Heading', text: 'Attacks in the last 24 hours' },
        {
          id: 'metrics',
          component: 'Stack',
          direction: 'row',
          children: ['m_attacks', 'm_blocked'],
        },
        {
          id: 'm_attacks',
          component: 'Metric',
          title: 'Attacks',
          value: { '@path': '/stats/attacks' },
          delta: { value: 12, trend: 'up', sentiment: 'negative' },
          caption: 'vs the previous 24 hours',
        },
        {
          id: 'm_blocked',
          component: 'Metric',
          title: 'Blocked',
          value: { '@path': '/stats/blocked' },
          caption: '95.7% of attacks',
        },
      ],
    },
  },
  {
    version: '1.0',
    updateComponents: {
      surfaceId: SURFACE,
      components: [
        {
          id: 'endpoints',
          component: 'BarList',
          title: 'Top attacked endpoints',
          items: { '@path': '/stats/endpoints' },
        },
      ],
    },
  },
  {
    version: '1.0',
    updateComponents: {
      surfaceId: SURFACE,
      components: [
        { id: 'alert', component: 'Alert', tone: 'warning', ...ALERT },
        {
          id: 'actions',
          component: 'Stack',
          direction: 'row',
          gap: '8',
          children: ['block', 'open'],
        },
        {
          id: 'block',
          component: 'Button',
          label: 'Block 3 source IPs',
          variant: 'primary',
          destructive: true,
          press: {
            event: { name: 'block_ips', context: { ips: { '@path': '/stats/sourceIps' } } },
          },
        },
        {
          id: 'open',
          component: 'Button',
          label: 'Open in Attacks',
          press: { event: { name: 'open_attacks', context: { filter: 'type:sqli' } } },
        },
      ],
    },
  },
] as unknown as readonly A2uiMessage[];

// ── json-render SpecStream (RFC 6902 patches) ────────────────────────────────

const el = (path: string, value: unknown): SpecStreamLine => ({
  op: 'add',
  path: `/elements/${path}`,
  value,
});

/** `state` goes first: the provider reads it when the part mounts. */
export const ATTACK_SUMMARY_JSON_RENDER: readonly SpecStreamLine[] = [
  { op: 'add', path: '/state', value: { stats: STATS } },
  { op: 'add', path: '/root', value: 'root' },
  el('root', {
    type: 'Stack',
    props: {},
    children: ['title', 'metrics', 'endpoints', 'alert', 'actions'],
  }),
  el('title', { type: 'Heading', props: { text: 'Attacks in the last 24 hours' }, children: [] }),
  el('metrics', {
    type: 'Stack',
    props: { direction: 'row' },
    children: ['m_attacks', 'm_blocked'],
  }),
  el('m_attacks', {
    type: 'Metric',
    props: {
      title: 'Attacks',
      value: { $state: '/stats/attacks' },
      delta: { value: 12, trend: 'up', sentiment: 'negative' },
      caption: 'vs the previous 24 hours',
    },
    children: [],
  }),
  el('m_blocked', {
    type: 'Metric',
    props: { title: 'Blocked', value: { $state: '/stats/blocked' }, caption: '95.7% of attacks' },
    children: [],
  }),
  el('endpoints', {
    type: 'BarList',
    props: { title: 'Top attacked endpoints', items: { $state: '/stats/endpoints' } },
    children: [],
  }),
  el('alert', { type: 'Alert', props: { tone: 'warning', ...ALERT }, children: [] }),
  el('actions', {
    type: 'Stack',
    props: { direction: 'row', gap: '8' },
    children: ['block', 'open'],
  }),
  el('block', {
    type: 'Button',
    props: { label: 'Block 3 source IPs', variant: 'primary', destructive: true },
    on: { press: { action: 'block_ips', params: { ips: { $state: '/stats/sourceIps' } } } },
    children: [],
  }),
  el('open', {
    type: 'Button',
    props: { label: 'Open in Attacks' },
    on: { press: { action: 'open_attacks', params: { filter: 'type:sqli' } } },
    children: [],
  }),
];
