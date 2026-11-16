import type { Spec } from '@json-render/core';
import {
  type AnswerTree,
  bindingsOf,
  type CheckOptions,
  checkNodes,
  type GenUiIssue,
  pathsIn,
} from '../core/check';
import { isRecord } from '../core/guards';

/** `{ $state }`, `{ $item }`, `{ $cond }`…: an expression the runtime resolves. */
const isBinding = (value: unknown) =>
  isRecord(value) && Object.keys(value).some(key => key.startsWith('$'));
const pathOf = (value: unknown) => {
  if (!isRecord(value)) return undefined;
  const path = value.$state ?? value.$bindState;
  return typeof path === 'string' ? path : undefined;
};

/** A finished json-render spec as nodes, for the check and the evals. */
export const readJsonRenderAnswer = (spec: Spec): AnswerTree => ({
  nodes: Object.entries(spec.elements).map(([id, element]) => {
    const props = element.props ?? {};
    return {
      id,
      type: element.type,
      props,
      children: element.children ?? [],
      actions: Object.values(element.on ?? {}).flatMap(binding =>
        (Array.isArray(binding) ? binding : [binding]).map(b => b.action),
      ),
      bindings: bindingsOf(props, pathOf),
      reads: pathsIn([props, element.on], pathOf),
    };
  }),
  rootId: spec.root,
});

/** The agent's mistakes in a finished json-render spec, per element. */
export const checkJsonRenderAnswer = (spec: Spec, options: CheckOptions): GenUiIssue[] => {
  const { nodes, rootId } = readJsonRenderAnswer(spec);
  return checkNodes(nodes, rootId, isBinding, options);
};
