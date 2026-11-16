import { describe, expect, it } from '@rstest/core';
import { EVAL_CASES, type EvalAnswer, type EvalCase, scoreAnswer } from '../evals';
import {
  bind,
  field,
  node as n,
  openUiAnswer,
  SCENARIOS,
  type Scenario,
  type ScenarioStreams,
  toStreams,
} from '../fixtures';
import { specFromLines } from '../json-render';

/** The same answer in every format the scorer reads. */
const answers = (streams: Omit<ScenarioStreams, 'liveStreams'>): EvalAnswer[] => [
  { format: 'a2ui', messages: streams.a2ui.map(l => l.line) },
  { format: 'json-render', spec: specFromLines(streams.jsonRender.map(l => l.line)) },
  { format: 'openui', program: openUiAnswer(streams.openui).program },
];

const caseFor = (id: string): EvalCase => {
  const found = EVAL_CASES.find(c => c.id === id);
  if (!found) throw new Error(`no eval case ${id}`);
  return found;
};

// A first dashboard tailored from a scan, as a good answer would lay it out: no fixture has one.
const ONBOARDING: Scenario = {
  id: 'onboarding',
  prompt: '',
  summary: '',
  surfaceId: 'onboarding',
  actions: caseFor('fintech-onboarding').actions,
  data: [],
  layout: [
    [
      n('root', 'Section', { title: 'Welcome, payments.example', subtitle: 'From your scan' }, [
        'kpis',
        'compliance',
        'checks',
        'start',
      ]),
      n('kpis', 'Grid', { columns: '4' }, ['m1', 'm2', 'm3', 'm4']),
      n('m1', 'Metric', { title: 'Exposed APIs', value: bind('/kpi/exposedApis') }),
      n('m2', 'Metric', { title: 'Sensitive', value: bind('/kpi/sensitiveEndpoints') }),
      n('m3', 'Metric', { title: 'TLS issues', value: bind('/kpi/tlsIssues') }),
      n('m4', 'Metric', { title: 'Findings', value: bind('/kpi/openFindings') }),
      n('compliance', 'Grid', { columns: '2' }, ['scan_card', 'pci']),
      n('scan_card', 'Card', {}, ['scan']),
      n('scan', 'KeyValueList', {
        fields: [
          { key: 'domain', label: 'Domain' },
          { key: 'industry', label: 'Industry' },
        ],
        record: bind('/scan'),
      }),
      n('pci', 'HorizontalBarStack', { title: 'PCI DSS checks', items: bind('/pciStatus') }),
      n('checks', 'Table', {
        title: 'PCI DSS requirements',
        rowKey: 'requirement',
        columns: [
          { key: 'requirement', header: 'Requirement' },
          { key: 'title', header: 'Title' },
          { key: 'status', header: 'Status', type: 'badge' },
        ],
        rows: bind('/pciChecks'),
      }),
      n('start', 'Section', { title: 'Next steps' }, ['steps', 'actions']),
      n('steps', 'List', { items: bind('/nextSteps'), ordered: true }),
      n('actions', 'Stack', { direction: 'row' }, ['connect']),
      {
        ...n('connect', 'Button', { label: 'Connect traffic', variant: 'primary' }),
        press: { action: 'connect_traffic', params: {} },
      },
    ],
  ],
};

// What the integrators saw: a Card in a Card, a figure written in, a pie for a time series, a
// path the app doesn't fill.
const BAD_DASHBOARD: Scenario = {
  ...ONBOARDING,
  actions: caseFor('security-dashboard').actions,
  layout: [
    [
      n('root', 'Section', { title: 'Security dashboard' }, ['card', 't']),
      n('card', 'Card', {}, ['inner', 'm']),
      n('inner', 'Card', {}, ['traffic']),
      n('traffic', 'PieChart', { title: 'Traffic', items: bind('/traffic') }),
      n('m', 'Metric', { title: 'Attacks', value: 64_204 }),
      n('t', 'Table', {
        rowKey: 'ip',
        columns: [{ key: 'ip', header: 'IP' }],
        rows: bind('/made_up'),
      }),
    ],
  ],
};

