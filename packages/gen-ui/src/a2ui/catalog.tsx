/**
 * The A2UI catalog: what the agent is prompted with (`toJson()`) and how the React renderer draws
 * each entry. The children of a container wait in a ChildSlot until the agent has sent them.
 */

import { type FC, type ReactNode, useSyncExternalStore } from 'react';
import {
  createComponentImplementation,
  type ReactComponentImplementation,
  useA2uiSurface,
} from '@a2ui/react';
import { Catalog, type ComponentApi } from '@a2ui/web_core';
import type { AgentToRendererMessage } from '@a2ui/web_core/v1_0';
import type { z as z3 } from 'zod/v3';
import type { GenUiComponent } from '../core/define';
import { GuardedView } from '../render/GuardedView';
import { Placeholder } from '../render/Placeholder';
import { A2UI_ACTION, A2UI_CHILD_LIST, toA2uiProps } from './toA2uiSchema';

/** A v1.0 agent → renderer message: createSurface, updateComponents, updateDataModel, deleteSurface. */
export type A2uiMessage = AgentToRendererMessage;

export const WALLARM_A2UI_CATALOG_ID =
  'https://wallarm.github.io/design-system/gen-ui/catalog/v1.json';

type ChildRef = string | { id: string; basePath: string };

/**
 * @a2ui/react types its API with the consumer's zod (4 here) while @a2ui/web_core types it with
 * its pinned zod 3, so the two can't be matched in TS. These views of the same functions are where
 * that mismatch is cast away; at runtime both walk the schema by `_def.typeName`.
 */
const implement = createComponentImplementation as unknown as (
  api: { name: string; schema: z3.ZodTypeAny },
  render: FC<{
    props: Record<string, unknown>;
    buildChild: (id: string, basePath?: string) => ReactNode;
    context: { componentModel: { properties: Record<string, unknown> } };
  }>,
) => ReactComponentImplementation;

/**
 * A2UI glue: each component's zod props become an A2UI API (bindable leaves, one Action prop
 * per event, a ChildList when it has children) and its View renders the binder's resolved props.
 * `toJson()` on the result is the catalog document the agent is prompted with.
 */
export const createA2uiCatalog = (
  components: readonly GenUiComponent[],
  id = WALLARM_A2UI_CATALOG_ID,
): Catalog<ComponentApi> =>
  new Catalog(
    id,
    '1.0',
    components.map(component => {
      const { name, description, props, events = [], hasChildren } = component;
      const schema = toA2uiProps(props)
        .extend(Object.fromEntries(events.map(event => [event, A2UI_ACTION.optional()])))
        .extend(hasChildren ? { children: A2UI_CHILD_LIST.optional() } : {})
        .describe(description);

      const impl = implement({ name, schema }, ({ props: resolved, buildChild, context }) => {
        const { children, ...rest } = resolved as { children?: ChildRef[] };
        const values = rest as Record<string, unknown>;
        const raw = context.componentModel.properties.children;
        const rawIds = Array.isArray(raw) ? raw : undefined;
        const emit = (event: string) => {
          const action = values[event];
          if (typeof action === 'function') action();
        };
        return (
          <GuardedView component={component} props={values} emit={emit}>
            {children?.map((child, index) => {
              const ref = typeof child === 'string' ? { id: child, basePath: undefined } : child;
              // The binder hands back node refs; the ids the agent wrote are in the raw props
              // (a static list; a data template has no ids to wait for).
              const agentId = rawIds?.[index];
              return (
                <ChildSlot
                  key={`${ref.id}@${ref.basePath ?? ''}`}
                  id={ref.id}
                  agentId={typeof agentId === 'string' ? agentId : undefined}
                  basePath={ref.basePath}
                  buildChild={buildChild}
                />
              );
            })}
          </GuardedView>
        );
      });
      return impl as unknown as ComponentApi;
    }),
  );

/**
 * One child of a container: the component once the agent has sent it, a placeholder until then.
 * It re-renders on its own when the component arrives, because the parent's props don't change.
 */
const ChildSlot: FC<{
  id: string;
  /** The id the agent wrote; absent for template children, which never wait. */
  agentId?: string;
  basePath?: string;
  buildChild: (id: string, basePath?: string) => ReactNode;
}> = ({ id, agentId, basePath, buildChild }) => {
  const components = useA2uiSurface()?.componentsModel;
  const subscribe = (onChange: () => void) => {
    const created = components?.onCreated.subscribe(onChange);
    const deleted = components?.onDeleted.subscribe(onChange);
    return () => {
      created?.unsubscribe();
      deleted?.unsubscribe();
    };
  };
  const arrived = useSyncExternalStore(
    subscribe,
    () => !agentId || (components?.has(agentId) ?? true),
  );
  return arrived || !agentId ? buildChild(id, basePath) : <Placeholder id={agentId} />;
};
