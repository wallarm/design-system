import { Fragment } from 'react';
import {
  action,
  type ComponentRenderProps,
  createLibrary,
  type DefinedComponent,
  defineAction,
  defineComponent,
  reactive,
  type StateField,
  useStateField,
  useTriggerAction,
} from '@openuidev/react-lang';
import * as z from 'zod';
import type { GenUiAction, GenUiComponent } from '../core/define';
import { isRecord } from '../core/guards';
import { GuardedView } from '../render/GuardedView';

/**
 * The OpenUI library for the catalog (what the model is prompted with: `library.prompt()`). Each
 * entry's props pass through in their order, which is the positional order in OpenUI Lang; an
 * entry's events become action props after them, and a container takes `children` last. The
 * app's actions are library actions, written `@block_ips({ips: …})`: the map is the action's
 * context, as in A2UI.
 */
export const createOpenUiLibrary = (
  components: readonly GenUiComponent[],
  actions: readonly GenUiAction[],
) => {
  // Children may be any entry: refs resolve lazily, since containers hold each other.
  const defined: DefinedComponent[] = [];
  const child = z.lazy(() => z.union(defined.map(d => d.ref)));
  for (const component of components) {
    const { name, description, props, events = [], bindable = [], hasChildren } = component;
    // Widened to a plain object schema: the renderer reads the props through GuardedView anyway.
    // A bindable prop is reactive, so `$ip` there stays a binding the View writes back to.
    const schema: z.ZodObject = props
      .extend(Object.fromEntries(bindable.map(key => [key, reactive(props.shape[key])])))
      .extend(Object.fromEntries(events.map(event => [event, action().optional()])))
      .extend(hasChildren ? { children: z.array(child).optional() } : {});
    defined.push(
      defineComponent({ name, description, props: schema, component: renderer(component) }),
    );
  }
  const library = createLibrary({
    components: defined,
    actions: actions.map(a =>
      defineAction({
        name: a.name,
        description: a.description,
        params: z.object({ context: z.record(z.string(), z.unknown()).optional() }),
      }),
    ),
  });
  return { library, actions };
};

export type OpenUiLibrary = ReturnType<typeof createOpenUiLibrary>;

/**
 * An element's data props: no children, no action props, and no `null`, which is how OpenUI Lang
 * skips a positional argument.
 */
export const dataProps = (component: GenUiComponent, props: Record<string, unknown>) => {
  const { events = [] } = component;
  return Object.fromEntries(
    Object.entries(props).filter(
      ([key, value]) => value !== null && key !== 'children' && !events.includes(key),
    ),
  );
};

const renderer = (component: GenUiComponent) => {
  const Render = ({ props, renderNode }: ComponentRenderProps) => {
    const triggerAction = useTriggerAction();
    // One field per bindable prop: a fixed list per entry, so the hooks run in the same order.
    const fields: StateField[] = [];
    for (const key of component.bindable ?? []) {
      // biome-ignore lint/correctness/useHookAtTopLevel: the list is fixed for each entry
      fields.push(useStateField(key, props[key]));
    }
    // A bindable prop's raw value is the binding itself; its field holds the value.
    const data = {
      ...Object.fromEntries(
        Object.entries(dataProps(component, props)).filter(
          ([key]) => !component.bindable?.includes(key),
        ),
      ),
      // null is OpenUI's unset, as for every other prop.
      ...Object.fromEntries(fields.filter(f => f.value !== null).map(f => [f.name, f.value])),
    };
    // A reactive field writes its `$variable`; any other keeps the value in OpenUI's form state.
    const write = (prop: string, value: unknown) => {
      const field = fields.find(f => f.name === prop);
      field?.setValue(value);
      return field !== undefined;
    };
    const emit = (event: string) => {
      const plan = props[event];
      if (isRecord(plan)) triggerAction('', undefined, plan);
    };
    const children = Array.isArray(props.children) ? props.children : [];
    return (
      <GuardedView component={component} props={data} emit={emit} write={write}>
        {component.hasChildren &&
          children.map((node, i) => (
            <Fragment
              key={isRecord(node) && typeof node.statementId === 'string' ? node.statementId : i}
            >
              {renderNode(node)}
            </Fragment>
          ))}
      </GuardedView>
    );
  };
  Render.displayName = `OpenUi${component.name}`;
  return Render;
};
