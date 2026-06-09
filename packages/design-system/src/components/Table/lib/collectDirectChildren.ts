import {
  Children,
  type ComponentType,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

/**
 * Collects every element of a given component type appearing as a direct child
 * of `node` — transparently descending into `<>...</>` Fragments (but not
 * arbitrary wrapper elements). Used to gather consumer-supplied override
 * sub-components from a compound component's children.
 */
export const collectDirectChildren = <P>(
  node: ReactNode,
  target: ComponentType<P>,
): ReactElement<P>[] => {
  const result: ReactElement<P>[] = [];
  for (const child of Children.toArray(node)) {
    if (!isValidElement(child)) continue;
    if (child.type === target) {
      result.push(child as ReactElement<P>);
    } else if (child.type === Fragment) {
      const fragmentChildren = (child.props as { children?: ReactNode }).children;
      result.push(...collectDirectChildren(fragmentChildren, target));
    }
  }
  return result;
};
