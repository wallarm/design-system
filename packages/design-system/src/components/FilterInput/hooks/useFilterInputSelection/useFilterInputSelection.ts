import type { ClipboardEvent, KeyboardEvent, MouseEvent, RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isFilterParseError, parseExpression, serializeExpression } from '../../lib';
import type { Condition, ExprNode, FieldMetadata } from '../../types';
import { buildExpression } from '../useFilterInputExpression/expression';
import { DRAG_THRESHOLD, PASTE_ERROR_TIMEOUT } from './constants';
import { clearDragAttributes, hasDragSelection, isChipInRange } from './dom';

interface UseFilterInputSelectionOptions {
  conditions: Condition[];
  connectors: Array<'and' | 'or'>;
  fields: FieldMetadata[];
  chipRegistryRef: RefObject<Map<string, HTMLElement>>;
  inputRef: RefObject<HTMLInputElement | null>;
  clearAll: () => void;
  onChange?: (expression: ExprNode | null) => void;
}

export const useFilterInputSelection = ({
  conditions,
  connectors,
  fields,
  chipRegistryRef,
  inputRef,
  clearAll,
  onChange,
}: UseFilterInputSelectionOptions) => {
  const [allSelected, setAllSelected] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);

  const chips = chipRegistryRef.current;

  // ── Clear ──────────────────────────────────────────────────

  const clearSelection = useCallback(() => {
    setAllSelected(false);
    setPasteError(null);
    clearDragAttributes(chips);
  }, [chips]);

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

        let hasSelected = false;
        for (const chip of chips.values()) {
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

        if (!isDraggingRef.current) return;

        // If all condition chips (chip-*) are dragged — promote to allSelected
        let conditionCount = 0;
        let selectedCount = 0;
        for (const [id, el] of chips.entries()) {
          if (!id.startsWith('chip-')) continue;
          conditionCount++;
          if (el.hasAttribute('data-drag-selected')) selectedCount++;
        }

        if (selectedCount === conditionCount && conditionCount > 0) {
          clearDragAttributes(chips);
          setAllSelected(true);
        }

        isDraggingRef.current = false;
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [chips, inputRef],
  );

  // ── Keyboard ───────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const isMod = e.metaKey || e.ctrlKey;
      const hasSelection = allSelected || hasDragSelection(chips);

      if (isMod && e.key === 'a' && conditions.length > 0) {
        e.preventDefault();
        clearSelection();
        setAllSelected(true);
        inputRef.current?.blur();
        return;
      }

      if (hasSelection && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        clearAll();
        clearSelection();
        return;
      }

      if (hasSelection && e.key === 'Escape') {
        e.preventDefault();
        clearSelection();
        inputRef.current?.focus();
        return;
      }

      if (hasSelection && !isMod) {
        clearSelection();
      }
    },
    [allSelected, conditions.length, chips, inputRef, clearAll, clearSelection],
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
