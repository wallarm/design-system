/**
 * A rule the agent drafts and the user tunes: the limit, its window, what happens over it, when it
 * applies and a note. Every field is bound two-way, the app fills the draft, and the button sends
 * the tuned rule in one action once the form is valid (the limit is required and bounded).
 */
import type { GenUiAction } from '../core/define';
import { bind, field, type LayoutNode, node as n, type Scenario } from './stream';

// ── The app's data: the draft the agent proposed, as the form starts ──────────

export const RATE_LIMIT_DRAFT = {
  limit: 30,
  window: '1m',
  reaction: 'block',
  burst: 20,
  period: { start: '2026-11-16', end: '2026-12-16' },
  startsAt: '09:00',
  note: 'Credential stuffing on the token endpoint since Nov 12.',
};

export const RATE_LIMIT_ACTIONS: readonly GenUiAction[] = [
  { name: 'create_rate_limit', description: 'Create a rate limit rule for an endpoint.' },
];

// ── The agent's layout, written once ─────────────────────────────────────────

const LAYOUT: LayoutNode[][] = [
  [
    n(
      'root',
      'Section',
      {
        title: 'Rate limit for POST /oauth/token',
        subtitle: 'A draft from the last 24 hours of traffic: tune it, then create the rule',
      },
      ['limits', 'reaction', 'burst', 'schedule', 'note', 'actions'],
    ),
    n('limits', 'Grid', { columns: '2', gap: '16' }, ['limit', 'window']),
    n('limit', 'NumberInput', {
      label: 'Requests per source',
      value: field('/limit'),
      min: 1,
      max: 10_000,
      required: true,
    }),
    n('window', 'SegmentedControl', {
      label: 'Per',
      options: [
        { value: '1m', label: '1 min' },
        { value: '5m', label: '5 min' },
        { value: '1h', label: '1 hour' },
      ],
      value: field('/window'),
    }),
  ],
  [
    n('reaction', 'RadioGroup', {
      label: 'Over the limit',
      options: [
        { value: 'block', label: 'Block', description: 'Reject the request with 429' },
        { value: 'challenge', label: 'Challenge', description: 'Ask for a CAPTCHA first' },
        { value: 'monitor', label: 'Monitor', description: 'Let it through and record it' },
      ],
      value: field('/reaction'),
    }),
    n('burst', 'Slider', {
      label: 'Burst allowance',
      value: field('/burst'),
      min: 0,
      max: 100,
      step: 5,
      showValue: true,
      description: 'Percent over the limit tolerated for a few seconds',
    }),
    n('schedule', 'Grid', { columns: '2', gap: '16' }, ['period', 'starts']),
    n('period', 'DateRangeInput', { label: 'Active', value: field('/period') }),
    n('starts', 'TimeInput', { label: 'Starts at', value: field('/startsAt') }),
    n('note', 'Textarea', { label: 'Note', value: field('/note'), rows: 2, maxLength: 200 }),
    n('actions', 'Stack', { direction: 'row' }, ['create']),
    {
      ...n('create', 'Button', { label: 'Create rule', variant: 'primary', submit: true }),
      press: {
        action: 'create_rate_limit',
        params: {
          endpoint: 'POST /oauth/token',
          limit: bind('/limit'),
          window: bind('/window'),
          reaction: bind('/reaction'),
          burst: bind('/burst'),
          period: bind('/period'),
          startsAt: bind('/startsAt'),
          note: bind('/note'),
        },
      },
    },
  ],
];

/** A drafted rule in a form of the newer fields, sent in one action. */
export const RATE_LIMIT_SCENARIO: Scenario = {
  id: 'rate-limit',
  prompt: 'Rate-limit POST /oauth/token',
  summary: 'A drafted rule to tune: limit, window, reaction, burst, schedule and a note',
  surfaceId: 'rate_limit',
  actions: RATE_LIMIT_ACTIONS,
  layout: LAYOUT,
  data: [
    {
      after: 0,
      values: Object.entries(RATE_LIMIT_DRAFT).map(([key, value]) => ({ path: `/${key}`, value })),
    },
  ],
};
