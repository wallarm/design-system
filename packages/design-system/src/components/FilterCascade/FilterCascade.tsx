import { type FC, type HTMLAttributes, type ReactNode, useId, useRef } from 'react';
import * as cascadeSelect from '@zag-js/cascade-select';
import { normalizeProps, useMachine } from '@zag-js/react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { FilterCascadeContext, type FilterCascadeContextValue } from './FilterCascadeContext';
import { type FilterCascadeCollection, type FilterCascadeNode, pathNodes } from './lib';

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
  disabled?: boolean;
  children?: ReactNode;
}

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
  disabled,
  className,
  children,
  'data-testid': testId,
  ...props
}) => {
  const service = useMachine(cascadeSelect.machine, {
    id: useId(),
    collection,
    value: toPaths(value),
    defaultValue: toPaths(defaultValue),
    open,
    defaultOpen,
    disabled,
    allowParentSelection,
    // Levels open as the pointer moves, like nested menus do.
    highlightTrigger: 'hover',
    positioning: { placement: 'bottom-start', gutter: 4 },
    onValueChange: details =>
      onValueChange?.({ value: details.value[0] ?? [], items: details.items[0] ?? [] }),
    onOpenChange: details => onOpenChange?.(details.open),
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
