import type { RefObject } from 'react';
import { type FC, Fragment, useMemo } from 'react';
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
import { getOperatorLabel, OPERATORS_BY_TYPE } from '../lib';
import type { FieldType, FilterOperator, QueryBarDropdownItem } from '../types';
import { MenuEmptyState } from './MenuEmptyState';
import { useKeyboardNav } from './useKeyboardNav';

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
  /** Text to filter operators by label */
  filterText?: string;
  /** Ref to the menu content element — shared across menus for focus management */
  menuRef?: RefObject<HTMLDivElement | null>;
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
  filterText = '',
  menuRef,
  className,
}) => {
  const operatorGroups = OPERATORS_BY_TYPE[fieldType] || [];
  const query = filterText.toLowerCase();

  const filteredGroups = useMemo(
    () =>
      query
        ? operatorGroups
            .map(group =>
              group.filter(op => getOperatorLabel(op, fieldType).toLowerCase().includes(query)),
            )
            .filter(group => group.length > 0)
        : operatorGroups,
    [operatorGroups, fieldType, query],
  );

  const flatItems: QueryBarDropdownItem[] = useMemo(
    () =>
      filteredGroups.flat().map(op => ({
        id: op,
        label: getOperatorLabel(op, fieldType),
        value: op,
      })),
    [filteredGroups, fieldType],
  );

  const { highlightedValue, onHighlightChange } = useKeyboardNav({
    items: flatItems,
    open,
    onSelect: item => onSelect(item.value as FilterOperator),
    onClose: onEscape ?? (() => onOpenChange?.(false)),
    inputRef,
    menuRef,
  });

  return (
    <DropdownMenu
      open={open}
      onOpenChange={onOpenChange}
      closeOnSelect={false}
      positioning={positioning}
      highlightedValue={highlightedValue}
      onHighlightChange={onHighlightChange}
    >
      <DropdownMenuContent ref={menuRef} className={cn('w-64', className)}>
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group, groupIdx) => (
            <Fragment key={`group-${groupIdx}`}>
              <DropdownMenuGroup>
                {group.map(operator => (
                  <DropdownMenuItem
                    key={operator}
                    value={operator}
                    onSelect={() => onSelect(operator)}
                  >
                    <DropdownMenuItemText>
                      {getOperatorLabel(operator, fieldType)}
                    </DropdownMenuItemText>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              {groupIdx < filteredGroups.length - 1 && <DropdownMenuSeparator />}
            </Fragment>
          ))
        ) : (
          <MenuEmptyState />
        )}
        <DropdownMenuFooter>
          <span className='flex items-center gap-4'>
            <KbdGroup>
              <Kbd>↵</Kbd>
            </KbdGroup>
            to select
          </span>
        </DropdownMenuFooter>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

QueryBarOperatorMenu.displayName = 'QueryBarOperatorMenu';
