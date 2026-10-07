import {
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as cascadeSelect from '@zag-js/cascade-select';
import { normalizeProps, useMachine } from '@zag-js/react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { FilterCascadeContext, type FilterCascadeContextValue } from './FilterCascadeContext';
import {
  buildTree,
  type FilterCascadeCollection,
  type FilterCascadeLoadState,
  type FilterCascadeNode,
  fromPathKey,
  PARENT_VALUE,
  pathKey,
  pathNodes,
  searchTree,
  toZagCollection,
} from './lib';

export interface FilterCascadeValueChangeDetails<T = unknown> {
  /** The picked path, top level first; `[]` once cleared. */
  value: string[];
  /** The consumer's items along the path. */
  items: T[];
}

export interface FilterCascadeProps<T = unknown>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'children'>,
    TestableProps {
  /** Attribute name: the trigger text, its aria-label, «Clear {label}», «Search {label}». */
  label: string;
  /** From `createFilterCascadeCollection`. */
  collection: FilterCascadeCollection<T>;
  /** Controlled path, top level first; `[]` = unset. */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (details: FilterCascadeValueChangeDetails<T>) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Loads the next level of an item the collection marks with `hasChildren` — when the item is
   * first highlighted, or when it is on the picked path.
   */
  loadChildren?: (item: T, path: string[]) => Promise<T[]>;
  /**
   * Puts an option at the top of every next level that picks the item which opened it —
   * «Deployment level». With it, a row that opens a level only opens it; without it, the row
   * itself is picked.
   */
  parentLabel?: string | ((item: T) => string);
  /**
   * What the search matches: every loaded level, as one list with each match's path (`'all'`),
   * or the top level only, its levels still opening beside it (`'top'`).
   * @default 'all'
   */
  searchIn?: 'all' | 'top';
  /**
   * Top-level option count from which `FilterCascadeSearch` renders.
   * @default 8
   */
  searchThreshold?: number;
  disabled?: boolean;
  children?: ReactNode;
}

const DEFAULT_SEARCH_THRESHOLD = 8;
const EMPTY: string[] = [];

/**
 * A filter over a hierarchy: the 36px pill of `FilterDropdown`, and a menu whose levels open beside
 * each other, each its own panel — pick an item at any depth, the trigger reads the path. Built on
 * Zag's cascade-select (Ark UI does not wrap it yet).
 */
export const FilterCascade = <T,>({
  label,
  collection,
  value: valueProp,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  loadChildren,
  parentLabel,
  searchIn = 'all',
  searchThreshold = DEFAULT_SEARCH_THRESHOLD,
  disabled = false,
  className,
  children,
  'data-testid': testId,
  ...props
}: FilterCascadeProps<T>) => {
  const [valueState, setValueState] = useState<string[]>(defaultValue ?? EMPTY);
  const value = valueProp ?? valueState;
  const [query, setQuery] = useState('');
  const [loaded, setLoaded] = useState(() => new Map<string, FilterCascadeLoadState<T>>());

  const hasParentOption = parentLabel !== undefined;
  const tree = useMemo(
    () =>
      buildTree({
        source: collection,
        loaded,
        parentLabel:
          parentLabel === undefined
            ? undefined
            : typeof parentLabel === 'string'
              ? () => parentLabel
              : parentLabel,
      }),
    [collection, loaded, parentLabel],
  );

  const isSearching = query.trim() !== '';
  const flat = isSearching && searchIn === 'all';
  const visible = useMemo(() => {
    if (!isSearching) return tree;
    if (flat) return searchTree(tree, query);
    const needle = query.trim().toLowerCase();
    return tree.filter(node => node.label.toLowerCase().includes(needle));
  }, [tree, query, isSearching, flat]);
  const zagCollection = useMemo(() => toZagCollection(visible), [visible]);

  const path = pathNodes(tree, value);
  // Zag's view of the value: the parent option stands for a picked branch; a search list holds
  // whole paths as single values.
  const zagValue = flat
    ? visible.some(node => node.value === pathKey(value))
      ? [[pathKey(value)]]
      : []
    : value.length === 0
      ? []
      : hasParentOption && path.at(-1)?.children
        ? [[...value, PARENT_VALUE]]
        : [value];

  /** `force` re-runs a load that failed — Retry. */
  const load = (node: FilterCascadeNode<T>, force = false) => {
    const key = pathKey(node.path);
    if (!loadChildren || node.data === undefined || (loaded.has(key) && !force)) return;
    const set = (state: FilterCascadeLoadState<T>) =>
      setLoaded(current => new Map(current).set(key, state));
    set('loading');
    loadChildren(node.data, node.path).then(set, (error: unknown) => set({ error }));
  };
  const loadRef = useRef(load);
  loadRef.current = load;

  // A picked path that runs through lazy levels loads them, so the trigger can name every segment.
  useEffect(() => {
    let level = tree;
    for (const segment of value) {
      const node = level.find(item => item.value === segment);
      if (!node) return;
      if (node.childrenCount === 0) {
        loadRef.current(node);
        return;
      }
      level = node.children ?? [];
    }
  }, [tree, value]);

  const pick = (next: string[]) => {
    setValueState(next);
    setQuery('');
    onValueChange?.({
      value: next,
      items: pathNodes(tree, next).flatMap(node => (node.data === undefined ? [] : [node.data])),
    });
  };

  const id = useId();
  const service = useMachine(cascadeSelect.machine, {
    id,
    collection: zagCollection,
    value: zagValue,
    open,
    defaultOpen,
    disabled,
    // With a parent option a row that opens a level only opens it.
    allowParentSelection: !hasParentOption,
    highlightTrigger: 'hover',
    positioning: { placement: 'bottom-start', gutter: 4 },
    // Zag's own scroll brings the *deepest* highlighted item into view inside every level, so a
    // level whose item sits in the next panel scrolls for nothing. Scroll each level's own item.
    scrollToIndexFn: ({ index, depth }) => {
      const content = document.getElementById(`cascade-select:${id}:content`);
      const item = [
        ...(content?.querySelectorAll<HTMLElement>(
          `[data-slot=filter-cascade-item][data-depth="${depth + 1}"]`,
        ) ?? []),
      ].find(node => node.dataset.indexPath?.split(',').at(-1) === String(index));
      item?.scrollIntoView({ block: 'nearest' });
    },
    onHighlightChange: details => {
      const node = details.highlightedItems.at(-1);
      if (node?.childrenCount === 0) loadRef.current(node);
    },
    onValueChange: details => {
      const picked = details.value[0] ?? [];
      if (flat) pick(picked[0] ? fromPathKey(picked[0]) : []);
      else pick(picked.at(-1) === PARENT_VALUE ? picked.slice(0, -1) : picked);
    },
    onOpenChange: details => {
      // Every session starts from the full list.
      if (!details.open) setQuery('');
      onOpenChange?.(details.open);
    },
  });
  const api = cascadeSelect.connect(service, normalizeProps);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const context: FilterCascadeContextValue = {
    api,
    accessors: collection.accessors as FilterCascadeContextValue['accessors'],
    label,
    path,
    clear: () => pick(EMPTY),
    triggerRef,
    query,
    setQuery,
    isSearchable: collection.items.length >= searchThreshold,
    isFlat: flat,
    loadState: node => loaded.get(pathKey(node.path)),
    retry: node => load(node as FilterCascadeNode<T>, true),
    disabled,
  };

  return (
    <FilterCascadeContext.Provider value={context}>
      <TestIdProvider value={testId}>
        <div
          {...props}
          {...api.getRootProps()}
          data-slot='filter-cascade'
          data-testid={testId}
          className={cn('inline-flex min-w-0', className)}
        >
          {children}
        </div>
      </TestIdProvider>
    </FilterCascadeContext.Provider>
  );
};

FilterCascade.displayName = 'FilterCascade';
