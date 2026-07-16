import { type FC, type RefObject, useMemo } from 'react';
import { cn } from '../../../../utils/cn';
import { DropdownMenu, DropdownMenuContent, DropdownMenuFooter } from '../../../DropdownMenu';
import { Kbd } from '../../../Kbd/Kbd';
import { KbdGroup } from '../../../Kbd/KbdGroup';
import { buildFieldMenuSections } from '../../lib';
import type { Condition, FieldGroup, FieldMetadata, FilterInputDropdownItem } from '../../types';
import { useFieldMenuNavItems } from '../hooks/useFieldMenuNavItems';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { MenuEmptyState } from '../MenuEmptyState';
import {
  FieldSections,
  OperatorsSection,
  RecentSection,
  SuggestionsSection,
} from './FieldMenuSections';

export interface FilterInputFieldMenuProps {
  fields: FieldMetadata[];
  /** Text from the input to filter displayed fields */
  filterText?: string;
  onSelect: (field: FieldMetadata) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  recentConditions?: Condition[];
  suggestedFields?: FieldMetadata[];
  /** Optional grouping for the field list. When omitted, fields render flat. */
  fieldGroups?: FieldGroup[];
  onSelectAnd?: () => void;
  onSelectOr?: () => void;
  onEscape?: () => void;
  positioning?: Record<string, unknown>;
  /** Ref to the query bar input — ArrowUp on first item returns focus here */
  inputRef?: RefObject<HTMLInputElement | null>;
  /** Ref to the menu content (shared across menus for focus management). */
  menuRef?: RefObject<HTMLDivElement | null>;
  className?: string;
}

export const FilterInputFieldMenu: FC<FilterInputFieldMenuProps> = ({
  fields,
  filterText = '',
  onSelect,
  open = false,
  onOpenChange,
  recentConditions = [],
  suggestedFields = [],
  fieldGroups,
  onSelectAnd,
  onSelectOr,
  onEscape,
  positioning,
  inputRef,
  menuRef,
  className,
}) => {
  const limitedRecentConditions = useMemo(() => recentConditions.slice(0, 3), [recentConditions]);
  const showRecent = limitedRecentConditions.length > 0;
  const showSuggestions = suggestedFields.length > 0;

  const sections = useMemo(
    () => buildFieldMenuSections(fields, fieldGroups, filterText),
    [fields, fieldGroups, filterText],
  );

  const flatItems = useFieldMenuNavItems({
    sections,
    fields,
    filterText,
    limitedRecentConditions,
    showRecent,
    suggestedFields,
    showSuggestions,
    onSelectAnd,
    onSelectOr,
  });

  const handleItemSelect = (item: FilterInputDropdownItem) => {
    const data = item.value as { type: string; field?: FieldMetadata };
    if (data.type === 'recent' || data.type === 'field') {
      if (data.field) onSelect(data.field);
    } else if (data.type === 'and') {
      onSelectAnd?.();
    } else if (data.type === 'or') {
      onSelectOr?.();
    }
  };

  const { highlightedValue, onHighlightChange, registerItem } = useKeyboardNav({
    items: flatItems,
    open,
    onSelect: handleItemSelect,
    onClose: onEscape ?? (() => onOpenChange?.(false)),
    onArrowRight: () => {},
    arrowRightSelectsActive: true,
    inputRef,
    menuRef,
  });

  // Hide menu when filter text matches nothing (e.g. pasted invalid text).
  const hasResults = sections.length > 0 || !filterText;

  return (
    <DropdownMenu
      open={open && hasResults}
      onOpenChange={onOpenChange}
      closeOnSelect={false}
      positioning={positioning}
      highlightedValue={highlightedValue}
      onHighlightChange={onHighlightChange}
    >
      <DropdownMenuContent
        ref={menuRef}
        className={cn('w-[300px] max-h-[430px]', className)}
        data-slot='filter-input-field-menu'
        data-filter-input-menu='true'
      >
        {!filterText && showRecent && (
          <RecentSection
            conditions={limitedRecentConditions}
            fields={fields}
            onSelect={onSelect}
            registerItem={registerItem}
          />
        )}

        {!filterText && showSuggestions && !showRecent && (
          <SuggestionsSection
            fields={suggestedFields}
            onSelect={onSelect}
            registerItem={registerItem}
          />
        )}

        {sections.length > 0 ? (
          <FieldSections sections={sections} onSelect={onSelect} registerItem={registerItem} />
        ) : (
          <MenuEmptyState />
        )}

        {!filterText && (onSelectAnd || onSelectOr) && (
          <OperatorsSection
            onSelectAnd={onSelectAnd}
            onSelectOr={onSelectOr}
            registerItem={registerItem}
          />
        )}

        <DropdownMenuFooter>
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
        </DropdownMenuFooter>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

FilterInputFieldMenu.displayName = 'FilterInputFieldMenu';
