import type { ReactNode } from 'react';
import * as cascadeSelect from '@zag-js/cascade-select';

/** One option of the cascade. A node with `children` opens the next level. */
export interface FilterCascadeNode {
  value: string;
  label: string;
  /** Second line under the label — a count, a hint. */
  description?: string;
  /** Before the label — a status dot, an icon. */
  icon?: ReactNode;
  disabled?: boolean;
  children?: FilterCascadeNode[];
}

const ROOT_VALUE = '__filter-cascade-root__';

/** The collection a `FilterCascade` picks from: the top level, each node with its own levels. */
export const createFilterCascadeCollection = (items: FilterCascadeNode[]) =>
  cascadeSelect.collection<FilterCascadeNode>({
    rootNode: { value: ROOT_VALUE, label: '', children: items },
    isNodeDisabled: node => Boolean(node.disabled),
  });

export type FilterCascadeCollection = ReturnType<typeof createFilterCascadeCollection>;

/** The nodes along a value path, root first — stops at the first value the tree does not have. */
export const pathNodes = (collection: FilterCascadeCollection, values: string[]) => {
  const nodes: FilterCascadeNode[] = [];
  let level = collection.getNodeChildren(collection.rootNode);
  for (const value of values) {
    const node = level.find(item => collection.getNodeValue(item) === value);
    if (!node) break;
    nodes.push(node);
    level = collection.getNodeChildren(node);
  }
  return nodes;
};
