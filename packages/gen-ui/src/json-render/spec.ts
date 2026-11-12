/**
 * The json-render spec as it streams in: folding SpecStream lines into a spec, and keeping an
 * agent's spec inside the catalog's contract. No React here.
 */
import {
  type ActionBinding,
  compileSpecStream,
  type Spec,
  type SpecStreamLine,
} from '@json-render/core';
import type { GenUiAction } from '../core/define';
import { isRecord } from '../core/guards';
import { warn } from '../render/warn';

/** Not a catalog type: the model never sees it, so only `specFromLines` can put it in a spec. */
export const PENDING = 'gen-ui:pending';

const pending = (id: string): Spec['elements'][string] => ({
  type: PENDING,
  props: { id },
  children: [],
});

/**
 * Folds SpecStream patch lines (in arrival order) into the spec so far. It starts from an empty
 * spec (mid-stream the patches may not have added `root` or `elements` yet, and the Renderer needs
 * both), puts a pending element wherever an element names a child that hasn't arrived yet, and
 * never throws: a patch it can't apply is dropped, and a value that isn't an element is pending.
 */
export const specFromLines = (lines: readonly SpecStreamLine[]): Spec => {
  let compiled: unknown;
  try {
    compiled = compileSpecStream(lines.map(line => JSON.stringify(line)).join('\n'), {
      root: '',
      elements: {},
    });
  } catch {
    // A patch the stream can't apply (a failed `test`, a bad path): drop it, keep the rest.
    return lines.length ? specFromLines(lines.slice(0, -1)) : { root: '', elements: {} };
  }
  const raw = isRecord(compiled) ? compiled : {};
  const source = isRecord(raw.elements) ? raw.elements : {};
  // Only string children count, so the Renderer never sees a shape it would throw on.
  const elements: Spec['elements'] = {};
  for (const [key, value] of Object.entries(source)) {
    elements[key] =
      isRecord(value) && typeof value.type === 'string'
        ? {
            ...value,
            type: value.type,
            props: isRecord(value.props) ? value.props : {},
            children: Array.isArray(value.children)
              ? value.children.filter((child): child is string => typeof child === 'string')
              : [],
          }
        : pending(key);
  }
  for (const element of Object.values(elements)) {
    for (const key of element.children ?? []) elements[key] ??= pending(key);
  }
  return {
    root: typeof raw.root === 'string' ? raw.root : '',
    elements,
    ...(isRecord(raw.state) ? { state: raw.state } : {}),
  };
};

/**
 * Keeps an agent's spec inside the catalog's contract. json-render runs its own built-in actions
 * (setState, pushState, removeState, push, pop, validateForm) without a handler, fires `watch`
 * bindings without a click and opens a `confirm` dialog of its own, so every `on` and `watch`
 * binding keeps only `{ action, params }` for an action in the allowlist; the rest is dropped
 * with a warning. Approval stays with the app.
 */
export const sanitizeSpec = (spec: Spec | null, actions: readonly GenUiAction[]): Spec | null => {
  if (!spec) return spec;
  const allowed = new Set(actions.map(a => a.name));
  // Typed by json-render, but streamed: check the shape at runtime too.
  const keep = (bindings: ActionBinding | ActionBinding[]): ActionBinding[] =>
    (Array.isArray(bindings) ? bindings : [bindings]).flatMap(binding => {
      const action: unknown = isRecord(binding) ? binding.action : undefined;
      if (typeof action === 'string' && allowed.has(action)) {
        return [{ action, ...(isRecord(binding.params) ? { params: binding.params } : {}) }];
      }
      warn(`dropped json-render action '${String(action)}', not in the allowlist`);
      return [];
    });
  const filter = (map: Record<string, ActionBinding | ActionBinding[]> | undefined) =>
    isRecord(map)
      ? Object.fromEntries(
          Object.entries(map)
            .map(([event, bindings]) => [event, keep(bindings)] as const)
            .filter(([, kept]) => kept.length > 0),
        )
      : undefined;
  return {
    ...spec,
    elements: Object.fromEntries(
      Object.entries(spec.elements).map(([key, element]) => [
        key,
        { ...element, on: filter(element.on), watch: filter(element.watch) },
      ]),
    ),
  };
};
