import {
  Children,
  type FC,
  type HTMLAttributes,
  isValidElement,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useState,
} from 'react';
import { SquareMinus, SquarePlus } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { TreeDepthProvider, useTreeDepth } from '../../utils/treeDepth';
import { Badge } from '../Badge';
import { Checkbox } from '../Checkbox';
import { CheckboxIndicator } from '../Checkbox/CheckboxIndicator';
import { treeViewRowVariants } from './classes';
import { TREE_VIEW_INDENT_STEP } from './TreeView';
import { useTreeViewContext } from './TreeViewContext';

/** X position (px) of the first connector rail, measured from the row's left edge. */
const RAIL_BASE_LEFT = 14;

export interface TreeViewItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  ref?: Ref<HTMLDivElement>;
  /** Stable id used for selection. Required for a row to be selectable. */
  id?: string;
  /**
   * Row content and nested items. Compose the row freely (icon, badge, text);
   * any nested `<TreeViewItem>` children are rendered as the collapsible subtree,
   * which also marks this item as an expandable branch.
   */
  children?: ReactNode;
  /** Force branch behaviour (show a toggle) even without nested items. */
  expandable?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Numeric badge shown on the right side. */
  count?: number;
  /** Custom right-side content (rendered after `count`). */
  actions?: ReactNode;
  /** Show a checkbox for this row (overrides the tree-level `checkboxes` prop). */
  checkbox?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Visually mark the row as selected (defaults to the tree's selection state). */
  selected?: boolean;
  /** Dim the row and disable all interaction (toggle, selection, checkbox). */
  disabled?: boolean;
}

export const TreeViewItem: FC<TreeViewItemProps> = ({
  ref,
  id,
  children,
  expandable,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  count,
  actions,
  checkbox,
  checked = false,
  onCheckedChange,
  selected: selectedProp,
  disabled = false,
  className,
  onClick,
  ...props
}) => {
  const depth = useTreeDepth();
  const testId = useTestId('item');
  const { selectable, selectedIds, toggleSelect, checkboxes } = useTreeViewContext();

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  // Split children: nested <TreeViewItem>s form the subtree, the rest is row content.
  const nestedItems: ReactNode[] = [];
  const content: ReactNode[] = [];
  let labelIndex = 0;
  for (const child of Children.toArray(children)) {
    if (isValidElement(child) && child.type === TreeViewItem) {
      nestedItems.push(child);
    } else if (typeof child === 'string' || typeof child === 'number') {
      // Wrap bare text so long titles truncate while inline slots keep their size.
      labelIndex += 1;
      content.push(
        <span key={`label-${labelIndex}`} className='min-w-0 flex-1 truncate'>
          {child}
        </span>,
      );
    } else {
      content.push(child);
    }
  }

  const isBranch = expandable || nestedItems.length > 0;
  const isSelected = selectedProp ?? (id !== undefined ? selectedIds.has(id) : false);
  const showCheckbox = checkbox ?? checkboxes;
  const isInteractive = !disabled && (selectable ? id !== undefined : isBranch);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const handleToggle = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      setOpen(!isOpen);
    },
    [isOpen, setOpen],
  );

  const handleRowClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      onClick?.(event as MouseEvent<HTMLDivElement>);
      if (selectable && id !== undefined) {
        toggleSelect(id);
      } else if (isBranch) {
        setOpen(!isOpen);
      }
    },
    [onClick, selectable, id, toggleSelect, isBranch, isOpen, setOpen],
  );

  const handleRowKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (selectable && id !== undefined) {
          toggleSelect(id);
        } else if (isBranch) {
          setOpen(!isOpen);
        }
      } else if (isBranch && event.key === 'ArrowRight' && !isOpen) {
        event.preventDefault();
        setOpen(true);
      } else if (isBranch && event.key === 'ArrowLeft' && isOpen) {
        event.preventDefault();
        setOpen(false);
      }
    },
    [selectable, id, toggleSelect, isBranch, isOpen, setOpen],
  );

  const paddingLeft = depth * TREE_VIEW_INDENT_STEP;
  const hasRight = count !== undefined || actions != null;

  return (
    <div
      ref={ref}
      role='treeitem'
      aria-expanded={isBranch ? isOpen : undefined}
      aria-selected={selectable && id !== undefined && !disabled ? isSelected : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={isInteractive ? 0 : -1}
      onKeyDown={isInteractive ? handleRowKeyDown : undefined}
      data-slot='tree-view-item'
      data-testid={testId}
      {...props}
    >
      <div
        data-slot='tree-view-row'
        data-selected={isSelected || undefined}
        data-disabled={disabled || undefined}
        data-state={isBranch ? (isOpen ? 'open' : 'closed') : undefined}
        className={cn(
          treeViewRowVariants({ interactive: isInteractive, selected: isSelected, disabled }),
          className,
        )}
        onClick={isInteractive ? handleRowClick : onClick}
      >
        {/* Connector rails for each ancestor level (keyed by unique x-offset) */}
        {Array.from({ length: depth }, (_, k) => RAIL_BASE_LEFT + k * TREE_VIEW_INDENT_STEP).map(
          left => (
            <span
              key={left}
              aria-hidden
              data-slot='tree-view-rail'
              className='pointer-events-none absolute inset-y-0 w-px bg-border-primary-light'
              style={{ left }}
            />
          ),
        )}

        <div
          className='flex h-24 min-w-0 flex-1 items-center gap-4 text-xs text-text-primary [&>svg]:icon-xs [&>svg]:shrink-0 [&>svg]:text-text-secondary'
          style={{ paddingLeft }}
          data-slot='tree-view-left'
        >
          {showCheckbox && (
            <Checkbox
              checked={checked}
              disabled={disabled}
              onCheckedChange={details => onCheckedChange?.(details.checked === true)}
              onClick={event => event.stopPropagation()}
              className='shrink-0'
            >
              <CheckboxIndicator />
            </Checkbox>
          )}

          {isBranch ? (
            <button
              type='button'
              data-slot='tree-view-toggle'
              aria-label={isOpen ? 'Collapse' : 'Expand'}
              disabled={disabled}
              className='flex shrink-0 cursor-pointer items-center justify-center text-text-secondary disabled:cursor-not-allowed'
              onClick={handleToggle}
              tabIndex={-1}
            >
              {isOpen ? <SquareMinus size='xs' /> : <SquarePlus size='xs' />}
            </button>
          ) : (
            <span aria-hidden className='size-12 shrink-0' data-slot='tree-view-toggle-spacer' />
          )}

          {content}
        </div>

        {hasRight && (
          <div className='flex shrink-0 items-center gap-4' data-slot='tree-view-right'>
            {count !== undefined && (
              <Badge size='small' color='slate' type='secondary' textVariant='code'>
                {count}
              </Badge>
            )}
            {actions}
          </div>
        )}
      </div>

      {isBranch && (
        <div role='group' hidden={!isOpen} data-slot='tree-view-group'>
          <TreeDepthProvider
            value={{ depth: depth + 1, indent: TREE_VIEW_INDENT_STEP, gap: undefined }}
          >
            {nestedItems}
          </TreeDepthProvider>
        </div>
      )}
    </div>
  );
};

TreeViewItem.displayName = 'TreeViewItem';
