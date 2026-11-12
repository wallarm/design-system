import { describe, expect, it } from '@rstest/core';
import { type A2uiMessage, checkA2uiAnswer } from '../a2ui';
import { wallarmComponents } from '../components';
import { describeIssues } from '../core/check';
import { SCENARIOS } from '../fixtures';
import { checkJsonRenderAnswer, specFromLines } from '../json-render';

const options = (actions: (typeof SCENARIOS)[number]['actions']) => ({
  components: wallarmComponents,
  actions,
});

// The same mistakes in both formats: an enum value the DS lacks, a child never sent, an unknown
// component, an action outside the allowlist. The bound value is the app's and is never an issue.
const BROKEN_A2UI: A2uiMessage[] = [
  {
    version: '1.0',
    createSurface: {
      surfaceId: 's',
      catalogId: 'x',
      components: [
        { id: 'root', component: 'Stack', children: ['m', 'ghost', 'chart', 'go'] },
        {
          id: 'm',
          component: 'Metric',
          title: 'Attacks',
          value: { '@path': '/a' },
          sparklineColor: 'red',
        },
        { id: 'chart', component: 'Spreadsheet' },
        { id: 'go', component: 'Button', label: 'Go', press: { event: { name: 'rm_rf' } } },
      ],
    },
  } as A2uiMessage,
];
const BROKEN_SPEC = {
  root: 'root',
  elements: {
    root: { type: 'Stack', props: {}, children: ['m', 'ghost', 'chart', 'go'] },
    m: {
      type: 'Metric',
      props: { title: 'Attacks', value: { $state: '/a' }, sparklineColor: 'red' },
      children: [],
    },
    chart: { type: 'Spreadsheet', props: {}, children: [] },
    go: {
      type: 'Button',
      props: { label: 'Go' },
      children: [],
      on: { press: { action: 'rm_rf' } },
    },
  },
};

const summary = (issues: ReturnType<typeof checkA2uiAnswer>) =>
  issues.map(i => `${i.id}${i.prop ? `.${i.prop}` : ''}: ${i.message.slice(0, 24)}`).sort();

describe('checking a finished answer', () => {
  for (const scenario of SCENARIOS) {
    it(`finds nothing wrong in "${scenario.prompt}", in both formats`, () => {
      expect(
        checkA2uiAnswer(
          scenario.a2ui.map(l => l.line),
          options(scenario.actions),
        ),
      ).toEqual([]);
      const spec = specFromLines(scenario.jsonRender.map(l => l.line));
      expect(checkJsonRenderAnswer(spec, options(scenario.actions))).toEqual([]);
    });
  }

  it('reports the same mistakes in both formats', () => {
    const a2ui = checkA2uiAnswer(BROKEN_A2UI, options([]));
    const json = checkJsonRenderAnswer(BROKEN_SPEC, options([]));
    expect(summary(a2ui)).toEqual(summary(json));
    expect(summary(a2ui)).toEqual([
      'chart: Unknown component "Sprea',
      'go: Action "rm_rf" is not al',
      'm.sparklineColor: Invalid option: expected',
      'root: Child "ghost" was never ',
    ]);
  });

  it('reports a missing root', () => {
    expect(checkJsonRenderAnswer({ root: '', elements: {} }, options([]))[0]?.message).toContain(
      'no root',
    );
  });

  it('flags figures written into props when asked to', () => {
    const scenario = SCENARIOS[0];
    if (!scenario) throw new Error('no scenarios');
    const strict = { ...options(scenario.actions), boundFigures: true };
    // The attack summary writes its delta in; every other figure is bound.
    expect(
      checkA2uiAnswer(
        scenario.a2ui.map(l => l.line),
        strict,
      ).map(i => i.prop),
    ).toEqual(['delta.value']);
  });

  it('describes the issues as one message the model can act on', () => {
    const text = describeIssues(checkA2uiAnswer(BROKEN_A2UI, options([])));
    expect(text).toMatch(/^Some components in your answer cannot render/);
    expect(text).toContain('- m (Metric), sparklineColor: ');
  });
});