describe('the eval scorer', () => {
  for (const scenario of SCENARIOS) {
    const evalCase = EVAL_CASES.find(c => c.id === scenario.id);
    if (!evalCase) continue; // the list below names every recorded answer without a case
    it(`scores the recorded "${scenario.prompt}" clean, in every format`, () => {
      for (const answer of answers(scenario))
        expect(scoreAnswer(evalCase, answer)).toMatchObject({
          errors: [],
          warnings: [],
          score: 1,
          pass: true,
        });
    });
  }

  it('has a recorded answer for every case but the tailored onboarding', () => {
    const recorded = new Set(SCENARIOS.map(s => s.id));
    expect(EVAL_CASES.filter(c => !recorded.has(c.id)).map(c => c.id)).toEqual([
      'fintech-onboarding',
    ]);
  });

  it('names every recorded answer that is not an eval yet', () => {
    const cased = new Set(EVAL_CASES.map(c => c.id));
    expect(SCENARIOS.filter(s => !cased.has(s.id)).map(s => s.id)).toEqual([
      'attack-summary',
      'live-monitor',
      'api-inventory',
      'api-structure',
      'config-review',
    ]);
  });

  it('reports an action context that reads a path the app does not fill, in every format', () => {
    const empty: Scenario = {
      ...ONBOARDING,
      actions: caseFor('no-results').actions,
      layout: [
        [
          n('root', 'Section', { title: 'No attacks' }, ['empty']),
          {
            ...n('empty', 'EmptyState', { title: 'No attacks', description: bind('/reason') }),
            press: { action: 'search_attacks', params: { filter: bind('/made_up_filter') } },
          },
        ],
      ],
    };
    for (const answer of answers(toStreams(empty))) {
      const result = scoreAnswer(caseFor('no-results'), answer);
      expect(result.errors.map(e => e.message)).toEqual([
        "Reads /made_up_filter, which the app doesn't fill.",
      ]);
      expect(result.score).toBe(0);
    }
  });

  it('scores a good tailored onboarding dashboard clean, in every format', () => {
    for (const answer of answers(toStreams(ONBOARDING)))
      expect(scoreAnswer(caseFor('fintech-onboarding'), answer)).toMatchObject({
        errors: [],
        warnings: [],
        score: 1,
      });
  });

  it('scores a bad answer 0, with every mistake reported, in every format', () => {
    for (const answer of answers(toStreams(BAD_DASHBOARD))) {
      const result = scoreAnswer(caseFor('security-dashboard'), answer);
      expect(result.score).toBe(0);
      expect(result.pass).toBe(false);
      expect(result.errors.map(e => `${e.id}.${e.prop}`).sort()).toEqual([
        'm.value', // written in
        't.rows', // a path the app doesn't fill
      ]);
      expect(result.warnings.map(w => w.id).sort()).toEqual(['card', 'inner', 'm']);
      const failed = result.expectations.filter(e => !e.pass).map(e => e.description);
      expect(failed).toContain('a time-series chart for /traffic');
      expect(failed).toContain('a Button that blocks the top IPs');
    }
  });

  it('takes warnings off the score of an answer that renders', () => {
    // The onboarding answer with one more block: a Grid around a single Text.
    const nodes = (ONBOARDING.layout[0] ?? []).map(node =>
      node.id === 'root' ? { ...node, children: [...(node.children ?? []), 'lonely'] } : node,
    );
    const one = {
      ...ONBOARDING,
      layout: [[...nodes, n('lonely', 'Grid', {}, ['note']), n('note', 'Text', { text: 'Hi' })]],
    };
    const result = scoreAnswer(caseFor('fintech-onboarding'), {
      format: 'json-render',
      spec: specFromLines(toStreams(one).jsonRender.map(l => l.line)),
    });
    expect(result.errors).toEqual([]);
    expect(result.warnings.map(w => w.id)).toEqual(['lonely']);
    expect(result.score).toBeCloseTo(0.9);
  });

  it('accepts a form field path the case lists', () => {
    const result = scoreAnswer(caseFor('rate-limit'), {
      format: 'json-render',
      spec: specFromLines(
        toStreams({
          ...ONBOARDING,
          layout: [
            [
              n('root', 'Section', { title: 'Rate limit' }, ['limit']),
              n('limit', 'NumberInput', { label: 'Limit', value: field('/limit') }),
            ],
          ],
        }).jsonRender.map(l => l.line),
      ),
    });
    expect(result.errors).toEqual([]);
  });
});
