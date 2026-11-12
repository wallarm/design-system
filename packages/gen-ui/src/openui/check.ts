import { createParser, type ElementNode } from '@openuidev/react-lang';
import { type AnswerNode, type CheckOptions, checkNodes, type GenUiIssue } from '../core/check';
import { isRecord } from '../core/guards';
import { dataProps, type OpenUiLibrary } from './catalog';

/** A parsed expression (`$kpi.attacks`, `@Sum(…)`): the runtime evaluates it, so it isn't an issue. */
const isBinding = (value: unknown) => isRecord(value) && typeof value.k === 'string';

const isElement = (value: unknown): value is ElementNode =>
  isRecord(value) && value.type === 'element' && typeof value.typeName === 'string';

/** The agent's mistakes in a finished OpenUI Lang program, per statement. */
export const checkOpenUiAnswer = (
  program: string,
  library: OpenUiLibrary,
  options: CheckOptions,
): GenUiIssue[] => {
  const { library: lib } = library;
  const result = createParser(lib.toJSONSchema(), lib.root).parse(program);
  const nodes: AnswerNode[] = [];
  const visit = (element: ElementNode, fallbackId: string) => {
    const id = element.statementId ?? fallbackId;
    const component = options.components.find(c => c.name === element.typeName);
    const children = Array.isArray(element.props.children)
      ? element.props.children.filter(isElement)
      : [];
    nodes.push({
      id,
      type: element.typeName,
      props: component ? dataProps(component, element.props) : element.props,
      children: children.map((child, i) => child.statementId ?? `${id}_children_${i}`),
      actions: (component?.events ?? []).flatMap(event => actionNames(element.props[event])),
    });
    children.forEach((child, i) => visit(child, `${id}_children_${i}`));
  };
  if (isElement(result.root)) visit(result.root, 'root');

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
  const issues = [...checkNodes(nodes, result.root?.statementId, isBinding, options), ...reported];
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
