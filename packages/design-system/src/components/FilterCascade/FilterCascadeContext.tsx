import { createContext, type RefObject, useContext } from 'react';
import type * as cascadeSelect from '@zag-js/cascade-select';
import type { PropTypes } from '@zag-js/react';
import type { FilterCascadeNode } from './lib';

export interface FilterCascadeContextValue {
  api: cascadeSelect.Api<PropTypes, FilterCascadeNode>;
  /** Attribute name: the trigger text, its aria-label, «Clear {label}», «Search {label}». */
  label: string;
  /** The picked path's nodes, root first; `[]` while unset. */
  path: FilterCascadeNode[];
  clear: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  /** The search query; it narrows the top level only. */
  query: string;
  setQuery: (query: string) => void;
  /** Whether the top level is long enough for `FilterCascadeSearch` to render. */
  isSearchable: boolean;
  disabled: boolean;
}

export const FilterCascadeContext = createContext<FilterCascadeContextValue | null>(null);

export const useFilterCascadeContext = (): FilterCascadeContextValue => {
  const context = useContext(FilterCascadeContext);
  if (!context) throw new Error('FilterCascade parts must be rendered inside <FilterCascade>');
  return context;
};

/** One option as a level lists it: the node and where it sits in the tree. */
export interface FilterCascadeEntry {
  node: FilterCascadeNode;
  indexPath: number[];
  /** Value path from the top level down to this node. */
  value: string[];
}

/** One open column: the node whose children it lists, and those children. */
export interface FilterCascadeLevelData extends FilterCascadeEntry {
  /** 0 for the top level. */
  depth: number;
  items: FilterCascadeEntry[];
}

export interface UseFilterCascadeResult {
  /** The open levels, top first: the top level, then one per highlighted branch. */
  levels: FilterCascadeLevelData[];
  /** The picked path's nodes, root first. */
  path: FilterCascadeNode[];
  query: string;
  /** The query narrowed the top level to nothing. */
  isEmpty: boolean;
  clear: () => void;
}

/**
 * What a custom `FilterCascadeContent` renders from: the open levels. Map them to
 * `FilterCascadeLevel`, and each level's items to `FilterCascadeItem`.
 */
export const useFilterCascade = (): UseFilterCascadeResult => {
  const { api, path, query, clear } = useFilterCascadeContext();
  const { collection } = api;

  const entriesOf = (parent: FilterCascadeEntry): FilterCascadeEntry[] =>
    collection.getNodeChildren(parent.node).map((node, index) => ({
      node,
      indexPath: [...parent.indexPath, index],
      value: [...parent.value, collection.getNodeValue(node)],
    }));

  const levels: FilterCascadeLevelData[] = [];
  let current: FilterCascadeEntry = { node: collection.rootNode, indexPath: [], value: [] };
  for (let depth = 0; ; depth++) {
    levels.push({ ...current, depth, items: entriesOf(current) });
    const state = api.getItemState({ item: current.node, ...current });
    const next = state.highlightedChild;
    if (!next || !collection.isBranchNode(next)) break;
    current = {
      node: next,
      indexPath: [...current.indexPath, state.highlightedIndex],
      value: [...current.value, collection.getNodeValue(next)],
    };
  }

  return {
    levels,
    path,
    query,
    isEmpty: query !== '' && (levels[0]?.items.length ?? 0) === 0,
    clear,
  };
};
