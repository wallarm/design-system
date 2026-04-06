import type { ClipboardEvent, RefObject } from 'react';
import { useCallback } from 'react';
import { isFilterParseError, parseExpression } from '../../lib';
import type { Condition, ExprNode, FieldMetadata } from '../../types';
import { serializeSelectedOrAll } from './serialize';

interface UseSelectionClipboardOptions {
  conditions: Condition[];
  connectors: Array<'and' | 'or'>;
  fields: FieldMetadata[];
  chipRegistryRef: RefObject<Map<string, HTMLElement>>;
  clearSelection: () => void;
  setPasteError: (error: string | null) => void;
  onChange?: (expression: ExprNode | null) => void;
}

export const useSelectionClipboard = ({
  conditions,
  connectors,
  fields,
  chipRegistryRef,
  clearSelection,
  setPasteError,
  onChange,
}: UseSelectionClipboardOptions) => {
  const handleCopy = useCallback(
    (e: ClipboardEvent<HTMLDivElement>) => {
      if (conditions.length === 0) return;
      e.preventDefault();
      const text = serializeSelectedOrAll(conditions, connectors, chipRegistryRef.current);
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
    [fields, onChange, clearSelection, setPasteError],
  );

  return { handleCopy, handlePaste };
};
