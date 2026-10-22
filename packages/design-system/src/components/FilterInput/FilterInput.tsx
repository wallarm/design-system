import type { FC, HTMLAttributes } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
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
import type { ExprNode, FieldGroup, FieldMetadata } from './types';

export interface FilterInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'>,
    TestableProps {
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
  /**
   * Optional grouping for the field-selection menu. When omitted, fields
   * render as a flat list. When provided, fields render under labeled group
   * headers (group order = array order; field order = listed order). Fields
   * not referenced by any group fall into a trailing headerless section.
   * Referenced by field `name`; unknown names are ignored.
   */
  fieldGroups?: FieldGroup[];
  value?: ExprNode | null;
  onChange?: (expression: ExprNode | null) => void;
  placeholder?: string;
  error?: boolean;
  /**
   * Field names whose values were rejected by the backend. Matching chips are
   * rendered with a value error (red). Purely presentational: conditions and
   * `onChange` output are unaffected, and the consumer is expected to render
   * its own message (e.g. an alert with the backend error text) and clear the
   * prop when the filter changes or the query succeeds.
   */
  externalErrors?: string[];
  /**
   * Notified whenever the set of validation messages FilterInput renders below
   * the input changes (empty array = no visible error). Lets a consumer avoid
   * stacking its own message (e.g. a backend-error alert) on top of one the
   * input already shows. Pass a stable (memoized) callback.
   */
  onErrorsChange?: (errors: string[]) => void;
  showKeyboardHint?: boolean;
}

export const FilterInput: FC<FilterInputProps> = ({
  fields: rawFields = [],
  fieldGroups,
  value,
  onChange,
  placeholder = 'Type to filter...',
  error = false,
  externalErrors,
  onErrorsChange,
  showKeyboardHint = false,
  className,
  'data-testid': testId,
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
  } = useFilterInputExpression({ fields, value, onChange, error, externalErrors });

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
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs only when the chip count changes, not on every pasteError/handler change
  useEffect(() => {
    if (pasteError) dismissPasteError();
  }, [conditions.length]);

  // Re-parse input text while user edits after a failed paste
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs only when the input text changes, not on every pasteError/handler change
  useEffect(() => {
    if (pasteError) retryParse(autocomplete.inputText);
  }, [autocomplete.inputText]);

  const fieldErrors = useMemo(
    () => parseFilterInputErrors(conditions, fields),
    [conditions, fields],
  );
  const errors = useMemo(
    () => (pasteError ? [pasteError, ...fieldErrors] : fieldErrors),
    [pasteError, fieldErrors],
  );

  useEffect(() => {
    onErrorsChange?.(errors);
  }, [errors, onErrorsChange]);

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
      <TestIdProvider value={testId}>
        <FilterInputProvider value={contextValue}>
          <FilterInputField {...props} data-testid={testId} />
        </FilterInputProvider>

        <FilterInputMenu fields={fields} fieldGroups={fieldGroups} autocomplete={autocomplete} />
      </TestIdProvider>

      <FilterInputErrors errors={errors} />
    </div>
  );
};

FilterInput.displayName = 'FilterInput';
