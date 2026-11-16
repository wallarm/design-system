import type { ReactNode } from 'react';
import { defineCatalog } from '@json-render/core';
import { type ComponentRegistry, defineRegistry, useStateStore } from '@json-render/react';
import { schema } from '@json-render/react/schema';
import * as z from 'zod';
import type { GenUiAction, GenUiComponent } from '../core/define';
import { GuardedView } from '../render/GuardedView';

/**
 * The json-render catalog (what the model is prompted with: `catalog.prompt()`) and the registry
 * that renders it. The zod props pass through untouched: `$state`/`$bindState` and the other
 * expressions are resolved by the json-render runtime before a View sees them.
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
        ({ props, children, emit, bindings }) => (
          <JsonRenderView component={component} props={props} emit={emit} bindings={bindings}>
            {children}
          </JsonRenderView>
        ),
      ]),
    ),
    // The real handlers come from JsonRenderSurface's `onAction`.
    actions: Object.fromEntries(actions.map(a => [a.name, async () => undefined])),
  });

  return { catalog, registry: registry as ComponentRegistry, actions };
};

/** `$bindState` puts the prop's state path in `bindings`; a write goes to that path. */
const JsonRenderView = ({
  component,
  props,
  children,
  emit,
  bindings,
}: {
  component: GenUiComponent;
  props: unknown;
  children?: ReactNode;
  emit: (event: string) => void;
  bindings?: Record<string, string>;
}) => {
  const store = useStateStore();
  const write = (prop: string, value: unknown) => {
    const path = bindings?.[prop];
    if (!path) return false;
    store.set(path, value);
    return true;
  };
  return (
    <GuardedView component={component} props={props} emit={emit} write={write}>
      {children}
    </GuardedView>
  );
};

export type JsonRenderCatalog = ReturnType<typeof createJsonRenderCatalog>;
