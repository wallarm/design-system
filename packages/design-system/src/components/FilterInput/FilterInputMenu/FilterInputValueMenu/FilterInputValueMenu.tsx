import { type FC, type RefObject, useMemo } from 'react';
import { cn } from '../../../../utils/cn';
import type { BadgeColor } from '../../../Badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuFooter,
  DropdownMenuGroup,
} from '../../../DropdownMenu';
import { Kbd } from '../../../Kbd/Kbd';
import { KbdGroup } from '../../../Kbd/KbdGroup';
import { filterAndSort } from '../../lib';
import { MenuEmptyState } from '../MenuEmptyState';
import { useValueMenuState } from './useValueMenuState';
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

  // Ensure the currently-selected value(s) are always visible and pinned at the top,
  // even when suggestions have shifted to a set that no longer includes them
  // (e.g. a concrete status code "345" when suggestions are masks). Selected values
  // missing from the current `values` list are rendered as plain-text fallbacks so
  // the user can still see and toggle them.
  const displayValues = useMemo(() => {
    const selectedSet = multiSelect
      ? new Set(checkedValues.map(String))
      : highlightValue != null
        ? new Set([String(highlightValue)])
        : new Set<string>();
    if (selectedSet.size === 0) return filteredValues;
    const selectedList: ConditionValue[] = multiSelect
      ? checkedValues
      : highlightValue != null
        ? [highlightValue]
        : [];
    const selectedItems = selectedList.map(v => {
      const match = values.find(opt => String(opt.value) === String(v));
      return match ?? { value: v, label: String(v) };
    });
    const restFiltered = filteredValues.filter(v => !selectedSet.has(String(v.value)));
    return [...selectedItems, ...restFiltered];
  }, [filteredValues, values, multiSelect, checkedValues, highlightValue]);

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
      >
        {displayValues.length > 0 ? (
          <DropdownMenuGroup>
            {displayValues.map(option => (
              <ValueMenuItem
                key={String(option.value)}
                option={option}
                isChecked={selectedValues.includes(option.value)}
                isPending={pendingIds.has(String(option.value))}
                multiSelect={multiSelect}
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
        <DropdownMenuFooter>
          {multiSelect ? (
            <>
              <span className='flex items-center gap-4'>
                <KbdGroup>
                  <Kbd>↵</Kbd>
                </KbdGroup>
                to select
              </span>
              <span className='flex items-center gap-4'>
                <KbdGroup>
                  <Kbd>⌘</Kbd>
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd>
                </KbdGroup>
                to multi-select
              </span>
            </>
          ) : (
            <>
              <span className='flex items-center gap-4'>
                <KbdGroup>
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd>
                </KbdGroup>
                to navigate
              </span>
              <span className='flex items-center gap-4'>
                <KbdGroup>
                  <Kbd>↵</Kbd>
                </KbdGroup>
                to select
              </span>
            </>
          )}
        </DropdownMenuFooter>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

FilterInputValueMenu.displayName = 'FilterInputValueMenu';
