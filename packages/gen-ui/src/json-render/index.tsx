import { type FC, useEffect, useRef, useState } from 'react';
import {
  type ActionBinding,
  compileSpecStream,
  createStateStore,
  defineCatalog,
  type Spec,
  type SpecStreamLine,
} from '@json-render/core';
import {
  type ComponentRegistry,
  type ComponentRenderProps,
  defineRegistry,
  JSONUIProvider,
  Renderer,
} from '@json-render/react';
import { schema } from '@json-render/react/schema';
import { z } from 'zod';
import type { GenUiAction, GenUiActionHandler, GenUiComponent } from '../define';
import { GuardedView } from '../GuardedView';
import { Placeholder } from '../Placeholder';
import { SurfaceBoundary } from '../SurfaceBoundary';
import { warn } from '../warn';

/**
 * json-render glue. The zod props pass through untouched: `$state`/`$bindState` and the other
 * expressions are resolved by the json-render runtime before the View sees them.
 */
export const createJsonRenderCatalog = (
  components: readonly GenUiComponent[],
  actions: readonly GenUiAction[],
) => {
  const catalog = defineCatalog(schema, {
    components: Object.fromEntries(
      components.map(c => [
        c.name,
        {
          props: c.props,
          description: c.description,
          ...(c.hasChildren ? { slots: ['default'] } : {}),
        },
      ]),
    ),
    actions: Object.fromEntries(
      actions.map(a => [
        a.name,
        { description: a.description, params: z.record(z.string(), z.unknown()) },
      ]),
    ),
  });

  const { registry } = defineRegistry(catalog, {
    components: Object.fromEntries(
      components.map(component => [
        component.name,
        ({ props, children, emit }) => (
          <GuardedView component={component} props={props} emit={emit}>
            {children}
          </GuardedView>
        ),
      ]),
    ),
    actions: Object.fromEntries(actions.map(a => [a.name, async () => undefined])),
  });

  return { catalog, registry: registry as ComponentRegistry, actions };
};

export type JsonRenderCatalog = ReturnType<typeof createJsonRenderCatalog>;

export interface JsonRenderSurfaceProps {
  catalog: JsonRenderCatalog;
  /** The spec so far; it grows while the model streams. */
  spec: Spec | null;
  streaming?: boolean;
  onAction: GenUiActionHandler;
}

export const JsonRenderSurface: FC<JsonRenderSurfaceProps> = ({
  catalog,
  spec,
  streaming,
  onAction,
}) => {
  // ActionProvider reads `handlers` once at mount, so they must forward to the latest onAction.
  const onActionRef = useRef(onAction);
  useEffect(() => {
    onActionRef.current = onAction;
  });
  const [handlers] = useState(() =>
    Object.fromEntries(
      catalog.actions.map(a => [
        a.name,
        (params: Record<string, unknown>) => onActionRef.current(a.name, params),
      ]),
    ),
  );

  // The spec's state grows after mount (the app fills it while the agent streams). It runs on a
  // store, and each new spec writes only the leaves whose value changed since the last spec (and
  // clears the ones it dropped), so a value a user edited in between stays.
  const [store] = useState(() => createStateStore(spec?.state ?? {}));
  const applied = useRef<Record<string, string>>({});
  useEffect(() => {
    const next = leaves(spec?.state ?? {});
    const updates: Record<string, unknown> = {};
    for (const [pointer, value] of Object.entries(next)) {
      const json = JSON.stringify(value);
      if (applied.current[pointer] !== json) updates[pointer] = value;
      applied.current[pointer] = json;
    }
    for (const pointer of Object.keys(applied.current)) {
      if (pointer in next) continue;
      updates[pointer] = undefined;
      delete applied.current[pointer];
    }
    if (Object.keys(updates).length) store.update(updates);
  }, [spec?.state, store]);

  return (
    <JSONUIProvider registry={catalog.registry} store={store} handlers={handlers}>
      <SurfaceBoundary>
        <Renderer
          spec={sanitizeSpec(spec, catalog.actions)}
          registry={catalog.registry}
          loading={streaming}
          fallback={PendingElement}
        />
      </SurfaceBoundary>
    </JSONUIProvider>
  );
};

/** JSON Pointer → value for every leaf; arrays are leaves (rows are replaced, not merged). */
const leaves = (value: Record<string, unknown>, prefix = ''): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(value).flatMap(([key, v]) => {
      const pointer = `${prefix}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`;
      return typeof v === 'object' && v !== null && !Array.isArray(v)
        ? Object.entries(leaves(v as Record<string, unknown>, pointer))
        : [[pointer, v]];
    }),
  );

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Not a catalog type: the model never sees it, so only `specFromLines` can put it in a spec. */
const PENDING = 'gen-ui:pending';

/**
 * Folds SpecStream patch lines (in arrival order) into the spec so far. It starts from an empty
 * spec (mid-stream the patches may not have added `root` or `elements` yet, and the Renderer needs
 * both), puts a placeholder wherever an element names a child that hasn't arrived yet, and never
 * throws: a patch it can't apply is dropped, and a value that isn't an element is a placeholder.
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
  // Agent output is untrusted: anything that isn't an element becomes a placeholder, and only
  // string children count, so the Renderer never sees a shape it would throw on.
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

const pending = (id: string): Spec['elements'][string] => ({
  type: PENDING,
  props: { id },
  children: [],
});

const PendingElement: FC<ComponentRenderProps> = ({ element }) => (
  <Placeholder id={String(element.props.id ?? element.type)} />
);

export type { Spec, SpecStreamLine } from '@json-render/core';
