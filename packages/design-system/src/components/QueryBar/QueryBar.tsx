import type { FC, HTMLAttributes } from 'react';
import { useRef } from 'react';
import { cn } from '../../utils/cn';
import { QueryBarProvider, useQueryBarContextValue } from './QueryBarContext';
import { QueryBarInput } from './QueryBarInput';
import { QueryBarMenu } from './QueryBarMenu/QueryBarMenu';
import { useQueryBarAutocomplete } from './hooks';
import { useQueryBarExpression } from './hooks';
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

  const autocomplete = useQueryBarAutocomplete({
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
    buildingChipData: autocomplete.buildingChipData,
    buildingChipRef,
    inputText: autocomplete.inputText,
    inputRef,
    placeholder,
    error,
    showKeyboardHint,
    menuState: autocomplete.menuState,
    onInputChange: autocomplete.handleInputChange,
    onInputKeyDown: autocomplete.handleKeyDown,
    onInputClick: autocomplete.handleInputClick,
    onChipClick: autocomplete.handleChipClick,
    onConnectorClick: autocomplete.handleConnectorClick,
    onChipRemove: autocomplete.handleChipRemove,
    onClear: autocomplete.handleClear,
  });

  // ── Render ─────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
      onFocus={autocomplete.handleFocus}
      onBlur={autocomplete.handleBlur}
    >
      <QueryBarProvider value={contextValue}>
        <QueryBarInput {...props} />
      </QueryBarProvider>

      <QueryBarMenu
        fields={fields}
        menuState={autocomplete.menuState}
        selectedField={autocomplete.selectedField}
        selectedOperator={autocomplete.selectedOperator}
        menuPositioning={autocomplete.menuPositioning}
        editingMultiValues={autocomplete.editingMultiValues}
        editingSingleValue={autocomplete.editingSingleValue}
        editingDateIsAbsolute={autocomplete.editingDateIsAbsolute}
        onFieldSelect={autocomplete.handleFieldSelect}
        onOperatorSelect={autocomplete.handleOperatorSelect}
        onValueSelect={autocomplete.handleValueSelect}
        onMultiCommit={autocomplete.handleMultiCommit}
        onRangeSelect={autocomplete.handleRangeSelect}
        onMenuClose={autocomplete.handleMenuClose}
        onMenuDiscard={autocomplete.handleMenuDiscard}
        onBuildingValueChange={autocomplete.handleBuildingValueChange}
      />
    </div>
  );
};

QueryBar.displayName = 'QueryBar';
