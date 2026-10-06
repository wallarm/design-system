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
  /** An entry of `level.items` from `useFilterCascade`. */
  item: FilterCascadeEntry;
  /** Defaults to the node's icon, label and description. */
  children?: ReactNode;
}

/**
 * One option. Hovering a branch opens its level beside this one; clicking picks the node. The
 * end of the row is the item's own: › on a branch, ✓ on the picked leaf.
 */
export const FilterCascadeItem: FC<FilterCascadeItemProps> = ({
  ref,
  item,
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => {
  const { api } = useFilterCascadeContext();
  const testId = useTestId('item', testIdProp);
  const itemProps = { item: item.node, indexPath: item.indexPath, value: item.value };
  const state = api.getItemState(itemProps);

  return (
    <ItemContext.Provider value={item}>
      <div
        {...props}
        {...api.getItemProps(itemProps)}
        ref={ref}
        data-slot='filter-cascade-item'
        data-testid={testId}
        className={cn(
          dropdownMenuItemVariants({ variant: 'default' }),
          'items-start data-[state=checked]:bg-states-primary-active',
          className,
        )}
      >
        {children ?? (
          <>
            {item.node.icon && <FilterCascadeItemIcon />}
            <span className='flex min-w-0 flex-1 flex-col'>
              <FilterCascadeItemText />
              {item.node.description && <FilterCascadeItemDescription />}
            </span>
          </>
        )}
        <span className={cn(dropdownMenuItemIndicatorClassName, 'h-20')}>
          {state.hasChildren ? (
            <ChevronRight className='text-icon-secondary' />
          ) : (
            <span {...api.getItemIndicatorProps(itemProps)}>{state.selected && <Check />}</span>
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

/** The label. Defaults to the node's `label`; it is what typeahead and the trigger read. */
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

/** The second line. Defaults to the node's `description`. */
export const FilterCascadeItemDescription: FC<FilterCascadeItemPartProps> = ({
  className,
  children,
  ...props
}) => {
  const item = useItem('FilterCascadeItemDescription');
  return (
    <span
      {...props}
      data-slot='filter-cascade-item-description'
      className={cn('text-xs text-text-secondary', className)}
    >
      {children ?? item.node.description}
    </span>
  );
};

FilterCascadeItemDescription.displayName = 'FilterCascadeItemDescription';

/** Before the label, level with its first line. Defaults to the node's `icon`. */
export const FilterCascadeItemIcon: FC<FilterCascadeItemPartProps> = ({
  className,
  children,
  ...props
}) => {
  const item = useItem('FilterCascadeItemIcon');
  return (
    <span
      {...props}
      data-slot='filter-cascade-item-icon'
      className={cn('flex h-20 shrink-0 items-center', className)}
    >
      {children ?? item.node.icon}
    </span>
  );
};

FilterCascadeItemIcon.displayName = 'FilterCascadeItemIcon';
