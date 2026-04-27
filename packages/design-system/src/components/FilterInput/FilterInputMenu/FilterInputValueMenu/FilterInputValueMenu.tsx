import { type FC, type RefObject, useMemo } from 'react';
import { cn } from '../../../../utils/cn';
import type { BadgeColor } from '../../../Badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup } from '../../../DropdownMenu';
import { filterAndSort } from '../../lib';
import { MenuEmptyState } from '../MenuEmptyState';
import { useValueMenuDisplayValues } from './useValueMenuDisplayValues';
import { useValueMenuState } from './useValueMenuState';
import { ValueMenuFooter } from './ValueMenuFooter';
import { ValueMenuItem } from './ValueMenuItem';

export interface ValueOption {
  value: string | number | boolean;
  label: string;
  badge?: { color: BadgeColor; text: string };
  hasSubmenu?: boolean;
}

type ConditionValue = string | number | boolean;

export interface FilterInputValueMenuProps {
  values: ValueOption[];
  onSelect: (value: ValueOption['value']) => void;
  onCommit?: (values: ConditionValue[]) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  multiSelect?: boolean;
  initialValues?: ConditionValue[];
  highlightValue?: ConditionValue;
  onEscape?: () => void;
  width?: 'standard' | 'compact' | number;
  positioning?: Record<string, unknown>;
  onBuildingValueChange?: (preview: string | undefined) => void;
  /** Fires on explicit multi-select toggle (click or keyboard) — use to react
   *  only to user-initiated toggles, not to initialization. */
  onItemToggle?: () => void;
  /** Ref to the query bar input — ArrowUp on first item returns focus here */
  inputRef?: RefObject<HTMLInputElement | null>;
  /** Text to filter values by label */
  filterText?: string;
  /** Ref to the menu content element — shared across menus for focus management */
  menuRef?: RefObject<HTMLDivElement | null>;
  /** Ref set by this component to allow blur handler to commit multi-select values */
  blurCommitRef?: RefObject<(() => boolean) | null>;
  className?: string;
}

export const FilterInputValueMenu: FC<FilterInputValueMenuProps> = ({
  values,
  onSelect,
  onCommit,
  open = false,
  onOpenChange,
  onEscape,
  multiSelect = false,
  initialValues = [],
  highlightValue,
  width = 'standard',
  positioning,
  onBuildingValueChange,
  onItemToggle,
  inputRef,
  filterText = '',
  menuRef,
  blurCommitRef,
  className,
}) => {
  const filteredValues = useMemo(
    () => filterAndSort(values, filterText, v => [v.label, String(v.value)]),
    [values, filterText],
  );

  const {
    selectedValues,
    checkedValues,
    highlightedValue,
    onHighlightChange,
    pendingIds,
    registerItem,
    handleItemSelect,
  } = useValueMenuState({
    values: filteredValues,
    open,
    multiSelect,
    initialValues,
    highlightValue,
    onSelect,
    onCommit,
    onEscape,
    onOpenChange,
    onBuildingValueChange,
    onItemToggle,
    inputRef,
    menuRef,
    blurCommitRef,
  });

  const displayValues = useValueMenuDisplayValues({
    values,
    filteredValues,
    multiSelect,
    checkedValues,
    highlightValue,
  });

  const widthClass = width === 'compact' ? 'w-[172px]' : 'w-[300px]';
  const widthStyle = typeof width === 'number' ? { width: `${width}px` } : undefined;

  return (
    <DropdownMenu
      open={open}
      onOpenChange={onOpenChange}
      closeOnSelect={false}
      positioning={positioning}
      highlightedValue={highlightedValue}
      onHighlightChange={onHighlightChange}
    >
      <DropdownMenuContent
        ref={menuRef}
        className={cn(widthClass, 'max-h-[430px]', className)}
        style={widthStyle}
        data-filter-input-menu='true'
      >
        {displayValues.length > 0 ? (
          <DropdownMenuGroup>
            {displayValues.map(option => (
              <ValueMenuItem
                key={String(option.value)}
                option={option}
                // Loose match by String() — values may be strings after parser round-trip
                // (e.g. integer field with values [{value: 1, label: 'Low'}] gets
                // condition.value = ["1"] from clipboard paste). Strict `.includes` would
                // miss the match (1 !== "1") and the item would render as unchecked.
                isChecked={selectedValues.some(v => String(v) === String(option.value))}
                isPending={pendingIds.has(String(option.value))}
                multiSelect={multiSelect}
                registerItem={registerItem}
                onSelect={() =>
                  handleItemSelect({
                    id: String(option.value),
                    label: option.label,
                    value: option.value,
                  })
                }
              />
            ))}
          </DropdownMenuGroup>
        ) : (
          <MenuEmptyState />
        )}
        <ValueMenuFooter multiSelect={multiSelect} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

FilterInputValueMenu.displayName = 'FilterInputValueMenu';
