import { type FC, useMemo } from 'react';
import { cn } from '../../../../utils/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemText,
} from '../../../DropdownMenu';
import { useKeyboardNav } from '../../hooks';
import type { Condition, FieldMetadata, QueryBarDropdownItem } from '../../types';
import { MenuFooter } from '../MenuFooter';
import { OperatorsSection, RecentSection, SuggestionsSection } from './FieldMenuSections';

export interface QueryBarFieldMenuProps {
  fields: FieldMetadata[];
  onSelect: (field: FieldMetadata) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  recentConditions?: Condition[];
  suggestedFields?: FieldMetadata[];
  onSelectAnd?: () => void;
  onSelectOr?: () => void;
  onEscape?: () => void;
  positioning?: Record<string, unknown>;
  className?: string;
}

export const QueryBarFieldMenu: FC<QueryBarFieldMenuProps> = ({
  fields,
  onSelect,
  open = false,
  onOpenChange,
  recentConditions = [],
  suggestedFields = [],
  onSelectAnd,
  onSelectOr,
  onEscape,
  positioning,
  className,
}) => {
  const limitedRecentConditions = recentConditions.slice(0, 3);
  const showRecent = limitedRecentConditions.length > 0;
  const showSuggestions = suggestedFields.length > 0;

  const flatItems: QueryBarDropdownItem[] = useMemo(() => {
    const items: QueryBarDropdownItem[] = [];

    if (showRecent) {
      limitedRecentConditions.forEach((condition, index) => {
        const fieldMeta = fields.find(f => f.name === condition.field);
        items.push({
          id: `recent-${index}`,
          label: fieldMeta?.label || condition.field,
          value: { type: 'recent', field: fieldMeta },
        });
      });
    }

    if (showSuggestions && !showRecent) {
      suggestedFields.forEach((field, index) => {
        items.push({ id: `suggested-${index}`, label: field.label, value: { type: 'field', field } });
      });
    }

    fields.forEach(field => {
      items.push({ id: `field-${field.name}`, label: field.label, value: { type: 'field', field } });
    });

    if (onSelectAnd) items.push({ id: 'and', label: 'AND', value: { type: 'and' } });
    if (onSelectOr) items.push({ id: 'or', label: 'OR', value: { type: 'or' } });

    return items;
  }, [fields, limitedRecentConditions, suggestedFields, showRecent, showSuggestions, onSelectAnd, onSelectOr]);

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
  });

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange} closeOnSelect={false} positioning={positioning} highlightedValue={highlightedValue} onHighlightChange={onHighlightChange}>
      <DropdownMenuContent className={cn('w-[300px]', className)} data-slot='query-bar-field-menu'>
        {showRecent && (
          <RecentSection conditions={limitedRecentConditions} fields={fields} onSelect={onSelect} />
        )}

        {showSuggestions && !showRecent && (
          <SuggestionsSection fields={suggestedFields} onSelect={onSelect} />
        )}

        <DropdownMenuGroup>
          {fields.map(field => (
            <DropdownMenuItem key={field.name} value={`field-${field.name}`} onSelect={() => onSelect(field)}>
              <DropdownMenuItemText>{field.label}</DropdownMenuItemText>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        {(onSelectAnd || onSelectOr) && (
          <OperatorsSection onSelectAnd={onSelectAnd} onSelectOr={onSelectOr} />
        )}

        <MenuFooter />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

QueryBarFieldMenu.displayName = 'QueryBarFieldMenu';
