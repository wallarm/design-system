/**
 * A configuration review: how much of the API the filter protects, what to fix first, and each
 * risky rule in an accordion with its definition. The figures and rules come from the app.
 */
import type { GenUiAction } from '../core/define';
import { bind, type LayoutNode, node as n, type Scenario } from './stream';

// ── The app's data (what the node and rule APIs return) ───────────────────────

export const CONFIG_REVIEW_DATA = {
  coverage: { blocking: 71, monitoring: 24, total: 100 },
  quota: { used: 8_420_000, limit: 10_000_000 },
  steps: [
    'Switch api.example.com from monitoring to blocking: it serves 24% of traffic.',
    'Narrow the allow-list rule on /internal/* to the office subnet.',
    'Turn on the brute force trigger for POST /oauth/token.',
  ],
  rules: {
    allowInternal: [
      'action: allow',
      'match:',
      '  path: /internal/*',
      '  source: 0.0.0.0/0   # every address',
    ].join('\n'),
    disabledTrigger: [
      'trigger: brute_force',
      'enabled: false',
      'scope:',
      '  method: POST',
      '  path: /oauth/token',
      'threshold: 30 per 5m',
    ].join('\n'),
  },
};

export const CONFIG_REVIEW_ACTIONS: readonly GenUiAction[] = [
  {
    name: 'open_rules',
    description: 'Open the Rules page with the given filter.',
  },
];

// ── The agent's layout, written once ─────────────────────────────────────────

const LAYOUT: LayoutNode[][] = [
  [
    n(
      'root',
      'Section',
      { title: 'Filtering configuration review', subtitle: 'All applications' },
      ['bars', 'divider', 'todo', 'rules', 'footer'],
    ),
    n('bars', 'Grid', { columns: '2', gap: '16' }, ['blocking', 'quota']),
  ],
  [
    n('blocking', 'Progress', {
      value: bind('/coverage/blocking'),
      max: bind('/coverage/total'),
      label: 'Traffic filtered in blocking mode',
      showValue: true,
      color: 'green',
    }),
    n('quota', 'Progress', {
      value: bind('/quota/used'),
      max: bind('/quota/limit'),
      label: 'Monthly request quota',
      showValue: true,
      color: 'amber',
    }),
    n('divider', 'Separator'),
    n('todo', 'Card', {}, ['todo_title', 'todo_list']),
    n('todo_title', 'Heading', { text: 'Fix first' }),
    n('todo_list', 'List', { items: bind('/steps'), ordered: true }),
  ],
  [
    n(
      'rules',
      'Accordion',
      {
        labels: ['Allow-list open to every address', 'Brute force trigger is off'],
        openFirst: true,
      },
      ['rule_allow', 'rule_trigger'],
    ),
    n('rule_allow', 'CodeSnippet', { code: bind('/rules/allowInternal'), language: 'yaml' }),
    n('rule_trigger', 'CodeSnippet', { code: bind('/rules/disabledTrigger'), language: 'yaml' }),
  ],
  [
    n('footer', 'Stack', { direction: 'row', gap: '12' }, ['why', 'docs', 'open']),
    n(
      'why',
      'Dialog',
      { triggerLabel: 'Why blocking mode', title: 'Monitoring vs blocking', size: 'small' },
      ['why_text'],
    ),
    n('why_text', 'Text', {
      text: 'In monitoring mode attacks are recorded but reach the application. Blocking mode drops them at the node.',
    }),
    n('docs', 'Link', {
      label: 'Filtration modes',
      href: 'https://docs.wallarm.com/admin-en/configure-wallarm-mode/',
    }),
    {
      ...n('open', 'Button', { label: 'Open rules', variant: 'primary' }),
      press: { action: 'open_rules', params: { filter: 'risky' } },
    },
  ],
];

/** Configuration review: two progress bars, ordered steps, rules in an accordion, a dialog. */
export const CONFIG_REVIEW_SCENARIO: Scenario = {
  id: 'config-review',
  prompt: 'Is my filtering configuration safe?',
  summary: 'Blocking coverage and quota, the steps to fix first, risky rules and an explainer',
  surfaceId: 'config_review',
  actions: CONFIG_REVIEW_ACTIONS,
  layout: LAYOUT,
  data: [
    {
      after: 1,
      values: [
        { path: '/coverage', value: CONFIG_REVIEW_DATA.coverage },
        { path: '/quota', value: CONFIG_REVIEW_DATA.quota },
        { path: '/steps', value: CONFIG_REVIEW_DATA.steps },
      ],
    },
    { after: 2, values: [{ path: '/rules', value: CONFIG_REVIEW_DATA.rules }] },
  ],
};
