import { defineCatalog } from '@json-render/core';
import { type ComponentRegistry, defineRegistry } from '@json-render/react';
import { schema } from '@json-render/react/schema';
import { z } from 'zod';
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
        ({ props, children, emit }) => (
          <GuardedView component={component} props={props} emit={emit}>
            {children}
          </GuardedView>
        ),
      ]),
    ),
    // The real handlers come from JsonRenderSurface's `onAction`.
    actions: Object.fromEntries(actions.map(a => [a.name, async () => undefined])),
  });

  return { catalog, registry: registry as ComponentRegistry, actions };
};

export type JsonRenderCatalog = ReturnType<typeof createJsonRenderCatalog>;
