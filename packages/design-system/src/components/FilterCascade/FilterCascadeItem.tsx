import {
  createContext,
  type FC,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useContext,
} from 'react';
import { Check, ChevronRight } from '../../icons';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { dropdownMenuItemVariants } from '../DropdownMenu';
import { dropdownMenuItemIndicatorClassName } from '../DropdownMenu/classes';
import { type FilterCascadeEntry, useFilterCascadeContext } from './FilterCascadeContext';

const ItemContext = createContext<FilterCascadeEntry | null>(null);

const useItem = (part: string): FilterCascadeEntry => {
  const entry = useContext(ItemContext);
  if (!entry) throw new Error(`${part} must be rendered inside <FilterCascadeItem>`);
  return entry;
};

export interface FilterCascadeItemProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** An entry of a level's `items` (or its `parentItem`) from `useFilterCascade`. */
  item: FilterCascadeEntry;
  /** Defaults to the icon, label and description the collection's accessors give. */
  children?: ReactNode;
}

/**
 * One option (Figma `_select-item`): 32px on one line, 48px with a description. Hovering a branch
 * opens its level beside this panel; clicking picks the item. The end of the row is the item's
 * own: › on a branch, ✓ on the picked option.
 */
export const FilterCascadeItem: FC<FilterCascadeItemProps> = ({
  ref,
  item,
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const { api, accessors } = useFilterCascadeContext();
  const testId = useTestId('item', testIdProp);
  const itemProps = { item: item.node, indexPath: item.indexPath, value: item.value };
  const state = api.getItemState(itemProps);
  const data = item.node.data;
  const hasIcon = data !== undefined && accessors.getIcon?.(data) != null;
  const hasDescription =
    Boolean(item.node.trail?.length) ||
    (data !== undefined && !item.node.isParent && accessors.getDescription?.(data) != null);

  return (
    <ItemContext.Provider value={item}>
      <div
        {...props}
        {...api.getItemProps(itemProps)}
        ref={ref}
        data-slot='filter-cascade-item'
        data-parent={item.node.isParent || undefined}
        data-testid={testId}
        className={cn(
          dropdownMenuItemVariants({ variant: 'default' }),
          'items-start gap-4 data-[state=checked]:bg-states-primary-active',
          className,
        )}
      >
        <span className='flex min-w-0 flex-1 items-start gap-8'>
          {children ?? (
            <>
              {hasIcon && <FilterCascadeItemIcon />}
              <span className='flex min-w-0 flex-1 flex-col'>
                <FilterCascadeItemText />
                {hasDescription && <FilterCascadeItemDescription />}
              </span>
            </>
          )}
        </span>
        <span className={cn(dropdownMenuItemIndicatorClassName, 'h-20')}>
          {state.hasChildren ? (
            <ChevronRight />
          ) : (
            <span {...api.getItemIndicatorProps(itemProps)} className='flex'>
              {state.selected && <Check />}
            </span>
          )}
        </span>
      </div>
    </ItemContext.Provider>
  );
};

FilterCascadeItem.displayName = 'FilterCascadeItem';

export interface FilterCascadeItemPartProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
}

/** The label. Defaults to the item's label; it is what typeahead and the trigger read. */
export const FilterCascadeItemText: FC<FilterCascadeItemPartProps> = ({
  className,
  children,
  ...props
}) => {
  const { api } = useFilterCascadeContext();
  const item = useItem('FilterCascadeItemText');
  return (
    <span
      {...props}
      {...api.getItemTextProps({ item: item.node, indexPath: item.indexPath, value: item.value })}
      data-slot='filter-cascade-item-text'
      className={cn('truncate', className)}
    >
      {children ?? item.node.label}
    </span>
  );
};

FilterCascadeItemText.displayName = 'FilterCascadeItemText';

/**
 * The second line. Defaults to the accessors' description; in the search list, to where the match
 * sits — «Production US › checkout».
 */
export const FilterCascadeItemDescription: FC<FilterCascadeItemPartProps> = ({
  className,
  children,
  ...props
}) => {
  const { accessors } = useFilterCascadeContext();
  const item = useItem('FilterCascadeItemDescription');
  const data = item.node.data;
  const fallback = item.node.trail?.length
    ? item.node.trail.join(' › ')
    : data === undefined
      ? null
      : accessors.getDescription?.(data);

  return (
    <span
      {...props}
      data-slot='filter-cascade-item-description'
      className={cn('truncate text-xs text-text-secondary', className)}
    >
      {children ?? fallback}
    </span>
  );
};

FilterCascadeItemDescription.displayName = 'FilterCascadeItemDescription';

/** Before the label, level with its first line (a 16px slot). Defaults to the accessors' icon. */
export const FilterCascadeItemIcon: FC<FilterCascadeItemPartProps> = ({
  className,
  children,
  ...props
}) => {
  const { accessors } = useFilterCascadeContext();
  const item = useItem('FilterCascadeItemIcon');
  const data = item.node.data;
  return (
    <span
      {...props}
      data-slot='filter-cascade-item-icon'
      className={cn('flex h-20 w-16 shrink-0 items-center justify-center', className)}
    >
      {children ?? (data === undefined ? null : accessors.getIcon?.(data))}
    </span>
  );
};

FilterCascadeItemIcon.displayName = 'FilterCascadeItemIcon';
