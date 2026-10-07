import type { ReactNode } from 'react';
import * as cascadeSelect from '@zag-js/cascade-select';

/** How a `FilterCascade` reads the consumer's own objects. */
export interface FilterCascadeAccessors<T> {
  /** Unique among its siblings; a picked path is these values, top level first. */
  getValue: (item: T) => string;
  /** What the option, typeahead, search and the trigger read. */
  getLabel: (item: T) => string;
  /** The next level, when it is already known. */
  getChildren?: (item: T) => T[] | undefined;
  /**
   * Whether the item opens a level whose items are not known yet — they come from the root's
   * `loadChildren` when the item is first highlighted.
   */
  hasChildren?: (item: T) => boolean;
  isDisabled?: (item: T) => boolean;
  /** Before the label in the option and in the trigger — a status dot, an icon. */
  getIcon?: (item: T) => ReactNode;
  /** The option's second line — a count, a hint. */
  getDescription?: (item: T) => ReactNode;
}

/** What a `FilterCascade` picks from: the top level and how to read it. */
export interface FilterCascadeCollection<T> {
  items: T[];
  accessors: FilterCascadeAccessors<T>;
}

interface DefaultItem {
  value: string;
  label: string;
  children?: DefaultItem[];
  disabled?: boolean;
}

/**
 * The collection a `FilterCascade` picks from. Items can be any objects — say how to read them;
 * without accessors they are read as `{ value, label, children?, disabled? }`.
 */
export function createFilterCascadeCollection<T>(
  items: T[],
  accessors: FilterCascadeAccessors<T>,
): FilterCascadeCollection<T>;
export function createFilterCascadeCollection<T extends DefaultItem>(
  items: T[],
): FilterCascadeCollection<T>;
export function createFilterCascadeCollection<T>(
  items: T[],
  accessors?: FilterCascadeAccessors<T>,
): FilterCascadeCollection<T> {
  return {
    items,
    accessors: accessors ?? {
      getValue: item => (item as DefaultItem).value,
      getLabel: item => (item as DefaultItem).label,
      getChildren: item => (item as DefaultItem).children as T[] | undefined,
      isDisabled: item => Boolean((item as DefaultItem).disabled),
    },
  };
}

/** One node of the tree Zag walks: the consumer's item plus what the cascade needs about it. */
export interface FilterCascadeNode<T = unknown> {
  value: string;
  label: string;
  /** The consumer's item — on a parent option, the item it picks; absent on the root. */
  data?: T;
  /** The value path from the top level down to this node. */
  path: string[];
  disabled?: boolean;
  children?: FilterCascadeNode<T>[];
  /** Set on a branch whose items are still loading, so Zag treats it as one. */
  childrenCount?: number;
  /** The option that picks its level's parent — «Deployment level». */
  isParent?: boolean;
  /** In the search list: the labels of the match's ancestors, top first. */
  trail?: string[];
}

/** Where a level's lazy items stand. */
export type FilterCascadeLoadState<T> = T[] | 'loading' | { error: unknown };

export const PARENT_VALUE = '__filter-cascade-parent__';
const ROOT_VALUE = '__filter-cascade-root__';
const SEP = '\u0000';

export const pathKey = (path: string[]) => path.join(SEP);
export const fromPathKey = (key: string) => key.split(SEP);

interface BuildOptions<T> {
  source: FilterCascadeCollection<T>;
  loaded: Map<string, FilterCascadeLoadState<T>>;
  /** Adds the parent option at the top of every branch level. */
  parentLabel?: (item: T) => string;
}

/** The consumer's items as the tree Zag walks, with lazy levels and parent options folded in. */
export const buildTree = <T>({ source, loaded, parentLabel }: BuildOptions<T>) => {
  const { accessors } = source;
  const toNode = (item: T, parentPath: string[]): FilterCascadeNode<T> => {
    const value = accessors.getValue(item);
    const path = [...parentPath, value];
    const known = accessors.getChildren?.(item);
    const state = known ?? loaded.get(pathKey(path));
    const items = Array.isArray(state) ? state : undefined;
    const isBranch = Boolean(items?.length) || Boolean(accessors.hasChildren?.(item));
    const node: FilterCascadeNode<T> = {
      value,
      label: accessors.getLabel(item),
      data: item,
      path,
      disabled: accessors.isDisabled?.(item),
    };
    if (!isBranch) return node;
    const children = (items ?? []).map(child => toNode(child, path));
    if (parentLabel)
      children.unshift({
        value: PARENT_VALUE,
        label: parentLabel(item),
        // The parent's own item: the option wears its icon.
        data: item,
        path: [...path, PARENT_VALUE],
        isParent: true,
      });
    node.children = children;
    // Zag needs a count to treat a branch with nothing loaded yet as one.
    if (!items) node.childrenCount = 0;
    return node;
  };
  return source.items.map(item => toNode(item, []));
};

/** The same tree with every node — at any depth — whose label holds `query`, as one flat list. */
export const searchTree = <T>(nodes: FilterCascadeNode<T>[], query: string) => {
  const needle = query.trim().toLowerCase();
  const matches: FilterCascadeNode<T>[] = [];
  const visit = (node: FilterCascadeNode<T>, trail: string[]) => {
    if (node.isParent) return;
    if (node.label.toLowerCase().includes(needle))
      matches.push({
        ...node,
        value: pathKey(node.path),
        trail,
        children: undefined,
        childrenCount: undefined,
      });
    for (const child of node.children ?? []) visit(child, [...trail, node.label]);
  };
  for (const node of nodes) visit(node, []);
  return matches;
};

export const toZagCollection = <T>(nodes: FilterCascadeNode<T>[]) =>
  cascadeSelect.collection<FilterCascadeNode<T>>({
    rootNode: { value: ROOT_VALUE, label: '', path: [], children: nodes },
    isNodeDisabled: node => Boolean(node.disabled),
  });

/** The nodes along a value path, top level first — stops at the first value the tree lacks. */
export const pathNodes = <T>(nodes: FilterCascadeNode<T>[], values: string[]) => {
  const found: FilterCascadeNode<T>[] = [];
  let level: FilterCascadeNode<T>[] | undefined = nodes;
  for (const value of values) {
    const node: FilterCascadeNode<T> | undefined = level?.find(item => item.value === value);
    if (!node) break;
    found.push(node);
    level = node.children;
  }
  return found;
};
