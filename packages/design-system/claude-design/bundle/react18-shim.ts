import type { ElementType, Key, ReactElement, ReactNode, Ref } from 'react';

export type ReactLike = Pick<
  typeof import('react'),
  'createElement' | 'cloneElement' | 'forwardRef' | 'Fragment' | 'version'
>;
type Props = Record<string, unknown>;
type RefComponent = ((props: Props) => ReactNode) & {
  displayName?: string;
  prototype?: { isReactComponent?: unknown };
};
const caches = new WeakMap<ReactLike, WeakMap<RefComponent, ElementType>>();

type CallbackRef = (node: unknown) => unknown;
const hostRefs = new WeakMap<CallbackRef, CallbackRef>();
const adaptedRefs = new WeakSet<CallbackRef>();
function hostRef(ref: CallbackRef): CallbackRef {
  if (adaptedRefs.has(ref)) return ref;
  const existing = hostRefs.get(ref);
  if (existing) return existing;
  const cleanups: (undefined | (() => void))[] = [];
  const callback: CallbackRef = node => {
    if (node == null) {
      const cleanup = cleanups.pop();
      if (cleanup) cleanup();
      else ref(null);
    } else {
      const cleanup = ref(node);
      cleanups.push(typeof cleanup === 'function' ? (cleanup as () => void) : undefined);
    }
  };
  hostRefs.set(ref, callback);
  adaptedRefs.add(callback);
  return callback;
}

function normalize(
  React: ReactLike,
  originalType: unknown,
  originalProps: Props,
): { type: ElementType; props: Props } {
  let type = originalType;
  let props = originalProps;
  if (
    typeof type === 'object' &&
    type !== null &&
    '$$typeof' in type &&
    type.$$typeof === Symbol.for('react.context') &&
    'Provider' in type
  )
    type = type.Provider;
  if (
    typeof type === 'function' &&
    props.ref != null &&
    !(type as RefComponent).prototype?.isReactComponent
  ) {
    const component = type as RefComponent;
    let cache = caches.get(React);
    if (!cache) {
      cache = new WeakMap();
      caches.set(React, cache);
    }
    let wrapper = cache.get(component);
    if (!wrapper) {
      wrapper = React.forwardRef((values: Props, ref: Ref<unknown>) =>
        component({ ...values, ref }),
      );
      wrapper.displayName = component.displayName ?? component.name;
      cache.set(component, wrapper);
    }
    type = wrapper;
  }
  if (typeof type === 'string' && typeof props.inert === 'boolean') {
    props = { ...props };
    if (props.inert) props.inert = '';
    else delete props.inert;
  }
  if (typeof type === 'string') {
    for (const [source, target] of [
      ['fill-rule', 'fillRule'],
      ['clip-rule', 'clipRule'],
    ] as const) {
      if (source in props) {
        props = { ...props, [target]: props[source] };
        delete props[source];
      }
    }
  }
  if (typeof type === 'string' && typeof props.ref === 'function')
    props = { ...props, ref: hostRef(props.ref as CallbackRef) };
  return { type: type as ElementType, props };
}

export function createJsxRuntime(React: ReactLike) {
  const jsx = (type: unknown, props: Props | null, key?: Key): ReactElement<Props> => {
    const normalized = normalize(React, type, props ?? {});
    return React.createElement(
      normalized.type,
      key === undefined ? normalized.props : { ...normalized.props, key },
    ) as ReactElement<Props>;
  };
  const jsxs = (type: unknown, props: Props | null, key?: Key): ReactElement<Props> => {
    const normalized = normalize(React, type, props ?? {});
    const { children, ...rest } = normalized.props;
    return React.createElement(
      normalized.type,
      key === undefined ? rest : { ...rest, key },
      ...(Array.isArray(children) ? children : [children]),
    ) as ReactElement<Props>;
  };
  return { jsx, jsxs, jsxDEV: jsx, Fragment: React.Fragment };
}

export function createReactModule<T extends ReactLike>(React: T): T {
  const cloneElement = ((
    element: ReactElement<Props>,
    props?: Props | null,
    ...children: ReactNode[]
  ) => {
    const cloned = React.cloneElement(element, props ?? undefined, ...children);
    const ref = (cloned as ReactElement<Props> & { ref?: unknown }).ref;
    const normalized = normalize(React, cloned.type, { ...cloned.props, ref });
    if (normalized.type === cloned.type && typeof cloned.type !== 'string') return cloned;
    return React.createElement(normalized.type, { ...normalized.props, key: cloned.key });
  }) as typeof React.cloneElement;
  const createElement = ((type: unknown, props: Props | null, ...children: ReactNode[]) => {
    const normalized = normalize(React, type, props ?? {});
    return React.createElement(normalized.type, normalized.props, ...children);
  }) as typeof React.createElement;
  return { ...React, createElement, cloneElement };
}

/** A single declaration-level identity shared by internal imports and the public canvas global. */
export function wrapCanvasComponent(React: ReactLike, component: RefComponent, name: string) {
  const wrapper = React.forwardRef((props: Props, ref: Ref<unknown>) =>
    component({ ...props, ref }),
  );
  wrapper.displayName = name;
  return wrapper;
}
