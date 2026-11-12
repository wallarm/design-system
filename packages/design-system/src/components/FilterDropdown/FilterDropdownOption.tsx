import { type ComponentProps, type ReactNode, type Ref, useContext } from 'react';
import type { CollectionItem } from '@ark-ui/react/collection';
import { useTestId } from '../../utils/testId';
import { SelectOption } from '../Select/SelectOption';
import { SelectOptionHint } from '../Select/SelectOptionHint';
import { SelectOptionIndicator } from '../Select/SelectOptionIndicator';
import { SelectOptionText } from '../Select/SelectOptionText';
import { FilterDropdownAliasContext, useFilterDropdownContext } from './FilterDropdownContext';

export interface FilterDropdownOptionProps<T extends CollectionItem = CollectionItem>
  extends Omit<ComponentProps<typeof SelectOption>, 'item' | 'children'> {
  ref?: Ref<HTMLDivElement>;
  item: T;
  /** Secondary text at the right end of the row, such as a count. */
  hint?: ReactNode;
  /**
   * Leading element before the text, such as an agent's 16 px `AgentGlyph`. It keeps its own size:
   * the row does not resize it.
   */
  icon?: ReactNode;
  /** Row text. Defaults to the item's label from the collection. */
  children?: ReactNode;
}

/**
 * One value of the filter: an optional leading `icon`, a check (single) or a checkbox (multi) on
 * the right, optional `hint` before it. Inside `FilterDropdownSelected` the same markup renders
 * the row's "Selected" copy.
 */
export const FilterDropdownOption = <T extends CollectionItem>({
  item,
  hint,
  icon,
  children,
  'data-testid': testIdProp,
  ...props
}: FilterDropdownOptionProps<T>) => {
  const { collection } = useFilterDropdownContext();
  const alias = useContext(FilterDropdownAliasContext);
  const value = collection.getItemValue(item);
  const isCopy = alias?.source !== undefined && collection.getItemValue(alias.source) === value;
  const copyTestId = useTestId('selected-option');
  const text = <SelectOptionText>{children ?? collection.stringifyItem(item)}</SelectOptionText>;

  return (
    <SelectOption
      {...props}
      item={isCopy && alias ? alias : item}
      data-slot='filter-dropdown-option'
      data-testid={testIdProp ?? (isCopy ? copyTestId : undefined)}
    >
      {icon === undefined || icon === null ? (
        text
      ) : (
        // One flex item, so a long label wraps beside the icon instead of dropping under it.
        <span className='flex min-w-0 items-center gap-8'>
          {icon}
          {text}
        </span>
      )}
      {hint !== undefined && hint !== null && <SelectOptionHint>{hint}</SelectOptionHint>}
      <SelectOptionIndicator />
    </SelectOption>
  );
};

FilterDropdownOption.displayName = 'FilterDropdownOption';
