import {
  Children,
  type FC,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
  type Ref,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { TreeDepthProvider } from '../../utils/treeDepth';
import { Text } from '../Text';
import { TreeViewProvider } from './TreeViewContext';

/** Horizontal indentation added per nesting level, in pixels. */
export const TREE_VIEW_INDENT_STEP = 16;

export interface TreeViewProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
  /** Allow rows to be selected by clicking. */
  selectable?: boolean;
  /** Allow more than one row to be selected at a time. */
  multiSelect?: boolean;
  /** Controlled selected item ids. */
  selectedIds?: string[];
  /** Uncontrolled initial selected item ids. */
  defaultSelectedIds?: string[];
  /** Called whenever the selection changes. */
  onSelectionChange?: (ids: string[]) => void;
  /** Render a checkbox on every item. */
  checkboxes?: boolean;
}

export const TreeView: FC<TreeViewProps> = ({
  ref,
  children,
  selectable = false,
  multiSelect = false,
  selectedIds: controlledSelectedIds,
  defaultSelectedIds,
  onSelectionChange,
  checkboxes = false,
  'data-testid': testId,
  className,
  ...props
}) => {
  const [internalSelected, setInternalSelected] = useState<string[]>(
    () => defaultSelectedIds ?? [],
  );
  const isControlled = controlledSelectedIds !== undefined;
  const selectedList = isControlled ? controlledSelectedIds : internalSelected;

  const selectedIds = useMemo(() => new Set(selectedList), [selectedList]);

  const toggleSelect = useCallback(
    (id: string) => {
      const isSelected = selectedIds.has(id);
      let next: string[];
      if (multiSelect) {
        next = isSelected ? selectedList.filter(v => v !== id) : [...selectedList, id];
      } else {
        next = isSelected ? [] : [id];
      }
      if (!isControlled) {
        setInternalSelected(next);
      }
      onSelectionChange?.(next);
    },
    [selectedIds, selectedList, multiSelect, isControlled, onSelectionChange],
  );

  const contextValue = useMemo(
    () => ({ selectable, multiSelect, selectedIds, toggleSelect, checkboxes }),
    [selectable, multiSelect, selectedIds, toggleSelect, checkboxes],
  );

  // Show the empty state whenever no items are rendered (e.g. an empty search).
  const hasItems = Children.toArray(children).some(
    child =>
      isValidElement(child) &&
      (child.type as { displayName?: string }).displayName === 'TreeViewItem',
  );

  return (
    <TestIdProvider value={testId}>
      <TreeViewProvider value={contextValue}>
        <TreeDepthProvider value={{ depth: 0, indent: TREE_VIEW_INDENT_STEP, gap: undefined }}>
          <div
            ref={ref}
            role='tree'
            aria-multiselectable={selectable && multiSelect ? true : undefined}
            data-slot='tree-view'
            data-testid={testId}
            className={cn('flex w-full flex-col', className)}
            {...props}
          >
            {children}
            {!hasItems && (
              <div
                data-slot='tree-view-empty'
                className='flex items-center justify-center px-8 py-24'
              >
                <Text size='sm' color='secondary'>
                  No results
                </Text>
              </div>
            )}
          </div>
        </TreeDepthProvider>
      </TreeViewProvider>
    </TestIdProvider>
  );
};

TreeView.displayName = 'TreeView';
