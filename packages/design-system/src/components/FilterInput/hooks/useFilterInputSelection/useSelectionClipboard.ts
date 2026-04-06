import type { ClipboardEvent, RefObject } from 'react';
import { useCallback } from 'react';
import { isFilterParseError, parseExpression, serializeExpression } from '../../lib';
import type { Condition, ExprNode, FieldMetadata } from '../../types';
import { buildExpression } from '../useFilterInputExpression/expression';
import { getSelectedConditionIndices } from './dom';

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

      // If drag-selected, copy only those conditions with their original connectors
      const selectedIndices = getSelectedConditionIndices(chipRegistryRef.current);
      if (selectedIndices.length > 0) {
        const selected = selectedIndices.flatMap(i => (conditions[i] ? [conditions[i]] : []));
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
    [fields, onChange, clearSelection, setPasteError],
  );

  return { handleCopy, handlePaste };
};
