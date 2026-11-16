/**
 * Scores a finished answer, in any format, against an eval case: the structural errors (what the
 * check reports, plus bindings to paths the app doesn't fill), the composition warnings, and the
 * case's expectations.
 */
import type { Spec } from '@json-render/core';
import type { A2uiMessage } from '../a2ui/catalog';
import { checkA2uiAnswer, readA2uiAnswer } from '../a2ui/check';
import { wallarmComponents } from '../components';
import type { AnswerNode, AnswerTree, CheckOptions, GenUiIssue } from '../core/check';
import type { GenUiComponent } from '../core/define';
import { checkJsonRenderAnswer, readJsonRenderAnswer } from '../json-render/check';
import { createOpenUiLibrary } from '../openui/catalog';
import { checkOpenUiAnswer, readOpenUiAnswer } from '../openui/check';
import type { EvalCase, Expectation } from './cases';

export type EvalAnswer =
  | { format: 'a2ui'; messages: readonly A2uiMessage[] }
  | { format: 'json-render'; spec: Spec }
  | { format: 'openui'; program: string };

export interface EvalScore {
  case: string;
  /** What keeps the answer from rendering as meant; any error scores 0. */
  errors: GenUiIssue[];
  /** Composition rules it breaks; each takes 0.1 off. */
  warnings: GenUiIssue[];
  expectations: { description: string; pass: boolean }[];
  /** 0-1: the share of expectations met, less the warnings. */
  score: number;
  /** No error, no warning, every expectation met. */
  pass: boolean;
}

export const scoreAnswer = (
  evalCase: EvalCase,
  answer: EvalAnswer,
  components: readonly GenUiComponent[] = wallarmComponents,
): EvalScore => {
  const options: CheckOptions = {
    components,
    actions: evalCase.actions,
    boundFigures: evalCase.boundFigures ?? true,
    composition: true,
  };
  const { tree, issues } = read(answer, options);
  const paths = Object.keys(evalCase.data);
  const unknownPaths = tree.nodes.flatMap(node =>
    Object.entries(node.bindings ?? {})
      .filter(([, path]) => !paths.some(known => under(path, known)))
      .map(([prop, path]) => ({
        id: node.id,
        component: node.type,
        prop,
        message: `Binds ${path}, which the app doesn't fill.`,
      })),
  );
  const errors = [...issues.filter(i => i.severity !== 'warning'), ...unknownPaths];
  const warnings = issues.filter(i => i.severity === 'warning');
  const expectations = evalCase.expect.map(e => ({
    description: e.description,
    pass: meets(e, tree.nodes),
  }));
  const met = expectations.filter(e => e.pass).length / Math.max(expectations.length, 1);
  const score = errors.length ? 0 : Math.max(0, met - 0.1 * warnings.length);
  return {
    case: evalCase.id,
    errors,
    warnings,
    expectations,
    score,
    pass: score === 1,
  };
};

const read = (
  answer: EvalAnswer,
  options: CheckOptions,
): { tree: AnswerTree; issues: GenUiIssue[] } => {
  if (answer.format === 'a2ui')
    return {
      tree: readA2uiAnswer(answer.messages, options.components),
      issues: checkA2uiAnswer(answer.messages, options),
    };
  if (answer.format === 'json-render')
    return {
      tree: readJsonRenderAnswer(answer.spec),
      issues: checkJsonRenderAnswer(answer.spec, options),
    };
  const library = createOpenUiLibrary(options.components, options.actions);
  return {
    tree: readOpenUiAnswer(answer.program, library, options.components),
    issues: checkOpenUiAnswer(answer.program, library, options),
  };
};

/** `/kpi/attacks` is under `/kpi`; `/kpis` is not. */
const under = (path: string, base: string) => path === base || path.startsWith(`${base}/`);

const matches = (node: AnswerNode, types: readonly string[], bound: string | undefined) =>
  types.includes(node.type) &&
  (bound === undefined || Object.values(node.bindings ?? {}).some(path => under(path, bound)));

const meets = (e: Expectation, nodes: readonly AnswerNode[]) => {
  if ('fires' in e) return nodes.some(node => node.actions.includes(e.fires));
  if ('uses' in e) return nodes.some(node => matches(node, e.uses, e.bound));
  return !nodes.some(node => matches(node, e.avoids, e.bound));
};
