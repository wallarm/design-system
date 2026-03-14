import { type FC, type RefObject, useMemo } from 'react';
import { cn } from '../../../../utils/cn';
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
  badge?: { color: string; text: string };
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
    inputRef,
    menuRef,
    blurCommitRef,
  });

  // For multi-select, ensure checked items are always visible (even when filtered out)
  // and always appear first for stable ordering.
  const displayValues = useMemo(() => {
    if (!multiSelect) return filteredValues;
    const checkedSet = new Set(checkedValues.map(String));
    if (checkedSet.size === 0) return filteredValues;
    const checkedItems = values.filter(v => checkedSet.has(String(v.value)));
    const uncheckedFiltered = filteredValues.filter(v => !checkedSet.has(String(v.value)));
    return [...checkedItems, ...uncheckedFiltered];
  }, [filteredValues, values, multiSelect, checkedValues]);

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
      <DropdownMenuContent ref={menuRef} className={cn(widthClass, className)} style={widthStyle}>
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
