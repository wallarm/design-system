import type { FC, HTMLAttributes } from 'react';
import { useRef } from 'react';
import { cn } from '../../utils/cn';
import { QueryBarProvider, useQueryBarContextValue } from './QueryBarContext';
import { QueryBarInput } from './QueryBarInput';
import { QueryBarDateValueMenu, QueryBarMainMenu, QueryBarOperatorMenu, QueryBarValueMenu } from './QueryBarMenu';
import { useQueryBarAutocomplete } from './hooks';
import { useQueryBarExpression } from './hooks';
import { isBetweenOperator, isMultiSelectOperator } from './lib';
import type { ExprNode, FieldMetadata } from './types';

export interface QueryBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
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
 * QueryBar - Self-contained filter component.
 * Handles autocomplete flow (field → operator → value), chip creation, and expression management.
 * Supports multiple conditions joined by AND/OR connectors.
 * Just pass `fields` config from backend API and it works.
 */
export const QueryBar: FC<QueryBarProps> = ({
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

  const {
    conditions,
    chips,
    upsertCondition,
    removeCondition,
    removeLastCondition,
    clearAll,
    toggleConnector,
  } = useQueryBarExpression({ fields, value, onChange, error });

  const {
    inputText,
    menuState,
    selectedField,
    selectedOperator,
    selectedValues,
    buildingChipData,
    menuPositioning,
    handleInputChange,
    handleFieldSelect,
    handleOperatorSelect,
    handleValueSelect,
    handleMenuClose,
    handleMenuDiscard,
    handleChipClick,
    handleChipRemove,
    handleClear,
    handleKeyDown,
    handleInputClick,
    handleFocus,
    handleBlur,
    handleCommitAndNewChip,
    editingDateIsAbsolute,
    handleRangeSelect,
  } = useQueryBarAutocomplete({
    fields,
    conditions,
    chips,
    upsertCondition,
    removeCondition,
    removeLastCondition,
    clearAll,
    toggleConnector,
    containerRef,
    buildingChipRef,
    inputRef,
  });

  // ── Context value ──────────────────────────────────────────

  const contextValue = useQueryBarContextValue({
    chips,
    buildingChipData,
    buildingChipRef,
    inputText,
    inputRef,
    placeholder,
    error,
    showKeyboardHint,
    menuState,
    onInputChange: handleInputChange,
    onInputKeyDown: handleKeyDown,
    onInputClick: handleInputClick,
    onChipClick: handleChipClick,
    onChipRemove: handleChipRemove,
    onClear: handleClear,
  });

  // ── Render ─────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <QueryBarProvider value={contextValue}>
        <QueryBarInput {...props} />
      </QueryBarProvider>

      {/* Dropdown menus — positioned below the input container */}
      <QueryBarMainMenu
        fields={fields}
        open={menuState === 'field'}
        onSelect={handleFieldSelect}
        onOpenChange={() => handleMenuClose()}
        onEscape={handleMenuDiscard}
        positioning={menuPositioning}
      />

      {selectedField && (
        <QueryBarOperatorMenu
          fieldType={selectedField.type}
          open={menuState === 'operator'}
          onSelect={handleOperatorSelect}
          onOpenChange={() => handleMenuClose()}
          onEscape={handleMenuDiscard}
          positioning={menuPositioning}
        />
      )}

      {selectedField && selectedOperator && (
        selectedField.type === 'date' ? (
          <QueryBarDateValueMenu
            open={menuState === 'value'}
            onSelect={handleValueSelect}
            onRangeSelect={handleRangeSelect}
            onOpenChange={() => handleMenuClose()}
            onEscape={handleMenuDiscard}
            positioning={menuPositioning}
            initialCalendar={editingDateIsAbsolute}
            range={isBetweenOperator(selectedOperator)}
            betweenLabel={
              isBetweenOperator(selectedOperator)
                ? 'Select date range'
                : undefined
            }
          />
        ) : (
          <QueryBarValueMenu
            values={selectedField.values || []}
            open={menuState === 'value'}
            onSelect={handleValueSelect}
            onOpenChange={() => handleMenuClose()}
            onEscape={handleMenuDiscard}
            multiSelect={isMultiSelectOperator(selectedOperator)}
            selectedValues={selectedValues}
            positioning={menuPositioning}
            onArrowRight={isMultiSelectOperator(selectedOperator) ? handleCommitAndNewChip : undefined}
          />
        )
      )}
    </div>
  );
};

QueryBar.displayName = 'QueryBar';
