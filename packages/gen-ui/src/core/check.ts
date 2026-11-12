/**
 * Checks a finished answer for the agent's own mistakes, the ones that would leave a skeleton on
 * the page for good: an unknown component, a prop its schema rejects, a child that was never
 * sent, an action outside the allowlist. A bound prop is never an issue: its value is the app's.
 * Each format reads its answer into nodes (`checkA2uiAnswer`, `checkJsonRenderAnswer`); the result
 * goes back to the model as a "fix these" message (`describeIssues`) or into an eval.
 */
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
}

export interface GenUiIssue {
  /** The agent's component id; the root's id for an issue with the answer as a whole. */
  id: string;
  component?: string;
  /** The prop, dot-separated, when the issue is in one. */
  prop?: string;
  message: string;
}

export interface CheckOptions {
  components: readonly GenUiComponent[];
  actions: readonly GenUiAction[];
  /** Report a number written into a prop instead of bound: a figure the model may have made up. */
  boundFigures?: boolean;
}

export const checkNodes = (
  nodes: readonly AnswerNode[],
  rootId: string | undefined,
  isBinding: (value: unknown) => boolean,
  { components, actions, boundFigures = false }: CheckOptions,
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
  return issues;
};

/** The issues as one message to send the model, asking it to resend only those components. */
export const describeIssues = (issues: readonly GenUiIssue[]): string =>
  [
    'Some components in your answer cannot render. Fix them and resend only these components:',
    ...issues.map(
      i =>
        `- ${i.id}${i.component ? ` (${i.component})` : ''}${i.prop ? `, ${i.prop}` : ''}: ${i.message}`,
    ),
  ].join('\n');

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
