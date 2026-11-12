import type { Spec } from '@json-render/core';
import { type CheckOptions, checkNodes, type GenUiIssue } from '../core/check';
import { isRecord } from '../core/guards';

/** `{ $state }`, `{ $item }`, `{ $cond }`…: an expression the runtime resolves. */
const isBinding = (value: unknown) =>
  isRecord(value) && Object.keys(value).some(key => key.startsWith('$'));

/** The agent's mistakes in a finished json-render spec, per element. */
export const checkJsonRenderAnswer = (spec: Spec, options: CheckOptions): GenUiIssue[] =>
  checkNodes(
    Object.entries(spec.elements).map(([id, element]) => ({
      id,
      type: element.type,
      props: element.props ?? {},
      children: element.children ?? [],
      actions: Object.values(element.on ?? {}).flatMap(binding =>
        (Array.isArray(binding) ? binding : [binding]).map(b => b.action),
      ),
    })),
    spec.root,
    isBinding,
    options,
  );
