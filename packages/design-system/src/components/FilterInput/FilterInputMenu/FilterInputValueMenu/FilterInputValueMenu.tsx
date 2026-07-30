import { type FC, Fragment, type RefObject, useMemo } from 'react';
import type { CheckboxCheckedState } from '@ark-ui/react/checkbox';
import { cn } from '../../../../utils/cn';
import type { BadgeColor } from '../../../Badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from '../../../DropdownMenu';
import { buildValueMenuSections, filterAndSort } from '../../lib';
import type { ValueGroup } from '../../types';
import { MenuEmptyState } from '../MenuEmptyState';
import { useValueMenuDisplayValues } from './useValueMenuDisplayValues';
import { useValueMenuState } from './useValueMenuState';
import { ValueMenuFooter } from './ValueMenuFooter';
import { toGroupItemId, ValueMenuGroupHeader } from './ValueMenuGroupHeader';
import { ValueMenuItem } from './ValueMenuItem';
import { valueOptionSearchText } from './valueOptionSearchText';

export interface ValueOption {
  value: string | number | boolean;
  label: string;
  badge?: { color: BadgeColor; text: string };
  /** Muted secondary line rendered beneath the bold `label`. Display-only. */
  description?: string;
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
  /** Labeled sections for the value list. Omit for today's flat list. */
  valueGroups?: ValueGroup[];
  /**
   * Whether group headers are selectable (select-all). False renders them as
   * plain labels — used when the field allows no multi-select operator to switch
   * into. Ignored when `valueGroups` is absent.
   */
  groupSelectable?: boolean;
  /**
   * A group header selected while the operator is single-select: the parent
   * switches to the matching multi-select operator and commits these members.
   */
  onSelectGroup?: (values: ConditionValue[]) => void;
  initialValues?: ConditionValue[];
  highlightValue?: ConditionValue;
  onEscape?: () => void;
  width?: 'standard' | 'compact' | number;
  positioning?: Record<string, unknown>;
  onBuildingValueChange?: (preview: string | undefined) => void;
  /** Fires only on user-initiated multi-select toggle (not on init). */
  onItemToggle?: () => void;
  /** Query bar input — ArrowUp on first item returns focus here. */
  inputRef?: RefObject<HTMLInputElement | null>;
  /** Filter values by label. */
  filterText?: string;
  /** Menu content ref (shared across menus for focus management). */
  menuRef?: RefObject<HTMLDivElement | null>;
  /** Set here so blur handler can commit multi-select values. */
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
  valueGroups,
  groupSelectable = false,
  onSelectGroup,
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

  const isGrouped = !!valueGroups && valueGroups.length > 0;

  // Grouped lists bucket `filteredValues` rather than the composed
  // `displayValues`: grouping is ignored for `getSuggestions` fields, so the
  // option list can't narrow mid-session and the orphan-recovery branch of
  // `useValueMenuDisplayValues` is unreachable here. Bucketing the filtered list
  // therefore loses nothing, breaks the checkedValues → sections cycle, and
  // suppresses single-select pin-to-top so values stay inside their group.
  const sections = useMemo(
    () =>
      isGrouped
        ? buildValueMenuSections(filteredValues, valueGroups)
        : filteredValues.length > 0
          ? [{ values: filteredValues }]
          : [],
    [isGrouped, filteredValues, valueGroups],
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
    sections,
    groupSelectable: isGrouped && groupSelectable,
    open,
    multiSelect,
    initialValues,
    highlightValue,
    onSelect,
    onCommit,
    onSelectGroup,
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

  const isValueChecked = (value: ConditionValue): boolean =>
    // Loose match — values may be stringified after parser round-trip
    // (e.g. pasted "1" vs canonical 1); strict .includes would miss it.
    selectedValues.some(v => String(v) === String(value));

  /** Tri-state for a group header, derived from its currently visible members. */
  const groupCheckedState = (members: ValueOption[]): CheckboxCheckedState => {
    if (members.length === 0) return false;
    const checked = members.filter(opt => isValueChecked(opt.value)).length;
    if (checked === 0) return false;
    return checked === members.length ? true : 'indeterminate';
  };

  const renderValue = (option: ValueOption) => (
    <ValueMenuItem
      key={String(option.value)}
      option={option}
      isChecked={isValueChecked(option.value)}
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
  );

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
        {isGrouped ? (
          sections.length > 0 ? (
            sections.map((section, index) => (
              <Fragment key={section.label ?? `ungrouped-${index}`}>
                {index > 0 && <DropdownMenuSeparator />}
                {section.label && (
                  <ValueMenuGroupHeader
                    label={section.label}
                    checkedState={groupCheckedState(section.values)}
                    selectable={groupSelectable}
                    isPending={pendingIds.has(toGroupItemId(section.label))}
                    registerItem={registerItem}
                    onSelect={() =>
                      handleItemSelect({
                        id: toGroupItemId(section.label as string),
                        label: section.label as string,
                        value: {
                          kind: 'value-group',
                          label: section.label,
                          members: section.values.map(opt => opt.value),
                        },
                      })
                    }
                  />
                )}
                <DropdownMenuGroup>{section.values.map(renderValue)}</DropdownMenuGroup>
              </Fragment>
            ))
          ) : (
            <MenuEmptyState />
          )
        ) : displayValues.length > 0 ? (
          <DropdownMenuGroup>{displayValues.map(renderValue)}</DropdownMenuGroup>
        ) : (
          <MenuEmptyState />
        )}
        <ValueMenuFooter multiSelect={multiSelect} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

FilterInputValueMenu.displayName = 'FilterInputValueMenu';
