import { type FC, useMemo } from 'react';
import { CirclePlus } from '../../icons/CirclePlus';
import { CircleSlash } from '../../icons/CircleSlash';
import { cn } from '../../utils/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuFooter,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemText,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../DropdownMenu';
import { Kbd } from '../Kbd/Kbd';
import { KbdGroup } from '../Kbd/KbdGroup';
import { useKeyboardNav } from './hooks';
import type { Condition, FieldMetadata, QueryBarDropdownItem } from './types';

export interface QueryBarMainMenuProps {
  /**
   * Array of available fields to display
   */
  fields: FieldMetadata[];
  /**
   * Callback when a field is selected
   */
  onSelect: (field: FieldMetadata) => void;
  /**
   * Whether the menu is open
   */
  open?: boolean;
  /**
   * Callback when open state should change
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Optional array of recently used conditions (max 3)
   * Displayed as "Attribute operator Value" format
   */
  recentConditions?: Condition[];
  /**
   * Optional array of suggested commonly used fields
   */
  suggestedFields?: FieldMetadata[];
  /**
   * Callback when AND operator is selected
   */
  onSelectAnd?: () => void;
  /**
   * Callback when OR operator is selected
   */
  onSelectOr?: () => void;
  /**
   * Callback when Escape is pressed (discard)
   */
  onEscape?: () => void;
  /**
   * Override positioning config for the dropdown
   */
  positioning?: Record<string, unknown>;
  /**
   * Optional custom class name
   */
  className?: string;
}

/**
 * QueryBarMainMenu component
 * Displays a dropdown menu with available filter fields, recent conditions, and AND/OR operators
 */
export const QueryBarMainMenu: FC<QueryBarMainMenuProps> = ({
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

  // Build flat items for keyboard navigation
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
        items.push({
          id: `suggested-${index}`,
          label: field.label,
          value: { type: 'field', field },
        });
      });
    }

    fields.forEach(field => {
      items.push({
        id: `field-${field.name}`,
        label: field.label,
        value: { type: 'field', field },
      });
    });

    if (onSelectAnd) {
      items.push({ id: 'and', label: 'AND', value: { type: 'and' } });
    }
    if (onSelectOr) {
      items.push({ id: 'or', label: 'OR', value: { type: 'or' } });
    }

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
      <DropdownMenuContent className={cn('w-[300px]', className)} data-slot='query-bar-main-menu'>
        {/* Recent conditions */}
        {showRecent && (
          <>
            <DropdownMenuLabel>Recent</DropdownMenuLabel>
            <DropdownMenuGroup>
              {limitedRecentConditions.map((condition, index) => {
                const fieldMeta = fields.find(f => f.name === condition.field);
                const attribute = fieldMeta?.label || condition.field;
                const operator = String(condition.operator);
                const value = String(condition.value);

                return (
                  <DropdownMenuItem
                    key={`recent-${index}`}
                    value={`recent-${index}`}
                    onSelect={() => {
                      if (fieldMeta) onSelect(fieldMeta);
                    }}
                  >
                    <span className='flex gap-2 items-center text-sm'>
                      <span className='text-text-primary'>{attribute}</span>
                      <span className='text-text-secondary'>{operator}</span>
                      <span className='font-medium text-text-info'>{value}</span>
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Suggested fields */}
        {showSuggestions && !showRecent && (
          <>
            <DropdownMenuLabel>Suggestions</DropdownMenuLabel>
            <DropdownMenuGroup>
              {suggestedFields.map((field, index) => (
                <DropdownMenuItem
                  key={`suggested-${index}`}
                  value={`suggested-${index}`}
                  onSelect={() => onSelect(field)}
                >
                  <span className='flex gap-2 items-center text-sm'>
                    <span className='text-text-primary'>{field.label}</span>
                    <span className='text-text-secondary'>operator</span>
                    <span className='font-medium text-text-info'>Value</span>
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {/* All fields */}
        <DropdownMenuGroup>
          {fields.map(field => (
            <DropdownMenuItem
              key={field.name}
              value={`field-${field.name}`}
              onSelect={() => onSelect(field)}
            >
              <DropdownMenuItemText>{field.label}</DropdownMenuItemText>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        {/* AND/OR operators */}
        {(onSelectAnd || onSelectOr) && (
          <>
            <DropdownMenuSeparator />
            {onSelectAnd && (
              <DropdownMenuItem
                value='and'
                onSelect={() => onSelectAnd()}
              >
                <DropdownMenuItemIcon>
                  <CirclePlus />
                </DropdownMenuItemIcon>
                <DropdownMenuItemText>AND</DropdownMenuItemText>
              </DropdownMenuItem>
            )}
            {onSelectOr && (
              <DropdownMenuItem
                value='or'
                onSelect={() => onSelectOr()}
              >
                <DropdownMenuItemIcon>
                  <CircleSlash />
                </DropdownMenuItemIcon>
                <DropdownMenuItemText>OR</DropdownMenuItemText>
              </DropdownMenuItem>
            )}
          </>
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
            <KbdGroup><Kbd>↵</Kbd></KbdGroup>
            to select
          </span>
        </DropdownMenuFooter>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

QueryBarMainMenu.displayName = 'QueryBarMainMenu';
