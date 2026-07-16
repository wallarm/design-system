import { useMemo } from 'react';
import type { FieldMenuSection } from '../../lib';
import type { Condition, FieldMetadata, FilterInputDropdownItem } from '../../types';

interface UseFieldMenuNavItemsParams {
  sections: FieldMenuSection[];
  fields: FieldMetadata[];
  filterText: string;
  limitedRecentConditions: Condition[];
  showRecent: boolean;
  suggestedFields: FieldMetadata[];
  showSuggestions: boolean;
  onSelectAnd?: () => void;
  onSelectOr?: () => void;
}

/**
 * Builds the flat, ordered list of keyboard-navigable items for the field menu:
 * recent → suggestions → grouped section fields → and → or.
 */
export const useFieldMenuNavItems = ({
  sections,
  fields,
  filterText,
  limitedRecentConditions,
  showRecent,
  suggestedFields,
  showSuggestions,
  onSelectAnd,
  onSelectOr,
}: UseFieldMenuNavItemsParams): FilterInputDropdownItem[] =>
  useMemo(() => {
    const items: FilterInputDropdownItem[] = [];

    if (!filterText && showRecent) {
      limitedRecentConditions.forEach((condition, index) => {
        const fieldMeta = fields.find(f => f.name === condition.field);
        items.push({
          id: `recent-${index}`,
          label: fieldMeta?.label || condition.field,
          value: { type: 'recent', field: fieldMeta },
        });
      });
    }

    if (!filterText && showSuggestions && !showRecent) {
      suggestedFields.forEach((field, index) => {
        items.push({
          id: `suggested-${index}`,
          label: field.label,
          value: { type: 'field', field },
        });
      });
    }

    sections.forEach(section => {
      section.fields.forEach(field => {
        items.push({
          id: `field-${field.name}`,
          label: field.label,
          value: { type: 'field', field },
        });
      });
    });

    if (!filterText && onSelectAnd) items.push({ id: 'and', label: 'AND', value: { type: 'and' } });
    if (!filterText && onSelectOr) items.push({ id: 'or', label: 'OR', value: { type: 'or' } });

    return items;
  }, [
    sections,
    fields,
    limitedRecentConditions,
    suggestedFields,
    showRecent,
    showSuggestions,
    onSelectAnd,
    onSelectOr,
    filterText,
  ]);
