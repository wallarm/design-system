import { createParser, type ElementNode } from '@openuidev/react-lang';
import {
  type AnswerNode,
  type AnswerTree,
  bindingsOf,
  type CheckOptions,
  checkNodes,
  type GenUiIssue,
  pathsIn,
} from '../core/check';
import type { GenUiComponent } from '../core/define';
import { isRecord } from '../core/guards';
import { dataProps, type OpenUiLibrary } from './catalog';

/** A parsed expression (`$kpi.attacks`, `@Sum(…)`): the runtime evaluates it, so it isn't an issue. */
const isBinding = (value: unknown) => isRecord(value) && typeof value.k === 'string';

const isElement = (value: unknown): value is ElementNode =>
  isRecord(value) && value.type === 'element' && typeof value.typeName === 'string';

/** `$kpi.attacks` → `/kpi/attacks`, `$rows[0]` → `/rows/0`; any other expression has no path. */
const pathOf = (value: unknown): string | undefined => {
  if (!isRecord(value)) return undefined;
  if (value.k === 'StateRef' && typeof value.n === 'string')
    return `/${value.n.replace(/^\$/, '')}`;
  const base = value.k === 'Member' || value.k === 'Index' ? pathOf(value.obj) : undefined;
  if (base === undefined) return undefined;
  if (value.k === 'Member' && typeof value.field === 'string') return `${base}/${value.field}`;
  const index = isRecord(value.index) ? value.index.v : undefined;
  return typeof index === 'number' || typeof index === 'string' ? `${base}/${index}` : undefined;
};

const parse = (program: string, library: OpenUiLibrary, components: readonly GenUiComponent[]) => {
  const { library: lib } = library;
  const result = createParser(lib.toJSONSchema(), lib.root).parse(program);
  const nodes: AnswerNode[] = [];
  const visit = (element: ElementNode, fallbackId: string) => {
    const id = element.statementId ?? fallbackId;
    const component = components.find(c => c.name === element.typeName);
    const children = Array.isArray(element.props.children)
      ? element.props.children.filter(isElement)
      : [];
    const props = component ? dataProps(component, element.props) : element.props;
    nodes.push({
      id,
      type: element.typeName,
      props,
      children: children.map((child, i) => child.statementId ?? `${id}_children_${i}`),
      actions: (component?.events ?? []).flatMap(event => actionNames(element.props[event])),
      bindings: bindingsOf(props, pathOf),
      reads: pathsIn(
        [props, ...(component?.events ?? []).map(event => element.props[event])],
        pathOf,
      ),
    });
    children.forEach((child, i) => visit(child, `${id}_children_${i}`));
  };
  if (isElement(result.root)) visit(result.root, 'root');
  return { result, tree: { nodes, rootId: result.root?.statementId } };
};

/** A finished OpenUI Lang program as nodes, for the check and the evals. */
export const readOpenUiAnswer = (
  program: string,
  library: OpenUiLibrary,
  components: readonly GenUiComponent[],
): AnswerTree => parse(program, library, components).tree;

/** The agent's mistakes in a finished OpenUI Lang program, per statement. */
export const checkOpenUiAnswer = (
  program: string,
  library: OpenUiLibrary,
  options: CheckOptions,
): GenUiIssue[] => {
  const { result, tree } = parse(program, library, options.components);

  // The parser checks props itself and drops what fails (a value outside an enum, a call to an
  // unknown action, a component it doesn't know), so those come from its report.
  const reported: GenUiIssue[] = [
    ...result.meta.unresolved.map(name => ({
      id: referrer(program, name) ?? name,
      message: `Child "${name}" was never sent.`,
    })),
    ...result.meta.errors.map(({ code, statementId, component, path, message }) => {
      const at = { id: statementId ?? 'root', component };
      if (code === 'unknown-component')
        return { ...at, message: `Unknown component "${component}".` };
      if (code === 'unknown-function')
        return { ...at, message: `Action "${component}" is not allowed.` };
      return { ...at, prop: path?.split('/').filter(Boolean).join('.') || undefined, message };
    }),
  ];
  const issues = [...checkNodes(tree.nodes, tree.rootId, isBinding, options), ...reported];
  // A prop both checks flag is one issue.
  return issues.filter(
    (issue, i) =>
      !issue.prop ||
      issues.findIndex(other => other.id === issue.id && other.prop === issue.prop) === i,
  );
};

/** Every step an action prop runs (`Action([…])` holds several). */
const actionNames = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap(actionNames);
  if (!isRecord(value)) return [];
  const own = value.k === 'Comp' && typeof value.name === 'string' && value.name !== 'Action';
  return [...(own ? [String(value.name)] : []), ...Object.values(value).flatMap(actionNames)];
};

/** The statement that names `ref`, for an issue to point at the component to fix. */
const referrer = (program: string, ref: string) =>
  program
    .split('\n')
    .map(line => line.match(/^\s*(\w+)\s*=(.*)$/))
    .find(match => match?.[2] && new RegExp(`\\b${ref}\\b`).test(match[2]))?.[1];
