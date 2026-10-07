import { createContext, type ReactNode, type RefObject, useContext } from 'react';
import type * as cascadeSelect from '@zag-js/cascade-select';
import type { PropTypes } from '@zag-js/react';
import type { FilterCascadeAccessors, FilterCascadeLoadState, FilterCascadeNode } from './lib';

export interface FilterCascadeContextValue {
  api: cascadeSelect.Api<PropTypes, FilterCascadeNode<unknown>>;
  accessors: FilterCascadeAccessors<unknown>;
  /** Attribute name: the trigger text, its aria-label, «Clear {label}», «Search {label}». */
  label: string;
  /** The picked path's nodes, top level first; `[]` while unset. */
  path: FilterCascadeNode<unknown>[];
  clear: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  query: string;
  setQuery: (query: string) => void;
  /** Whether the top level is long enough for `FilterCascadeSearch` to render. */
  isSearchable: boolean;
  /** The search is showing every match as one list. */
  isFlat: boolean;
  loadState: (node: FilterCascadeNode<unknown>) => FilterCascadeLoadState<unknown> | undefined;
  retry: (node: FilterCascadeNode<unknown>) => void;
  disabled: boolean;
}

export const FilterCascadeContext = createContext<FilterCascadeContextValue | null>(null);

export const useFilterCascadeContext = (): FilterCascadeContextValue => {
  const context = useContext(FilterCascadeContext);
  if (!context) throw new Error('FilterCascade parts must be rendered inside <FilterCascade>');
  return context;
};

/** What `FilterCascadeContent` pins into the top-level panel: the search above, sections below. */
export interface PanelSlots {
  header: ReactNode[];
  footer: ReactNode[];
}

export const PanelSlotsContext = createContext<PanelSlots>({ header: [], footer: [] });

/** One option as a level lists it: the node and where it sits in the tree. */
export interface FilterCascadeEntry<T = unknown> {
  node: FilterCascadeNode<T>;
  indexPath: number[];
  /** Zag's value path down to this node. */
  value: string[];
}

/** One open level: the node whose children it lists, and those children. */
export interface FilterCascadeLevelData<T = unknown> extends FilterCascadeEntry<T> {
  /** 0 for the top level. */
  depth: number;
  /** The level's options, without the parent option. */
  items: FilterCascadeEntry<T>[];
  /** The option that picks the level's parent — present when the root has `parentLabel`. */
  parentItem?: FilterCascadeEntry<T>;
  /** Lazy items still on their way, or the error they failed with. */
  status: 'ready' | 'loading' | 'error';
}

export interface UseFilterCascadeResult<T = unknown> {
  /** The open levels, top first: the top level, then one per highlighted branch. */
  levels: FilterCascadeLevelData<T>[];
  /** The picked path's nodes, top level first. */
  path: FilterCascadeNode<T>[];
  query: string;
  /** The search is showing every match as one list (the only level). */
  isSearchList: boolean;
  /** The search matched nothing. */
  isEmpty: boolean;
  clear: () => void;
}

/**
 * What custom levels render from: the open levels, top first. `FilterCascadeLevels` maps them for
 * you; reach for this to render something around them.
 */
export const useFilterCascade = <T = unknown>(): UseFilterCascadeResult<T> => {
  const { api, path, query, clear, isFlat, loadState } = useFilterCascadeContext();
  const { collection } = api;

  const entriesOf = (parent: FilterCascadeEntry<unknown>): FilterCascadeEntry<unknown>[] =>
    collection.getNodeChildren(parent.node).map((node, index) => ({
      node,
      indexPath: [...parent.indexPath, index],
      value: [...parent.value, collection.getNodeValue(node)],
    }));

  const levels: FilterCascadeLevelData<unknown>[] = [];
  let current: FilterCascadeEntry<unknown> = {
    node: collection.rootNode,
    indexPath: [],
    value: [],
  };
  for (let depth = 0; ; depth++) {
    const entries = entriesOf(current);
    const state = depth === 0 ? undefined : loadState(current.node);
    levels.push({
      ...current,
      depth,
      items: entries.filter(entry => !entry.node.isParent),
      parentItem: entries.find(entry => entry.node.isParent),
      status: state === 'loading' ? 'loading' : state && !Array.isArray(state) ? 'error' : 'ready',
    });
    const itemState = api.getItemState({ item: current.node, ...current });
    const next = itemState.highlightedChild;
    if (!next || !collection.isBranchNode(next)) break;
    current = {
      node: next,
      indexPath: [...current.indexPath, itemState.highlightedIndex],
      value: [...current.value, collection.getNodeValue(next)],
    };
  }

  return {
    levels: levels as FilterCascadeLevelData<T>[],
    path: path as FilterCascadeNode<T>[],
    query,
    isSearchList: isFlat,
    isEmpty: query.trim() !== '' && (levels[0]?.items.length ?? 0) === 0,
    clear,
  };
};
