import { type FC, useMemo } from 'react';
import { cn } from '../../../../utils/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuFooter,
  DropdownMenuGroup,
} from '../../../DropdownMenu';
import { filterAndSort } from '../../lib';
import { MenuEmptyState } from '../MenuEmptyState';
import type { FilterInputValueMenuProps } from './FilterInputValueMenu';
import { useValueMenuDisplayValues } from './useValueMenuDisplayValues';
import { useValueMenuState } from './useValueMenuState';
import { ValueMenuFooterHints } from './ValueMenuFooterHints';
import { ValueMenuItem } from './ValueMenuItem';
import { valueOptionSearchText } from './valueOptionSearchText';

/**
 * Flat (non-nested) value menu — the original single-list implementation.
 * Rendered by `FilterInputValueMenu` for fields whose values have no groups or
 * sections. Behavior is unchanged from before nesting was introduced.
 */
export const FlatValueMenu: FC<FilterInputValueMenuProps> = ({
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
    () => filterAndSort(values, filterText, valueOptionSearchText),
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
                // Loose match — values may be stringified after parser round-trip
                // (e.g. pasted "1" vs canonical 1); strict .includes would miss it.
                isChecked={selectedValues.some(v => String(v) === String(option.value))}
                isPending={pendingIds.has(String(option.value))}
                multiSelect={multiSelect}
                registerItem={registerItem}
                onSelect={() =>
                  handleItemSelect({
                    id: String(option.value),
                    label: option.label,
                    value: option.value as string | number | boolean,
                  })
                }
              />
            ))}
          </DropdownMenuGroup>
        ) : (
          <MenuEmptyState />
        )}
        <DropdownMenuFooter>
          <ValueMenuFooterHints multiSelect={multiSelect} />
        </DropdownMenuFooter>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

FlatValueMenu.displayName = 'FlatValueMenu';
