import {
  type FC,
  type HTMLAttributes,
  type ReactNode,
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
  type FilterCascadeCollection,
  type FilterCascadeNode,
  pathNodes,
  searchTopLevel,
  topLevel,
} from './lib';

export interface FilterCascadeValueChangeDetails {
  /** The picked path, root first; `[]` once cleared. */
  value: string[];
  items: FilterCascadeNode[];
}

export interface FilterCascadeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'children'>,
    TestableProps {
  /** Attribute name: the trigger text, its aria-label, «Clear {label}». */
  label: string;
  /** From `createFilterCascadeCollection`. */
  collection: FilterCascadeCollection;
  /** Controlled path, root first; `[]` = unset. */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (details: FilterCascadeValueChangeDetails) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Whether a node that opens a level can itself be picked. On by default: a filter by
   * deployment usually also means «this deployment, any application».
   * @default true
   */
  allowParentSelection?: boolean;
  /**
   * Top-level option count from which `FilterCascadeSearch` renders.
   * @default 8
   */
  searchThreshold?: number;
  disabled?: boolean;
  children?: ReactNode;
}

const DEFAULT_SEARCH_THRESHOLD = 8;

const toPaths = (value: string[] | undefined) =>
  value === undefined ? undefined : value.length ? [value] : [];

/**
 * A filter over a hierarchy: one 36px trigger like `FilterDropdown`, and a menu whose levels open
 * side by side — pick a node at any depth, the trigger reads the path. Built on Zag's
 * cascade-select (Ark UI does not wrap it yet).
 */
export const FilterCascade: FC<FilterCascadeProps> = ({
  label,
  collection,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  allowParentSelection = true,
  searchThreshold = DEFAULT_SEARCH_THRESHOLD,
  disabled = false,
  className,
  children,
  'data-testid': testId,
  ...props
}) => {
  const [query, setQuery] = useState('');
  // Search narrows the top level only: find the deployment, then open it.
  const visible = useMemo(() => searchTopLevel(collection, query), [collection, query]);

  const id = useId();
  const service = useMachine(cascadeSelect.machine, {
    id,
    collection: visible,
    value: toPaths(value),
    defaultValue: toPaths(defaultValue),
    open,
    defaultOpen,
    disabled,
    allowParentSelection,
    // Levels open as the pointer moves, like nested menus do.
    highlightTrigger: 'hover',
    positioning: { placement: 'bottom-start', gutter: 4 },
    // Zag's own scroll brings the *deepest* highlighted item into view inside every level, so a
    // level whose item sits in the next column scrolls for nothing. Scroll each level's own item.
    scrollToIndexFn: ({ index, depth }) => {
      const content = document.getElementById(`cascade-select:${id}:content`);
      const item = [
        ...(content?.querySelectorAll<HTMLElement>(
          `[data-slot=filter-cascade-item][data-depth="${depth + 1}"]`,
        ) ?? []),
      ].find(node => node.dataset.indexPath?.split(',').at(-1) === String(index));
      item?.scrollIntoView({ block: 'nearest' });
    },
    onValueChange: details =>
      onValueChange?.({ value: details.value[0] ?? [], items: details.items[0] ?? [] }),
    onOpenChange: details => {
      // Every session starts from the full list.
      if (!details.open) setQuery('');
      onOpenChange?.(details.open);
    },
  });
  const api = cascadeSelect.connect(service, normalizeProps);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // From the value rather than `selectedItems`, which Zag leaves empty for a `defaultValue`.
  const path = pathNodes(collection, api.value[0] ?? []);
  const context: FilterCascadeContextValue = {
    api,
    label,
    path,
    clear: () => api.clearValue(),
    triggerRef,
    query,
    setQuery,
    isSearchable: topLevel(collection).length >= searchThreshold,
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
