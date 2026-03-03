import type { FC } from 'react';
import { cn } from '../../../utils/cn';
import { FilterDropdownBase } from '../base';
import type { FilterDropdownSection } from '../base/types';
import { type FieldType, type FilterOperator, getOperatorLabel, OPERATOR_SYMBOLS, OPERATORS_BY_TYPE } from '../types';

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
   * Optional custom class name
   */
  className?: string;
}

/**
 * FilterOperatorMenu component
 * Dropdown menu for selecting filter operators based on field type
 * Uses FilterDropdownBase for consistent behavior
 */
export const FilterOperatorMenu: FC<FilterOperatorMenuProps> = ({
  fieldType,
  selectedOperator,
  onSelect,
  open = false,
  onOpenChange,
  className,
}) => {
  const operatorGroups = OPERATORS_BY_TYPE[fieldType] || [];

  const showSymbols = fieldType !== 'boolean';

  // Convert operator groups to dropdown sections
  const sections: FilterDropdownSection[] = operatorGroups.map((group, index) => ({
    id: `group-${index}`,
    items: group.map(operator => ({
      id: operator,
      label: getOperatorLabel(operator, fieldType),
      value: operator,
      renderContent: showSymbols
        ? (item) => (
            <div className='flex flex-1 items-center min-w-0'>
              <div className='flex flex-1 flex-col justify-center leading-none text-sm font-normal text-text-primary min-w-0'>
                <p className='leading-5 overflow-hidden text-ellipsis'>{item.label}</p>
              </div>
              <span className='shrink-0 font-mono text-xs text-text-secondary'>
                {OPERATOR_SYMBOLS[operator]}
              </span>
            </div>
          )
        : undefined,
    })),
    // Show separator after each group except the last one
    showSeparator: index < operatorGroups.length - 1,
  }));

  const handleSelect = (item: { value: FilterOperator }) => {
    onSelect(item.value);
  };

  return (
    <FilterDropdownBase
      sections={sections}
      onSelect={handleSelect}
      open={open}
      onOpenChange={onOpenChange}
      footerHint='to select'
      className={cn('w-64', className)}
    />
  );
};

FilterOperatorMenu.displayName = 'FilterOperatorMenu';
