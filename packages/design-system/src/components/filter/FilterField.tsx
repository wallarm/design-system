import type { FC, HTMLAttributes } from 'react';
import { useMemo, useRef } from 'react';
import { cn } from '../../utils/cn';
import { FilterInputBar } from './FilterInputBar';
import { FilterMainMenu } from './FilterMainMenu';
import { FilterOperatorMenu } from './FilterOperatorMenu';
import { FilterValueMenu } from './FilterValueMenu';
import { useFilterAutocomplete } from './hooks';
import { useFilterExpression } from './hooks';
import { isMultiSelectOperator } from './lib';
import type { ExprNode, FieldMetadata, FilterChipData } from './types';

export interface FilterFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /**
   * Available fields from backend API config
   */
  fields?: FieldMetadata[];
  /**
   * Current filter expression value (controlled mode)
   */
  value?: ExprNode | null;
  /**
   * Callback when filter expression changes
   */
  onChange?: (expression: ExprNode | null) => void;
  /**
   * Placeholder text to display when field is empty
   * @default "Type to filter..."
   */
  placeholder?: string;
  /**
   * Whether the field has a validation error
   */
  error?: boolean;
  /**
   * Whether to show the keyboard hint (⌘K or Ctrl+K)
   */
  showKeyboardHint?: boolean;
}

/**
 * FilterField - Self-contained filter component.
 * Handles autocomplete flow (field → operator → value), chip creation, and expression management.
 * Supports multiple conditions joined by AND/OR connectors.
 * Just pass `fields` config from backend API and it works.
 */
export const FilterField: FC<FilterFieldProps> = ({
  fields = [],
  value,
  onChange,
  placeholder = 'Type to filter...',
  error = false,
  showKeyboardHint = false,
  className,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buildingChipRef = useRef<HTMLDivElement>(null);

  const expression = useFilterExpression({ fields, value, onChange, error });

  const autocomplete = useFilterAutocomplete({
    fields,
    conditions: expression.conditions,
    chips: expression.chips,
    upsertCondition: expression.upsertCondition,
    removeCondition: expression.removeCondition,
    removeLastCondition: expression.removeLastCondition,
    clearAll: expression.clearAll,
    toggleConnector: expression.toggleConnector,
    containerRef,
    buildingChipRef,
    inputRef,
  });

  // ── Derived display state ──────────────────────────────────

  const maxVisibleConditions = 3;
  const hasMoreChips = expression.conditions.length > maxVisibleConditions;

  const visibleChips = useMemo(() => {
    if (!hasMoreChips) return expression.chips;
    const result: FilterChipData[] = [];
    let condCount = 0;
    for (const chip of expression.chips) {
      if (chip.variant === 'chip') {
        condCount++;
        if (condCount > maxVisibleConditions) break;
      }
      result.push(chip);
    }
    return result;
  }, [expression.chips, hasMoreChips]);

  const hasChips = expression.conditions.length > 0;
  const hasContent = hasChips || autocomplete.isBuilding;

  // ── Render ─────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
      onFocus={autocomplete.handleFocus}
      onBlur={autocomplete.handleBlur}
    >
      <FilterInputBar
        chips={visibleChips}
        buildingChipData={autocomplete.buildingChipData}
        buildingChipRef={buildingChipRef}
        inputText={autocomplete.inputText}
        onInputChange={autocomplete.handleInputChange}
        onInputKeyDown={autocomplete.handleKeyDown}
        inputRef={inputRef}
        placeholder={placeholder}
        error={error}
        showKeyboardHint={showKeyboardHint}
        menuOpen={autocomplete.menuState !== 'closed'}
        onChipClick={autocomplete.handleChipClick}
        onChipRemove={autocomplete.handleChipRemove}
        onClear={autocomplete.handleClear}
        hasMoreChips={hasMoreChips}
        hasContent={hasContent}
        hasChips={hasChips}
        {...props}
      />

      {/* Dropdown menus — positioned below the input container */}
      <FilterMainMenu
        fields={fields}
        open={autocomplete.menuState === 'field'}
        onSelect={autocomplete.handleFieldSelect}
        positioning={autocomplete.menuPositioning}
      />

      {autocomplete.selectedField && (
        <FilterOperatorMenu
          fieldType={autocomplete.selectedField.type}
          open={autocomplete.menuState === 'operator'}
          onSelect={autocomplete.handleOperatorSelect}
          positioning={autocomplete.menuPositioning}
        />
      )}

      {autocomplete.selectedField && autocomplete.selectedOperator && (
        <FilterValueMenu
          values={autocomplete.selectedField.values || []}
          open={autocomplete.menuState === 'value'}
          onSelect={autocomplete.handleValueSelect}
          multiSelect={isMultiSelectOperator(autocomplete.selectedOperator)}
          selectedValues={autocomplete.multiSelectValues}
          positioning={autocomplete.menuPositioning}
        />
      )}
    </div>
  );
};

FilterField.displayName = 'FilterField';
