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
import type { A2uiMessage } from './catalog';

const isBinding = (value: unknown) => isRecord(value) && ('@path' in value || '@call' in value);
const pathOf = (value: unknown) =>
  isRecord(value) && typeof value['@path'] === 'string' ? value['@path'] : undefined;

/** A finished A2UI answer (one surface) as nodes, for the check and the evals. */
export const readA2uiAnswer = (
  messages: readonly A2uiMessage[],
  components: readonly GenUiComponent[],
): AnswerTree => {
  // A later message replaces a component with the same id, as the renderer does.
  const byId = new Map<string, AnswerNode>();
  for (const message of messages) {
    const raw =
      'createSurface' in message
        ? message.createSurface.components
        : 'updateComponents' in message
          ? message.updateComponents.components
          : undefined;
    for (const component of raw ?? []) byId.set(component.id, toNode(component, components));
  }
  return { nodes: [...byId.values()], rootId: 'root' };
};

/** The agent's mistakes in a finished A2UI answer (one surface), per component. */
export const checkA2uiAnswer = (
  messages: readonly A2uiMessage[],
  options: CheckOptions,
): GenUiIssue[] => {
  const { nodes, rootId } = readA2uiAnswer(messages, options.components);
  return checkNodes(nodes, rootId, isBinding, options);
};

const toNode = (
  { id, component, children, ...rest }: { id: string; component: string; [key: string]: unknown },
  components: readonly GenUiComponent[],
): AnswerNode => {
  const events = components.find(c => c.name === component)?.events ?? [];
  const props = Object.fromEntries(Object.entries(rest).filter(([key]) => !events.includes(key)));
  const actions = events.flatMap(event => {
    const value = rest[event];
    return isRecord(value) && isRecord(value.event) && typeof value.event.name === 'string'
      ? [value.event.name]
      : [];
  });
  // A child list is ids, or a template whose rows all render one component.
  const ids = Array.isArray(children)
    ? children.filter(child => typeof child === 'string')
    : isRecord(children) && typeof children.componentId === 'string'
      ? [children.componentId]
      : [];
  return {
    id,
    type: component,
    props,
    children: ids,
    actions,
    bindings: bindingsOf(props, pathOf),
    reads: pathsIn(rest, pathOf),
  };
};
