import type { Line, Text } from '@codemirror/state';
import type { CodeEditorPosition } from '../types';

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * Converts a document offset into an absolute (startingLineNumber-based) line and 1-based column.
 * Offsets outside the document are clamped to its bounds.
 */
export const offsetToPosition = (
  doc: Text,
  offset: number,
  startingLineNumber: number,
): CodeEditorPosition => {
  const safeOffset = clamp(offset, 0, doc.length);
  const line = doc.lineAt(safeOffset);
  return {
    line: line.number + startingLineNumber - 1,
    column: safeOffset - line.from + 1,
  };
};

/**
 * Returns the document line for an absolute (startingLineNumber-based) line number,
 * or `null` when it is outside the document.
 */
export const lineNumberToDocLine = (
  doc: Text,
  absoluteLine: number,
  startingLineNumber: number,
): Line | null => {
  const docLineNumber = absoluteLine - startingLineNumber + 1;
  if (!Number.isInteger(docLineNumber) || docLineNumber < 1 || docLineNumber > doc.lines) {
    return null;
  }
  return doc.line(docLineNumber);
};

/**
 * Converts an absolute line + 1-based column into a document offset.
 * Returns `null` when the line is outside the document; the column is clamped to
 * `[1, line.length + 1]` (column `line.length + 1` is the end of the line). A non-finite
 * column (`NaN`, `±Infinity`) is treated as column 1 so a bad value can never yield `NaN`.
 */
export const positionToOffset = (
  doc: Text,
  position: CodeEditorPosition,
  startingLineNumber: number,
): number | null => {
  const line = lineNumberToDocLine(doc, position.line, startingLineNumber);
  if (!line) return null;
  const raw = Number.isFinite(position.column) ? Math.floor(position.column) : 1;
  const column = clamp(raw, 1, line.length + 1);
  return line.from + column - 1;
};
