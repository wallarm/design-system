import type { ClipboardEvent, KeyboardEvent, MouseEvent, RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isFilterParseError, parseExpression, serializeExpression } from '../../lib';
import type { Condition, ExprNode, FieldMetadata } from '../../types';
import { buildExpression } from '../useFilterInputExpression/expression';
import { CHIP_ID_PREFIX, DRAG_THRESHOLD, PASTE_ERROR_TIMEOUT } from './constants';
import {
  clearDragAttributes,
  getSelectedConditionIndices,
  hasDragSelection,
  isChipInRange,
} from './dom';

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

  // ── Clear ──────────────────────────────────────────────────

  const clearSelection = useCallback(() => {
    setAllSelected(false);
    setPasteError(null);
    clearDragAttributes(chipRegistryRef.current);
  }, [chipRegistryRef]);

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

        const registry = chipRegistryRef.current;
        const hasSelected = [...registry.values()].reduce((found, chip) => {
          const inRange = isChipInRange(chip, dragStartXRef.current, moveEvent.clientX);
          if (inRange) chip.setAttribute('data-drag-selected', '');
          else chip.removeAttribute('data-drag-selected');
          return found || inRange;
        }, false);

        if (hasSelected) inputRef.current?.blur();
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';

        if (!isDraggingRef.current) return;

        const registry = chipRegistryRef.current;

        // If all condition chips are dragged — promote to allSelected
        const conditionEntries = [...registry.entries()].filter(([id]) =>
          id.startsWith(CHIP_ID_PREFIX),
        );
        const allDragged =
          conditionEntries.length > 0 &&
          conditionEntries.every(([, el]) => el.hasAttribute('data-drag-selected'));

        if (allDragged) {
          clearDragAttributes(registry);
          setAllSelected(true);
        }

        isDraggingRef.current = false;
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [chipRegistryRef, inputRef],
  );

  // ── Keyboard ───────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const isMod = e.metaKey || e.ctrlKey;
      const hasSelection = allSelected || hasDragSelection(chipRegistryRef.current);

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
    [allSelected, conditions.length, chipRegistryRef, inputRef, clearAll, clearSelection],
  );

  // ── Clipboard ──────────────────────────────────────────────

  const handleCopy = useCallback(
    (e: ClipboardEvent<HTMLDivElement>) => {
      if (conditions.length === 0) return;
      e.preventDefault();

      // If drag-selected, copy only those conditions with their original connectors
      const selectedIndices = getSelectedConditionIndices(chipRegistryRef.current);
      if (selectedIndices.length > 0) {
        const selected = selectedIndices.flatMap(i => (conditions[i] ? [conditions[i]] : []));
        // Preserve connectors between consecutive selected indices
        // connectors[n] is the connector between condition[n] and condition[n+1]
        const selectedConnectors = selectedIndices
          .slice(1)
          .map((_, i) => connectors[selectedIndices[i]!] ?? 'and');
        const text = serializeExpression(buildExpression(selected, selectedConnectors));
        e.clipboardData.setData('text/plain', text);
        return;
      }

      // allSelected or no drag selection — copy all
      const text = serializeExpression(buildExpression(conditions, connectors));
      e.clipboardData.setData('text/plain', text);
    },
    [conditions, connectors, chipRegistryRef],
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
