import { type FC, useEffect, useRef, useState } from 'react';
import { cn } from '../../../utils/cn';
import { type FieldType, type FilterOperator, OPERATOR_LABELS, OPERATORS_BY_TYPE } from '../types';

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
 * Displays a dropdown menu with operators based on field type
 */
export const FilterOperatorMenu: FC<FilterOperatorMenuProps> = ({
  fieldType,
  selectedOperator,
  onSelect,
  open = false,
  onOpenChange,
  className,
}) => {
  // Get operators for the field type
  const operators = OPERATORS_BY_TYPE[fieldType] || [];

  // State for keyboard navigation - track highlighted index
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Reset highlighted index to first item when menu opens
  useEffect(() => {
    if (open) {
      setHighlightedIndex(0);
      // Focus the menu container for keyboard events
      menuRef.current?.focus();
    }
  }, [open]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (open && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [highlightedIndex, open]);

  if (!open) {
    return null;
  }

  const handleSelect = (operator: FilterOperator) => {
    onSelect(operator);
    onOpenChange?.(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % operators.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + operators.length) % operators.length);
        break;
      case 'Enter': {
        e.preventDefault();
        const selectedOp = operators[highlightedIndex];
        if (selectedOp) {
          handleSelect(selectedOp);
        }
        break;
      }
      case 'Escape':
        e.preventDefault();
        onOpenChange?.(false);
        break;
      default:
        // No action needed for other keys
        break;
    }
  };

  return (
    <div
      ref={menuRef}
      className={cn(
        'w-64',
        'bg-white border border-border-primary rounded-xl',
        'shadow-md',
        'flex flex-col gap-1 p-2',
        className,
      )}
      data-slot='filter-operator-menu'
      role='menu'
      aria-label='Filter operators'
      aria-expanded={open}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      {operators.map((operator, index) => {
        const isSelected = selectedOperator === operator;
        const isHighlighted = highlightedIndex === index;
        return (
          <button
            key={operator}
            ref={el => {
              itemRefs.current[index] = el;
            }}
            type='button'
            onClick={() => handleSelect(operator)}
            className={cn(
              'flex items-start gap-1 px-2 py-1.5',
              'rounded-md overflow-clip',
              'text-sm font-normal text-text-primary text-left',
              'bg-transparent',
              'hover:bg-gray-100',
              'transition-colors',
              isSelected && 'bg-blue-50',
              isHighlighted && 'bg-gray-100',
            )}
            role='menuitem'
            aria-selected={isSelected}
          >
            <div className='flex flex-1 gap-2 items-start min-h-[1px] min-w-[1px]'>
              <div className='flex flex-1 flex-col items-start min-h-[1px] min-w-[1px]'>
                <span className='leading-5'>{OPERATOR_LABELS[operator]}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

FilterOperatorMenu.displayName = 'FilterOperatorMenu';
