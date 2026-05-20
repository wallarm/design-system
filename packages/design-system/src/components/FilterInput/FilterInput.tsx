import type { FC, HTMLAttributes } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { cn } from '../../utils/cn';
import { FilterInputProvider, useFilterInputContextValue } from './FilterInputContext';
import { FilterInputErrors, parseFilterInputErrors } from './FilterInputErrors';
import { FilterInputField } from './FilterInputField';
import { FilterInputMenu } from './FilterInputMenu/FilterInputMenu';
import {
  useFilterInputAutocomplete,
  useFilterInputExpression,
  useFilterInputSelection,
} from './hooks';
import { applyKnownFieldHelpers } from './lib/applyKnownFieldHelpers';
import type { ExprNode, FieldMetadata } from './types';

export interface FilterInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /**
   * Filter-field configurations driving the autocomplete. A few names are
   * **reserved** and auto-wired with design-system helpers — DS-supplied
   * callbacks **override** consumer values for the reserved slots, because
   * the field semantics (mask range, accepted chars, backend form) are fixed
   * by DS:
   *
   *   - `status_code` — HTTP status code field (mask suggestions, format
   *     validation, digit-or-X input filter, partial-input normalization).
   *
   * To opt out, use a different `name` and attach the factories
   * (`createStatusCodeSuggestions`, …) manually.
   */
  fields?: FieldMetadata[];
  value?: ExprNode | null;
  onChange?: (expression: ExprNode | null) => void;
  placeholder?: string;
  error?: boolean;
  showKeyboardHint?: boolean;
}

export const FilterInput: FC<FilterInputProps> = ({
  fields: rawFields = [],
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
  const chipRegistryRef = useRef<Map<string, HTMLElement>>(new Map());

  const registerChipRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) chipRegistryRef.current.set(id, el);
    else chipRegistryRef.current.delete(id);
  }, []);

  const fields = useMemo(() => applyKnownFieldHelpers(rawFields), [rawFields]);

  const {
    conditions,
    connectors,
    chips,
    upsertCondition,
    removeCondition,
    removeConditionAtIndex,
    clearAll,
    replaceExpression,
    setConnectorValue,
  } = useFilterInputExpression({ fields, value, onChange, error });

  const autocomplete = useFilterInputAutocomplete({
    fields,
    conditions,
    chips,
    upsertCondition,
    removeCondition,
    removeConditionAtIndex,
    clearAll,
    setConnectorValue,
    containerRef,
    buildingChipRef,
    inputRef,
  });

  const {
    allSelected,
    pasteError,
    clearSelection,
    dismissPasteError,
    handleMouseDown,
    handleKeyDown,
    handleCopy,
    handlePaste,
    retryParse,
  } = useFilterInputSelection({
    conditions,
    connectors,
    fields,
    containerRef,
    chipRegistryRef,
    inputRef,
    clearAll,
    setInputText: autocomplete.setInputText,
    closeMenu: autocomplete.closeAutocompleteMenu,
    replaceExpression,
    // Paste replaces the whole expression — must scrap in-progress building
    // (incl. segment inline-edit); handleMenuDiscard now preserves that state.
    resetAutocompleteState: autocomplete.resetAutocompleteState,
  });

  const contextValue = useFilterInputContextValue({
    chips,
    autocomplete,
    buildingChipRef,
    inputRef,
    placeholder,
    error,
    showKeyboardHint,
    registerChipRef,
  });

  // Dismiss paste error when expression changes (chip created/removed/cleared)
  useEffect(() => {
    if (pasteError) dismissPasteError();
  }, [conditions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-parse input text while user edits after a failed paste
  useEffect(() => {
    if (pasteError) retryParse(autocomplete.inputText);
  }, [autocomplete.inputText]); // eslint-disable-line react-hooks/exhaustive-deps

  const fieldErrors = useMemo(
    () => parseFilterInputErrors(conditions, fields),
    [conditions, fields],
  );
  const errors = useMemo(
    () => (pasteError ? [pasteError, ...fieldErrors] : fieldErrors),
    [pasteError, fieldErrors],
  );

  return (
    <div
      ref={containerRef}
      className={cn('group/filter-input relative flex w-full flex-col gap-4', className)}
      // tabIndex=-1 keeps Ctrl+A focus inside the React subtree so onCopy/onPaste
      // still fire (focusing <body> would bypass these handlers).
      tabIndex={-1}
      onFocus={autocomplete.handleFocus as unknown as React.FocusEventHandler<HTMLDivElement>}
      onBlur={autocomplete.handleBlur}
      onClick={allSelected ? clearSelection : undefined}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onCopy={handleCopy}
      onPaste={handlePaste}
      {...(allSelected && { 'data-selected-all': '' })}
    >
      <FilterInputProvider value={contextValue}>
        <FilterInputField {...props} />
      </FilterInputProvider>

      <FilterInputMenu fields={fields} autocomplete={autocomplete} />

      <FilterInputErrors errors={errors} />
    </div>
  );
};

FilterInput.displayName = 'FilterInput';
