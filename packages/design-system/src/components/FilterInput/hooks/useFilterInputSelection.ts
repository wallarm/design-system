import type { ClipboardEvent, KeyboardEvent, MouseEvent, RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isFilterParseError, parseExpression, serializeExpression } from '../lib';
import type { Condition, ExprNode, FieldMetadata } from '../types';
import { buildExpression } from './useFilterInputExpression/expression';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PASTE_ERROR_TIMEOUT = 5000;
const DRAG_THRESHOLD = 4;
const CHIP_SELECTOR =
  '[data-slot="filter-input-condition-chip"], [data-slot="filter-input-connector-chip"]';

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

const getChipElements = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(CHIP_SELECTOR));

const isChipInRange = (chip: HTMLElement, x1: number, x2: number): boolean => {
  const rect = chip.getBoundingClientRect();
  const center = rect.left + rect.width / 2;
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  return center >= minX && center <= maxX;
};

const clearDragAttributes = (container: HTMLElement) => {
  for (const chip of getChipElements(container)) {
    chip.removeAttribute('data-drag-selected');
  }
};

const hasDragSelection = (container: HTMLElement | null): boolean =>
  !!container?.querySelector('[data-drag-selected]');

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

interface UseFilterInputSelectionOptions {
  conditions: Condition[];
  connectors: Array<'and' | 'or'>;
  fields: FieldMetadata[];
  containerRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  clearAll: () => void;
  onChange?: (expression: ExprNode | null) => void;
}

export const useFilterInputSelection = ({
  conditions,
  connectors,
  fields,
  containerRef,
  inputRef,
  clearAll,
  onChange,
}: UseFilterInputSelectionOptions) => {
  const [allSelected, setAllSelected] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);

  // ── Clear ──────────────────────────────────────────────────

  const clearSelection = useCallback(() => {
    setAllSelected(false);
    setPasteError(null);
    if (containerRef.current) clearDragAttributes(containerRef.current);
  }, [containerRef]);

  // Auto-clear paste error
  useEffect(() => {
    if (!pasteError) return;
    const timer = setTimeout(() => setPasteError(null), PASTE_ERROR_TIMEOUT);
    return () => clearTimeout(timer);
  }, [pasteError]);

  // ── Drag selection ─────────────────────────────────────────

  const handleMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest('input, button, [role="combobox"]')) return;

      dragStartXRef.current = e.clientX;
      isDraggingRef.current = false;

      const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
        if (Math.abs(moveEvent.clientX - dragStartXRef.current) < DRAG_THRESHOLD) return;

        if (!isDraggingRef.current) {
          isDraggingRef.current = true;
          document.body.style.userSelect = 'none';
        }

        if (!containerRef.current) return;

        let hasSelected = false;
        for (const chip of getChipElements(containerRef.current)) {
          if (isChipInRange(chip, dragStartXRef.current, moveEvent.clientX)) {
            chip.setAttribute('data-drag-selected', '');
            hasSelected = true;
          } else {
            chip.removeAttribute('data-drag-selected');
          }
        }

        if (hasSelected) inputRef.current?.blur();
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';

        if (!isDraggingRef.current || !containerRef.current) return;

        // If all condition chips are dragged — promote to allSelected mode
        const all = containerRef.current.querySelectorAll(
          '[data-slot="filter-input-condition-chip"]',
        );
        const selected = containerRef.current.querySelectorAll(
          '[data-slot="filter-input-condition-chip"][data-drag-selected]',
        );

        if (selected.length === all.length && all.length > 0) {
          clearDragAttributes(containerRef.current);
          setAllSelected(true);
        }

        isDraggingRef.current = false;
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [containerRef, inputRef],
  );

  // ── Keyboard ───────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const isMod = e.metaKey || e.ctrlKey;
      const hasSelection = allSelected || hasDragSelection(containerRef.current);

      // Ctrl+A — select all
      if (isMod && e.key === 'a' && conditions.length > 0) {
        e.preventDefault();
        clearSelection();
        setAllSelected(true);
        inputRef.current?.blur();
        return;
      }

      // Delete/Backspace — remove selected (non-disabled)
      if (hasSelection && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        clearAll();
        clearSelection();
        return;
      }

      // Escape — deselect
      if (hasSelection && e.key === 'Escape') {
        e.preventDefault();
        clearSelection();
        inputRef.current?.focus();
        return;
      }

      // Any other key — deselect
      if (hasSelection && !isMod) {
        clearSelection();
      }
    },
    [allSelected, conditions.length, containerRef, inputRef, clearAll, clearSelection],
  );

  // ── Clipboard ──────────────────────────────────────────────

  const handleCopy = useCallback(
    (e: ClipboardEvent<HTMLDivElement>) => {
      if (conditions.length === 0) return;
      e.preventDefault();
      const text = serializeExpression(buildExpression(conditions, connectors));
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
      } catch (err) {
        setPasteError(isFilterParseError(err) ? err.message : 'Failed to parse filter text');
      }
    },
    [fields, onChange, clearSelection],
  );

  return {
    allSelected,
    pasteError,
    clearSelection,
    handleMouseDown,
    handleKeyDown,
    handleCopy,
    handlePaste,
  };
};
