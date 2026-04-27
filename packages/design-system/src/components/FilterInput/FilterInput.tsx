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
   * Filter-field configurations driving the autocomplete. Most fields are
   * passed through as-is, but a few names are **reserved** and auto-wired
   * with design-system helpers (`acceptChar` / `normalize` / `getSuggestions`
   * / `validate`). Current reserved names:
   *
   *   - `status_code` — HTTP status code field (mask suggestions, format
   *     validation, digit-or-X input filter, partial-input normalization).
   *
   * Consumer-supplied callbacks always override the auto-wiring, so you can
   * opt out per-field. For the same helpers on a field with a different
   * `name`, import the factories (`createStatusCodeSuggestions`, …) and
   * attach them manually.
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
    // handleMenuDiscard === resetState — wipes insertIndex / selectedField / menuState / …
    resetAutocompleteState: autocomplete.handleMenuDiscard,
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

  // ── Errors ────────────────────────────────────────────────

  const fieldErrors = useMemo(
    () => parseFilterInputErrors(conditions, fields),
    [conditions, fields],
  );
  const errors = useMemo(
    () => (pasteError ? [pasteError, ...fieldErrors] : fieldErrors),
    [pasteError, fieldErrors],
  );

  // ── Render ─────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className={cn('group/filter-input relative flex w-full flex-col gap-4', className)}
      // tabIndex=-1 lets us programmatically focus the container during select-all
      // (Ctrl+A) so copy/paste events still target a node inside the React subtree —
      // otherwise blurring the input drops focus to <body>, which is outside the
      // FilterInput's onCopy/onPaste handlers.
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
