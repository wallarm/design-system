import type { RefObject } from 'react';
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
import { useKeyboardNav } from '../hooks';
import { getOperatorLabel, OPERATORS_BY_TYPE } from '../lib';
import type { FieldType, QueryBarDropdownItem, FilterOperator } from '../types';

export interface QueryBarOperatorMenuProps {
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
   * Callback when Escape is pressed (discard)
   */
  onEscape?: () => void;
  /**
   * Override positioning config for the dropdown
   */
  positioning?: Record<string, unknown>;
  /** Ref to the query bar input — ArrowUp on first item returns focus here */
  inputRef?: RefObject<HTMLInputElement | null>;
  /**
   * Optional custom class name
   */
  className?: string;
}

/**
 * QueryBarOperatorMenu component
 * Dropdown menu for selecting filter operators based on field type
 */
export const QueryBarOperatorMenu: FC<QueryBarOperatorMenuProps> = ({
  fieldType,
  onSelect,
  open = false,
  onOpenChange,
  onEscape,
  positioning,
  inputRef,
  className,
}) => {
  const operatorGroups = OPERATORS_BY_TYPE[fieldType] || [];

  const flatItems: QueryBarDropdownItem[] = useMemo(
    () =>
      operatorGroups.flat().map(op => ({
        id: op,
        label: getOperatorLabel(op, fieldType),
        value: op,
      })),
    [operatorGroups, fieldType],
  );

  const { highlightedValue, onHighlightChange } = useKeyboardNav({
    items: flatItems,
    open,
    onSelect: item => onSelect(item.value as FilterOperator),
    onClose: onEscape ?? (() => onOpenChange?.(false)),
    inputRef,
  });

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange} closeOnSelect={false} positioning={positioning} highlightedValue={highlightedValue} onHighlightChange={onHighlightChange}>
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
          <span className='flex items-center gap-4'>
            <KbdGroup><Kbd>↵</Kbd></KbdGroup>
            to select
          </span>
        </DropdownMenuFooter>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

QueryBarOperatorMenu.displayName = 'QueryBarOperatorMenu';
