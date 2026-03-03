import { Fragment, type FC, useMemo } from 'react';
import { cn } from '../../../utils/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuFooter,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemText,
  DropdownMenuSeparator,
} from '../../DropdownMenu';
import { Kbd } from '../../Kbd/Kbd';
import { KbdGroup } from '../../Kbd/KbdGroup';
import { useKeyboardNav } from '../base';
import type { FilterDropdownItem } from '../base/types';
import { type FieldType, type FilterOperator, getOperatorLabel, OPERATORS_BY_TYPE } from '../types';

export interface FilterOperatorMenuProps {
  /**
   * The field type to determine which operators to show
   */
  fieldType: FieldType;
  /**
   * The currently selected operator (if any)
   */
  selectedOperator?: FilterOperator;
  /**
   * Callback when an operator is selected
   */
  onSelect: (operator: FilterOperator) => void;
  /**
   * Whether the menu is open
   */
  open?: boolean;
  /**
   * Callback when open state should change
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Override positioning config for the dropdown
   */
  positioning?: Record<string, unknown>;
  /**
   * Optional custom class name
   */
  className?: string;
}

/**
 * FilterOperatorMenu component
 * Dropdown menu for selecting filter operators based on field type
 */
export const FilterOperatorMenu: FC<FilterOperatorMenuProps> = ({
  fieldType,
  onSelect,
  open = false,
  onOpenChange,
  positioning,
  className,
}) => {
  const operatorGroups = OPERATORS_BY_TYPE[fieldType] || [];

  const flatItems: FilterDropdownItem[] = useMemo(
    () =>
      operatorGroups.flat().map(op => ({
        id: op,
        label: getOperatorLabel(op, fieldType),
        value: op,
      })),
    [operatorGroups, fieldType],
  );

  const { activeIndex } = useKeyboardNav({
    items: flatItems,
    open,
    onSelect: item => onSelect(item.value as FilterOperator),
    onClose: () => onOpenChange?.(false),
  });

  const highlightedValue = flatItems[activeIndex]?.id ?? null;

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange} closeOnSelect={false} positioning={positioning} highlightedValue={highlightedValue}>
      <DropdownMenuContent className={cn('w-64', className)}>
        {operatorGroups.map((group, groupIdx) => (
          <Fragment key={`group-${groupIdx}`}>
            <DropdownMenuGroup>
              {group.map(operator => (
                <DropdownMenuItem key={operator} value={operator} onSelect={() => onSelect(operator)}>
                  <DropdownMenuItemText>
                    {getOperatorLabel(operator, fieldType)}
                  </DropdownMenuItemText>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            {groupIdx < operatorGroups.length - 1 && <DropdownMenuSeparator />}
          </Fragment>
        ))}
        <DropdownMenuFooter>
          <KbdGroup>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
          </KbdGroup>
          to navigate
          <KbdGroup><Kbd>↵</Kbd></KbdGroup>
          to select
        </DropdownMenuFooter>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

FilterOperatorMenu.displayName = 'FilterOperatorMenu';
