import { type FC, type RefObject, useMemo, useRef } from 'react';
import { cn } from '../../../../utils/cn';
import type { BadgeColor } from '../../../Badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup } from '../../../DropdownMenu';
import { filterAndSort } from '../../lib';
import { MenuEmptyState } from '../MenuEmptyState';
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
  // Remember every option the menu has ever rendered, keyed by value. The helper
  // that feeds `values` may narrow its result after the user makes a selection
  // (e.g. status-code suggestions switch from [234] back to [1XX..5XX]). Keeping
  // a lookup around lets `displayValues` render the selected entry with its
  // original badge instead of a plain-text fallback.
  const optionMemoryRef = useRef<Map<string, ValueOption>>(new Map());
  for (const opt of values) {
    optionMemoryRef.current.set(String(opt.value), opt);
  }

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
      const key = String(v);
      const match = values.find(opt => String(opt.value) === key);
      if (match) return match;
      const remembered = optionMemoryRef.current.get(key);
      if (remembered) return remembered;
      return { value: v, label: key };
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
        <ValueMenuFooter multiSelect={multiSelect} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

FilterInputValueMenu.displayName = 'FilterInputValueMenu';
