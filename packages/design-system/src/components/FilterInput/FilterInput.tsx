import type { ClipboardEvent, FC, HTMLAttributes, KeyboardEvent, MouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { FilterInputProvider, useFilterInputContextValue } from './FilterInputContext';
import { FilterInputErrors, parseFilterInputErrors } from './FilterInputErrors';
import { FilterInputField } from './FilterInputField';
import { FilterInputMenu } from './FilterInputMenu/FilterInputMenu';
import { useFilterInputAutocomplete, useFilterInputExpression } from './hooks';
import { buildExpression } from './hooks/useFilterInputExpression/expression';
import { isFilterParseError, parseExpression, serializeExpression } from './lib';
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

const PASTE_ERROR_TIMEOUT = 5000;
const DRAG_THRESHOLD = 4;
const CHIP_SELECTOR =
  '[data-slot="filter-input-condition-chip"], [data-slot="filter-input-connector-chip"]';

/** Get all chip elements inside a container */
const getChipElements = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(CHIP_SELECTOR));

/** Check if a chip's horizontal center falls between two x-coordinates */
const isChipInRange = (chip: HTMLElement, x1: number, x2: number): boolean => {
  const rect = chip.getBoundingClientRect();
  const center = rect.left + rect.width / 2;
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  return center >= minX && center <= maxX;
};

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

  const [allSelected, setAllSelected] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);

  // Drag selection refs (refs to avoid re-renders during drag)
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);

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

  const contextValue = useFilterInputContextValue({
    chips,
    autocomplete,
    buildingChipRef,
    inputRef,
    placeholder,
    error,
    showKeyboardHint,
  });

  // ── Selection & clipboard ─────────────────────────────────

  const clearSelection = useCallback(() => {
    setAllSelected(false);
    setPasteError(null);
    // Remove per-chip highlights from drag
    if (containerRef.current) {
      for (const chip of getChipElements(containerRef.current)) {
        chip.removeAttribute('data-drag-selected');
      }
    }
  }, []);

  useEffect(() => {
    if (!pasteError) return;
    const timer = setTimeout(() => setPasteError(null), PASTE_ERROR_TIMEOUT);
    return () => clearTimeout(timer);
  }, [pasteError]);

  // ── Drag selection ────────────────────────────────────────

  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    // Only left button, ignore clicks on inputs and buttons
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('input, button, [role="combobox"]')) return;

    dragStartXRef.current = e.clientX;
    isDraggingRef.current = false;

    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const dx = Math.abs(moveEvent.clientX - dragStartXRef.current);
      if (dx < DRAG_THRESHOLD) return;

      if (!isDraggingRef.current) {
        isDraggingRef.current = true;
        // Prevent text selection during drag
        document.body.style.userSelect = 'none';
      }

      if (!containerRef.current) return;

      const chipEls = getChipElements(containerRef.current);
      let hasSelected = false;

      for (const chip of chipEls) {
        if (isChipInRange(chip, dragStartXRef.current, moveEvent.clientX)) {
          chip.setAttribute('data-drag-selected', '');
          hasSelected = true;
        } else {
          chip.removeAttribute('data-drag-selected');
        }
      }

      if (hasSelected) {
        inputRef.current?.blur();
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';

      if (!isDraggingRef.current || !containerRef.current) return;

      // Check if any chips were selected via drag
      const selected = containerRef.current.querySelectorAll('[data-drag-selected]');
      if (selected.length > 0) {
        // If all condition chips are selected, use allSelected mode
        const conditionChips = containerRef.current.querySelectorAll(
          '[data-slot="filter-input-condition-chip"]',
        );
        const selectedConditions = containerRef.current.querySelectorAll(
          '[data-slot="filter-input-condition-chip"][data-drag-selected]',
        );
        if (selectedConditions.length === conditionChips.length && conditionChips.length > 0) {
          // Remove drag attributes and switch to allSelected
          for (const chip of getChipElements(containerRef.current)) {
            chip.removeAttribute('data-drag-selected');
          }
          setAllSelected(true);
        }
        // Otherwise keep per-chip data-drag-selected for visual feedback
      }

      isDraggingRef.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const isMod = e.metaKey || e.ctrlKey;
      const hasDragSelection = !!containerRef.current?.querySelector('[data-drag-selected]');
      const hasAnySelection = allSelected || hasDragSelection;

      // Ctrl+A — select all chips
      if (isMod && e.key === 'a' && conditions.length > 0) {
        e.preventDefault();
        clearSelection();
        setAllSelected(true);
        inputRef.current?.blur();
        return;
      }

      // Delete/Backspace when selected — remove non-disabled chips
      if (hasAnySelection && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        const disabledOnly = conditions.filter(c => c.disabled);
        if (disabledOnly.length === 0) {
          onChange?.(null);
        } else {
          onChange?.(
            buildExpression(
              disabledOnly,
              disabledOnly.length > 1 ? new Array<'and'>(disabledOnly.length - 1).fill('and') : [],
            ),
          );
        }
        clearSelection();
        setAllSelected(false);
        return;
      }

      // Escape — deselect
      if (hasAnySelection && e.key === 'Escape') {
        e.preventDefault();
        clearSelection();
        setAllSelected(false);
        inputRef.current?.focus();
        return;
      }

      // Any other key while selected — deselect and let it through
      if (hasAnySelection && !isMod) {
        clearSelection();
        setAllSelected(false);
      }
    },
    [allSelected, conditions, onChange, clearSelection],
  );

  const handleCopy = useCallback(
    (e: ClipboardEvent<HTMLDivElement>) => {
      if (conditions.length === 0) return;

      e.preventDefault();
      const expr = buildExpression(conditions, connectors);
      const text = serializeExpression(expr);
      e.clipboardData.setData('text/plain', text);
    },
    [conditions, connectors],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLDivElement>) => {
      const text = e.clipboardData.getData('text/plain').trim();
      if (!text) return;

      if (!text.includes('(') && !text.includes('=') && !text.includes(' in ')) return;

      e.preventDefault();

      try {
        const expr = parseExpression(text, fields);
        onChange?.(expr);
        clearSelection();
        setAllSelected(false);
        setPasteError(null);
      } catch (err) {
        if (isFilterParseError(err)) {
          setPasteError(err.message);
        } else {
          setPasteError('Failed to parse filter text');
        }
      }
    },
    [fields, onChange, clearSelection],
  );

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
        setPasteError(null);
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
