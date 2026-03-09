import type { RefObject } from 'react';
import { type FC, useMemo } from 'react';
import { cn } from '../../../../utils/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuFooter,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemText,
} from '../../../DropdownMenu';
import { Kbd } from '../../../Kbd/Kbd';
import { KbdGroup } from '../../../Kbd/KbdGroup';
import type { Condition, FieldMetadata, QueryBarDropdownItem } from '../../types';
import { MenuEmptyState } from '../MenuEmptyState';
import { useKeyboardNav } from '../useKeyboardNav';
import { OperatorsSection, RecentSection, SuggestionsSection } from './FieldMenuSections';

export interface QueryBarFieldMenuProps {
  fields: FieldMetadata[];
  /** Text from the input to filter displayed fields */
  filterText?: string;
  onSelect: (field: FieldMetadata) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  recentConditions?: Condition[];
  suggestedFields?: FieldMetadata[];
  onSelectAnd?: () => void;
  onSelectOr?: () => void;
  onEscape?: () => void;
  positioning?: Record<string, unknown>;
  /** Ref to the query bar input — ArrowUp on first item returns focus here */
  inputRef?: RefObject<HTMLInputElement | null>;
  /** Ref to the menu content element — shared across menus for focus management */
  menuRef?: RefObject<HTMLDivElement | null>;
  className?: string;
}

export const QueryBarFieldMenu: FC<QueryBarFieldMenuProps> = ({
  fields,
  filterText = '',
  onSelect,
  open = false,
  onOpenChange,
  recentConditions = [],
  suggestedFields = [],
  onSelectAnd,
  onSelectOr,
  onEscape,
  positioning,
  inputRef,
  menuRef,
  className,
}) => {
  const limitedRecentConditions = recentConditions.slice(0, 3);
  const showRecent = limitedRecentConditions.length > 0;
  const showSuggestions = suggestedFields.length > 0;
  const query = filterText.toLowerCase();

  const filteredFields = useMemo(() => {
    if (!query) return fields;
    const matches = fields.filter(
      f => f.label.toLowerCase().includes(query) || f.name.toLowerCase().includes(query),
    );
    // Sort: startsWith first (label or name), then includes
    return matches.sort((a, b) => {
      const aStarts =
        a.label.toLowerCase().startsWith(query) || a.name.toLowerCase().startsWith(query);
      const bStarts =
        b.label.toLowerCase().startsWith(query) || b.name.toLowerCase().startsWith(query);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });
  }, [fields, query]);

  const flatItems: QueryBarDropdownItem[] = useMemo(() => {
    const items: QueryBarDropdownItem[] = [];

    if (!query && showRecent) {
      limitedRecentConditions.forEach((condition, index) => {
        const fieldMeta = fields.find(f => f.name === condition.field);
        items.push({
          id: `recent-${index}`,
          label: fieldMeta?.label || condition.field,
          value: { type: 'recent', field: fieldMeta },
        });
      });
    }

    if (!query && showSuggestions && !showRecent) {
      suggestedFields.forEach((field, index) => {
        items.push({
          id: `suggested-${index}`,
          label: field.label,
          value: { type: 'field', field },
        });
      });
    }

    filteredFields.forEach(field => {
      items.push({
        id: `field-${field.name}`,
        label: field.label,
        value: { type: 'field', field },
      });
    });

    if (!query && onSelectAnd) items.push({ id: 'and', label: 'AND', value: { type: 'and' } });
    if (!query && onSelectOr) items.push({ id: 'or', label: 'OR', value: { type: 'or' } });

    return items;
  }, [
    filteredFields,
    fields,
    limitedRecentConditions,
    suggestedFields,
    showRecent,
    showSuggestions,
    onSelectAnd,
    onSelectOr,
    query,
  ]);

  const handleItemSelect = (item: QueryBarDropdownItem) => {
    const data = item.value as { type: string; field?: FieldMetadata };
    if (data.type === 'recent' || data.type === 'field') {
      if (data.field) onSelect(data.field);
    } else if (data.type === 'and') {
      onSelectAnd?.();
    } else if (data.type === 'or') {
      onSelectOr?.();
    }
  };

  const { highlightedValue, onHighlightChange } = useKeyboardNav({
    items: flatItems,
    open,
    onSelect: handleItemSelect,
    onClose: onEscape ?? (() => onOpenChange?.(false)),
    onArrowRight: () => {},
    arrowRightSelectsActive: true,
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
      <DropdownMenuContent
        ref={menuRef}
        className={cn('w-[300px]', className)}
        data-slot='query-bar-field-menu'
      >
        {!query && showRecent && (
          <RecentSection conditions={limitedRecentConditions} fields={fields} onSelect={onSelect} />
        )}

        {!query && showSuggestions && !showRecent && (
          <SuggestionsSection fields={suggestedFields} onSelect={onSelect} />
        )}

        {filteredFields.length > 0 ? (
          <DropdownMenuGroup>
            {filteredFields.map(field => (
              <DropdownMenuItem
                key={field.name}
                value={`field-${field.name}`}
                onSelect={() => onSelect(field)}
              >
                <DropdownMenuItemText>{field.label}</DropdownMenuItemText>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ) : (
          <MenuEmptyState />
        )}

        {!query && (onSelectAnd || onSelectOr) && (
          <OperatorsSection onSelectAnd={onSelectAnd} onSelectOr={onSelectOr} />
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

QueryBarFieldMenu.displayName = 'QueryBarFieldMenu';
