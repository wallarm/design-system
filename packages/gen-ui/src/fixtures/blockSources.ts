/**
 * An answer that asks for input: the agent lists the sources behind a brute force, the user picks
 * rows and fills a short form, and one button sends it all. The table's selection and the form's
 * fields are bound two-way; the button's action reads them from their paths. Each row's menu
 * allows that source instead.
 */
import type { GenUiAction } from '../core/define';
import { bind, field, type LayoutNode, node as n, type Scenario } from './stream';

// ── The app's data (what its attack log returns, and the form's starting values) ─

export const BLOCK_SOURCES_DATA = {
  sources: [
    { ip: '203.0.113.77', country: 'NL', requests: 8_940 },
    { ip: '198.51.100.23', country: 'BR', requests: 3_215 },
    { ip: '192.0.2.146', country: 'VN', requests: 1_870 },
    { ip: '203.0.113.9', country: 'NL', requests: 604 },
  ],
  form: { duration: '24h', subnet: false, notify: true, reason: 'Brute force on /oauth/token' },
};

export const BLOCK_SOURCES_ACTIONS: readonly GenUiAction[] = [
  {
    name: 'block_ips',
    description: 'Block the given IPs for a duration, optionally with their /24 subnets.',
  },
  { name: 'allow_ip', description: 'Add one IP to the allow list.' },
];

// ── The agent's layout, written once ─────────────────────────────────────────

const LAYOUT: LayoutNode[][] = [
  [
    n(
      'root',
      'Section',
      { title: 'Sources brute-forcing /oauth/token', subtitle: 'Last 24 hours' },
      ['sources', 'form'],
    ),
    {
      ...n('sources', 'Table', {
        rowKey: 'ip',
        columns: [
          { key: 'ip', header: 'Source', type: 'ip' },
          { key: 'country', header: 'Country', type: 'country' },
          { key: 'requests', header: 'Requests', type: 'number' },
        ],
        rows: bind('/sources'),
        selectable: true,
        selection: field('/selection'),
        rowActionItem: { label: 'Allow this source' },
        actionRow: field('/target'),
      }),
      on: { rowAction: { action: 'allow_ip', params: { ip: bind('/target') } } },
    },
  ],
  [
    n('form', 'Card', {}, ['form_title', 'fields', 'options', 'actions']),
    n('form_title', 'Heading', { text: 'Block the selected sources' }),
    n('fields', 'Grid', { columns: '2', gap: '16' }, ['duration', 'reason']),
    n('duration', 'Select', {
      label: 'Duration',
      options: [
        { value: '1h', label: '1 hour' },
        { value: '24h', label: '24 hours' },
        { value: '7d', label: '7 days' },
        { value: 'forever', label: 'Until removed' },
      ],
      value: field('/duration'),
      required: true,
    }),
    n('reason', 'Input', {
      label: 'Reason',
      value: field('/reason'),
      description: 'Shown in the deny list next to each address',
      required: true,
    }),
    n('options', 'Stack', { gap: '8' }, ['subnet', 'notify']),
    n('actions', 'Stack', { direction: 'row' }, ['submit']),
    n('subnet', 'Checkbox', { label: 'Also block their /24 subnets', checked: field('/subnet') }),
    n('notify', 'Switch', { label: 'Notify the on-call team', checked: field('/notify') }),
    {
      ...n('submit', 'Button', {
        label: 'Block selected',
        variant: 'primary',
        destructive: true,
        submit: true,
      }),
      press: {
        action: 'block_ips',
        params: {
          ips: bind('/selection'),
          duration: bind('/duration'),
          subnet: bind('/subnet'),
          notify: bind('/notify'),
          reason: bind('/reason'),
        },
      },
    },
  ],
];

/** A selectable table with a row action, and a form whose button sends the selection with it. */
export const BLOCK_SOURCES_SCENARIO: Scenario = {
  id: 'block-sources',
  prompt: 'Block the sources brute-forcing /oauth/token',
  summary: 'Pick sources in a table, fill a short form, block them in one action',
  surfaceId: 'block_sources',
  actions: BLOCK_SOURCES_ACTIONS,
  layout: LAYOUT,
  data: [
    {
      after: 0,
      values: [
        { path: '/sources', value: BLOCK_SOURCES_DATA.sources },
        { path: '/selection', value: [] },
      ],
    },
    {
      after: 1,
      values: Object.entries(BLOCK_SOURCES_DATA.form).map(([key, value]) => ({
        path: `/${key}`,
        value,
      })),
    },
  ],
};
