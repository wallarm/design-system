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
  setInputText: (text: string) => void;
  closeMenu: () => void;
  onChange?: (expression: ExprNode | null) => void;
}

/** Convert technical parse error into a user-friendly message */
const formatPasteError = (err: unknown): string => {
  if (!isFilterParseError(err)) return 'Could not parse the pasted filter text';

  const msg = err.message;

  if (msg.startsWith('Unknown field:')) {
    const field = msg.replace('Unknown field: ', '');
    return `Unknown filter field "${field}". Check the field name and try again.`;
  }

  if (msg.includes('not allowed for field')) {
    return `${msg}. Check the operator and try again.`;
  }

  if (msg.startsWith('Invalid value')) {
    return `${msg}. Check the allowed values and try again.`;
  }

  if (msg.startsWith('Expected')) {
    return `Invalid filter format: ${msg.toLowerCase()}. Expected format: (field operator value) AND (field operator value)`;
  }

  if (msg === 'Empty filter text') {
    return 'The pasted text is empty';
  }

  return `Could not parse filter: ${msg}`;
};

export const useSelectionClipboard = ({
  conditions,
  connectors,
  fields,
  chipRegistryRef,
  clearSelection,
  setPasteError,
  setInputText,
  closeMenu,
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
        setPasteError(null);
      } catch (err) {
        // Keep the pasted text visible in the input so the user can see/edit it
        setInputText(text);
        closeMenu();
        setPasteError(formatPasteError(err));
      }
    },
    [fields, onChange, clearSelection, setPasteError, setInputText, closeMenu],
  );

  return { handleCopy, handlePaste };
};
