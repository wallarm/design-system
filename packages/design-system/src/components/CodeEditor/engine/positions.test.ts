import { Text } from '@codemirror/state';
import { describe, expect, it } from 'vitest';
import { lineNumberToDocLine, offsetToPosition, positionToOffset } from './positions';

// Offsets: "GET / HTTP/1.1" 0..14, "\n" 14, "Host: a" 15..22, "\n" 22, "" 23, "\n" 23, "{}" 24..26
const doc = Text.of(['GET / HTTP/1.1', 'Host: a', '', '{}']);

describe('offsetToPosition', () => {
  it('maps offsets to 1-based line/column with startingLineNumber 1', () => {
    expect(offsetToPosition(doc, 0, 1)).toEqual({ line: 1, column: 1 });
    expect(offsetToPosition(doc, 4, 1)).toEqual({ line: 1, column: 5 });
    expect(offsetToPosition(doc, 14, 1)).toEqual({ line: 1, column: 15 });
    expect(offsetToPosition(doc, 15, 1)).toEqual({ line: 2, column: 1 });
    expect(offsetToPosition(doc, 23, 1)).toEqual({ line: 3, column: 1 });
    expect(offsetToPosition(doc, 26, 1)).toEqual({ line: 4, column: 3 });
  });

  it('offsets line numbers by startingLineNumber', () => {
    expect(offsetToPosition(doc, 0, 10)).toEqual({ line: 10, column: 1 });
    expect(offsetToPosition(doc, 16, 10)).toEqual({ line: 11, column: 2 });
    expect(offsetToPosition(doc, 25, 10)).toEqual({ line: 13, column: 2 });
  });

  it('clamps offsets outside the document', () => {
    expect(offsetToPosition(doc, -5, 1)).toEqual({ line: 1, column: 1 });
    expect(offsetToPosition(doc, 1000, 1)).toEqual({ line: 4, column: 3 });
  });

  it('handles an empty document', () => {
    expect(offsetToPosition(Text.empty, 0, 7)).toEqual({ line: 7, column: 1 });
  });
});

describe('positionToOffset', () => {
  it('maps absolute line/column to offsets with startingLineNumber 1', () => {
    expect(positionToOffset(doc, { line: 1, column: 1 }, 1)).toBe(0);
    expect(positionToOffset(doc, { line: 2, column: 1 }, 1)).toBe(15);
    expect(positionToOffset(doc, { line: 2, column: 7 }, 1)).toBe(21);
    expect(positionToOffset(doc, { line: 4, column: 2 }, 1)).toBe(25);
  });

  it('respects startingLineNumber 10', () => {
    expect(positionToOffset(doc, { line: 10, column: 1 }, 10)).toBe(0);
    expect(positionToOffset(doc, { line: 11, column: 3 }, 10)).toBe(17);
    expect(positionToOffset(doc, { line: 13, column: 1 }, 10)).toBe(24);
  });

  it('returns null for lines outside the document', () => {
    expect(positionToOffset(doc, { line: 0, column: 1 }, 1)).toBeNull();
    expect(positionToOffset(doc, { line: 5, column: 1 }, 1)).toBeNull();
    expect(positionToOffset(doc, { line: 9, column: 1 }, 10)).toBeNull();
    expect(positionToOffset(doc, { line: 14, column: 1 }, 10)).toBeNull();
  });

  it('clamps the column to the line bounds', () => {
    expect(positionToOffset(doc, { line: 2, column: 0 }, 1)).toBe(15);
    expect(positionToOffset(doc, { line: 2, column: -3 }, 1)).toBe(15);
    expect(positionToOffset(doc, { line: 2, column: 100 }, 1)).toBe(22);
    expect(positionToOffset(doc, { line: 3, column: 5 }, 1)).toBe(23);
  });

  it('round-trips with offsetToPosition', () => {
    for (let offset = 0; offset <= doc.length; offset++) {
      const position = offsetToPosition(doc, offset, 10);
      expect(positionToOffset(doc, position, 10)).toBe(offset);
    }
  });
});

describe('lineNumberToDocLine', () => {
  it('returns the document line for an absolute line number', () => {
    const line = lineNumberToDocLine(doc, 2, 1);
    expect(line?.number).toBe(2);
    expect(line?.text).toBe('Host: a');
    expect(line?.from).toBe(15);
  });

  it('respects startingLineNumber 10', () => {
    expect(lineNumberToDocLine(doc, 10, 10)?.text).toBe('GET / HTTP/1.1');
    expect(lineNumberToDocLine(doc, 13, 10)?.text).toBe('{}');
  });

  it('returns null outside the document', () => {
    expect(lineNumberToDocLine(doc, 0, 1)).toBeNull();
    expect(lineNumberToDocLine(doc, 5, 1)).toBeNull();
    expect(lineNumberToDocLine(doc, 9, 10)).toBeNull();
    expect(lineNumberToDocLine(doc, 14, 10)).toBeNull();
    expect(lineNumberToDocLine(doc, 1.5, 1)).toBeNull();
  });
});
