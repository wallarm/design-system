import { describe, expect, it } from '@rstest/core';
import { checkA2uiAnswer, createA2uiCatalog } from '../a2ui';
import { a2uiPrompt } from '../a2ui/prompt';
import { wallarmComponents } from '../components';
import { type CheckOptions, describeIssues, type GenUiIssue } from '../core/check';
import { COMPOSITION_RULES } from '../core/composition';
import { bind, node as n, openUiAnswer, SCENARIOS, type Scenario, toStreams } from '../fixtures';
import { checkJsonRenderAnswer, createJsonRenderCatalog, specFromLines } from '../json-render';
import { checkOpenUiAnswer, createOpenUiLibrary } from '../openui';

/** The issues of a recorded answer in every format, with the composition check on. */
const issuesIn = (
  streams: Pick<(typeof SCENARIOS)[number], 'a2ui' | 'jsonRender' | 'openui' | 'actions'>,
) => {
  const options: CheckOptions = {
    components: wallarmComponents,
    actions: streams.actions,
    composition: true,
  };
  const library = createOpenUiLibrary(wallarmComponents, streams.actions);
  return {
    a2ui: checkA2uiAnswer(
      streams.a2ui.map(l => l.line),
      options,
    ),
    jsonRender: checkJsonRenderAnswer(specFromLines(streams.jsonRender.map(l => l.line)), options),
    openui: checkOpenUiAnswer(openUiAnswer(streams.openui).program, library, options),
  };
};

const where = (issues: readonly GenUiIssue[]) =>
  issues.map(i => `${i.id}: ${i.severity ?? 'error'}`).sort();

// Every rule the check knows, broken once: a Card as the root holding a Card around a chart, a
// one-cell Grid, a single tab, a Metric in a column, four Alerts, a Separator between Sections and
// a tree eight levels deep.
const BAD: Scenario = {
  id: 'bad',
  prompt: '',
  summary: '',
  surfaceId: 'bad',
  actions: [],
  data: [],
  layout: [
    [
      n('root', 'Card', {}, [
        'inner',
        'grid',
        'tabs',
        'm',
        'a1',
        'a2',
        'a3',
        'a4',
        's1',
        'sep',
        's2',
        'd1',
      ]),
      n('inner', 'Card', {}, ['chart']),
      n('chart', 'LineChart', {
        title: 'Traffic',
        series: [{ key: 'requests', label: 'Requests' }],
        points: bind('/traffic'),
      }),
      n('grid', 'Grid', { columns: '2' }, ['x']),
      n('x', 'Text', { text: 'Alone' }),
      n('tabs', 'Tabs', { labels: ['Only'] }, ['y']),
      n('y', 'Text', { text: 'One pane' }),
      n('m', 'Metric', { title: 'Attacks', value: bind('/attacks') }),
      ...['a1', 'a2', 'a3', 'a4'].map(id => n(id, 'Alert', { title: 'Note' })),
      n('s1', 'Section', { title: 'One' }, []),
      n('sep', 'Separator'),
      n('s2', 'Section', { title: 'Two' }, []),
      ...['d1', 'd2', 'd3', 'd4', 'd5'].map((id, i, all) =>
        n(id, 'Stack', {}, [all[i + 1] ?? 'd6']),
      ),
      n('d6', 'Stack', {}, ['deep']),
      n('deep', 'Text', { text: 'Too deep' }),
    ],
  ],
};

describe('the composition check', () => {
  for (const scenario of SCENARIOS) {
    it(`finds no composition issue in "${scenario.prompt}", in every format`, () => {
      expect(issuesIn(scenario)).toEqual({ a2ui: [], jsonRender: [], openui: [] });
    });
  }

  it('warns about every rule it knows, at the same components in every format', () => {
    const { a2ui, jsonRender, openui } = issuesIn({ ...toStreams(BAD), actions: [] });
    const expected = [
      'a4: warning', // a fourth Alert
      'deep: warning', // eight levels down
      'grid: warning', // one child
      'inner: warning', // a Card around a chart
      'm: warning', // a Metric in a column
      'root: warning', // a Card as the root
      'root: warning', // and holding a Card
      'sep: warning', // between Sections
      'tabs: warning', // one pane
    ];
    expect(where(a2ui)).toEqual(expected);
    expect(where(jsonRender)).toEqual(expected);
    expect(where(openui)).toEqual(expected);
  });

  it('stays off unless asked, so existing callers see no warning', () => {
    const { a2ui } = toStreams(BAD);
    expect(
      checkA2uiAnswer(
        a2ui.map(l => l.line),
        { components: wallarmComponents, actions: [] },
      ),
    ).toEqual([]);
  });

  it('words warnings as suggestions, after the errors', () => {
    const warning: GenUiIssue = {
      id: 'g',
      component: 'Grid',
      message: 'One child.',
      severity: 'warning',
    };
    const error: GenUiIssue = { id: 'm', component: 'Metric', prop: 'value', message: 'Required.' };
    expect(describeIssues([warning])).toMatch(/^Suggestions to make the answer read better/);
    const both = describeIssues([warning, error]).split('\n');
    expect(both[0]).toMatch(/^Some components in your answer cannot render/);
    expect(both[1]).toBe('- m (Metric), value: Required.');
    expect(both[2]).toMatch(/^Suggestions/);
    expect(both[3]).toBe('- g (Grid): One child.');
  });

  it('prompts the model with the rules in every format', () => {
    const rule = COMPOSITION_RULES[0] ?? '';
    const catalog = createA2uiCatalog(wallarmComponents);
    expect(a2uiPrompt(catalog, { actions: [] })).toContain(rule);
    expect(a2uiPrompt(catalog, { actions: [], composition: false })).not.toContain(rule);
    expect(
      createJsonRenderCatalog(wallarmComponents, []).catalog.prompt({
        customRules: [...COMPOSITION_RULES],
      }),
    ).toContain(rule);
    expect(
      createOpenUiLibrary(wallarmComponents, []).library.prompt({
        additionalRules: [...COMPOSITION_RULES],
      }),
    ).toContain(rule);
  });
});
