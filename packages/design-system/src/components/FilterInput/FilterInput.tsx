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
import type { ExprNode, FieldMetadata } from './types';

export interface FilterInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  fields?: FieldMetadata[];
  value?: ExprNode | null;
  onChange?: (expression: ExprNode | null) => void;
  placeholder?: string;
  error?: boolean;
  showKeyboardHint?: boolean;
}

export const FilterInput: FC<FilterInputProps> = ({
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
  const chipRegistryRef = useRef<Map<string, HTMLElement>>(new Map());

  const registerChipRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) chipRegistryRef.current.set(id, el);
    else chipRegistryRef.current.delete(id);
  }, []);

  const {
    conditions,
    connectors,
    chips,
    upsertCondition,
    removeCondition,
    removeConditionAtIndex,
    clearAll,
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
  } = useFilterInputSelection({
    conditions,
    connectors,
    fields,
    chipRegistryRef,
    inputRef,
    clearAll,
    setInputText: autocomplete.setInputText,
    closeMenu: autocomplete.closeAutocompleteMenu,
    onChange,
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
      onFocus={e => {
        autocomplete.handleFocus(e.nativeEvent);
      }}
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
