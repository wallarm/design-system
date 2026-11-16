/**
 * Checks a finished answer for the agent's own mistakes, the ones that would leave a skeleton on
 * the page for good: an unknown component, a prop its schema rejects, a child that was never
 * sent, an action outside the allowlist. A bound prop is never an issue: its value is the app's.
 * Each format reads its answer into nodes (`checkA2uiAnswer`, `checkJsonRenderAnswer`); the result
 * goes back to the model as a "fix these" message (`describeIssues`) or into an eval.
 */
import { checkComposition } from './composition';
import type { GenUiAction, GenUiComponent } from './define';
import { isRecord } from './guards';

/** One component of an answer, as both formats describe it. */
export interface AnswerNode {
  id: string;
  type: string;
  /** Data props only: no children, no action props. */
  props: Record<string, unknown>;
  children: readonly string[];
  /** Names of the actions the component fires. */
  actions: readonly string[];
  /** The app data path each top-level prop bound to one reads, e.g. `{ points: '/traffic' }`. */
  bindings?: Readonly<Record<string, string>>;
  /** Every app data path the node reads: bound props, nested values and action contexts. */
  reads?: readonly string[];
}

export interface GenUiIssue {
  /** The agent's component id; the root's id for an issue with the answer as a whole. */
  id: string;
  component?: string;
  /** The prop, dot-separated, when the issue is in one. */
  prop?: string;
  message: string;
  /** `warning`: the answer renders but breaks a composition rule. Unset means an error. */
  severity?: 'error' | 'warning';
}

export interface CheckOptions {
  components: readonly GenUiComponent[];
  actions: readonly GenUiAction[];
  /** Report a number written into a prop instead of bound: a figure the model may have made up. */
  boundFigures?: boolean;
  /** Also report the composition rules the tree breaks, as warnings (`checkComposition`). */
  composition?: boolean;
}

export const checkNodes = (
  nodes: readonly AnswerNode[],
  rootId: string | undefined,
  isBinding: (value: unknown) => boolean,
  { components, actions, boundFigures = false, composition = false }: CheckOptions,
): GenUiIssue[] => {
  const issues: GenUiIssue[] = [];
  const ids = new Set(nodes.map(node => node.id));
  if (!rootId || !ids.has(rootId))
    issues.push({ id: rootId ?? 'root', message: 'The answer has no root component.' });

  for (const node of nodes) {
    const at = { id: node.id, component: node.type };
    const entry = components.find(c => c.name === node.type);
    if (!entry) {
      issues.push({ ...at, message: `Unknown component "${node.type}".` });
      continue;
    }
    const parsed = entry.props.safeParse(node.props);
    for (const issue of parsed.success ? [] : parsed.error.issues) {
      if (boundOnPath(node.props, issue.path, isBinding)) continue;
      issues.push({ ...at, prop: issue.path.join('.') || undefined, message: issue.message });
    }
    for (const child of node.children)
      if (!ids.has(child)) issues.push({ ...at, message: `Child "${child}" was never sent.` });
    for (const action of node.actions)
      if (!actions.some(a => a.name === action))
        issues.push({ ...at, message: `Action "${action}" is not allowed.` });
    if (boundFigures)
      for (const prop of literalNumbers(node.props, isBinding))
        issues.push({ ...at, prop, message: 'A figure is written in; bind it to the app data.' });
  }
  return composition ? [...issues, ...checkComposition(nodes, rootId)] : issues;
};

/**
 * The issues as one message to send the model, asking it to resend only those components. Errors
 * come first; warnings follow as suggestions, since the answer renders without fixing them.
 */
export const describeIssues = (issues: readonly GenUiIssue[]): string => {
  const line = (i: GenUiIssue) =>
    `- ${i.id}${i.component ? ` (${i.component})` : ''}${i.prop ? `, ${i.prop}` : ''}: ${i.message}`;
  const errors = issues.filter(i => i.severity !== 'warning');
  const warnings = issues.filter(i => i.severity === 'warning');
  return [
    ...(errors.length
      ? [
          'Some components in your answer cannot render. Fix them and resend only these components:',
          ...errors.map(line),
        ]
      : []),
    ...(warnings.length
      ? [
          'Suggestions to make the answer read better: resend the components they name, changed.',
          ...warnings.map(line),
        ]
      : []),
  ].join('\n');
};

/** `AnswerNode.bindings` from a node's props, given how the format writes a bound path. */
export const bindingsOf = (
  props: Record<string, unknown>,
  pathOf: (value: unknown) => string | undefined,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(props).flatMap(([key, value]) => {
      const path = pathOf(value);
      return path === undefined ? [] : [[key, path]];
    }),
  );

/** Every path bound anywhere in `value`: nested props, list items, an action's context. */
export const pathsIn = (
  value: unknown,
  pathOf: (value: unknown) => string | undefined,
): string[] => {
  const path = pathOf(value);
  if (path !== undefined) return [path];
  if (Array.isArray(value)) return value.flatMap(item => pathsIn(item, pathOf));
  return isRecord(value) ? Object.values(value).flatMap(item => pathsIn(item, pathOf)) : [];
};

/** The answer as nodes, the form every format's reader gives. */
export interface AnswerTree {
  nodes: AnswerNode[];
  rootId: string | undefined;
}

/** True when the value at `path`, or one of its parents, is a binding (the app fills it). */
const boundOnPath = (
  props: unknown,
  path: readonly PropertyKey[],
  isBinding: (value: unknown) => boolean,
) => {
  let value = props;
  for (const key of path) {
    if (isBinding(value)) return true;
    value = typeof value === 'object' && value !== null ? Reflect.get(value, key) : undefined;
  }
  return isBinding(value);
};

const literalNumbers = (
  value: unknown,
  isBinding: (value: unknown) => boolean,
  prefix = '',
): string[] => {
  if (typeof value === 'number') return [prefix];
  if (isBinding(value) || !(isRecord(value) || Array.isArray(value))) return [];
  return Object.entries(value).flatMap(([key, v]) =>
    literalNumbers(v, isBinding, prefix ? `${prefix}.${key}` : key),
  );
};
