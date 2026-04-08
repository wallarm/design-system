import { describe, expect, it, vi } from 'vitest';
import {
  buildDisplayItems,
  type DisplayItem,
  type FoldRegion,
  getFoldSummaryLabel,
  validateFolds,
} from './foldUtils';

describe('validateFolds', () => {
  it('returns valid folds sorted by startLine', () => {
    const folds: FoldRegion[] = [
      { id: 'b', startLine: 5, endLine: 8 },
      { id: 'a', startLine: 1, endLine: 3 },
    ];
    const result = validateFolds(folds, 10);

    expect(result).toEqual([
      { id: 'a', startLine: 1, endLine: 3 },
      { id: 'b', startLine: 5, endLine: 8 },
    ]);
  });

  it('filters out inverted ranges (startLine > endLine)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const folds: FoldRegion[] = [{ id: 'bad', startLine: 5, endLine: 2 }];
    const result = validateFolds(folds, 10);

    expect(result).toEqual([]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('startLine (5) > endLine (2)'));
    warn.mockRestore();
  });

  it('allows single-line folds (startLine === endLine)', () => {
    const folds: FoldRegion[] = [{ id: 'single', startLine: 3, endLine: 3 }];
    const result = validateFolds(folds, 10);

    expect(result).toEqual([{ id: 'single', startLine: 3, endLine: 3 }]);
  });

  it('filters out out-of-bounds folds', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const folds: FoldRegion[] = [
      { id: 'before', startLine: 0, endLine: 2 },
      { id: 'after', startLine: 8, endLine: 12 },
      { id: 'valid', startLine: 1, endLine: 5 },
    ];
    const result = validateFolds(folds, 10);

    expect(result).toEqual([{ id: 'valid', startLine: 1, endLine: 5 }]);
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  it('filters out overlapping folds (keeps first)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const folds: FoldRegion[] = [
      { id: 'a', startLine: 1, endLine: 5 },
      { id: 'b', startLine: 3, endLine: 7 },
    ];
    const result = validateFolds(folds, 10);

    expect(result).toEqual([{ id: 'a', startLine: 1, endLine: 5 }]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('overlaps'));
    warn.mockRestore();
  });

  it('filters out duplicate ids (keeps first)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const folds: FoldRegion[] = [
      { id: 'dup', startLine: 1, endLine: 3 },
      { id: 'dup', startLine: 5, endLine: 7 },
    ];
    const result = validateFolds(folds, 10);

    expect(result).toEqual([{ id: 'dup', startLine: 1, endLine: 3 }]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('duplicate id'));
    warn.mockRestore();
  });

  it('returns empty array for empty folds', () => {
    const result = validateFolds([], 10);
    expect(result).toEqual([]);
  });

  it('validates bounds with startingLineNumber offset', () => {
    const folds: FoldRegion[] = [{ id: 'a', startLine: 101, endLine: 105 }];
    const result = validateFolds(folds, 10, 100);
    expect(result).toHaveLength(1);
  });

  it('rejects out-of-bounds folds with startingLineNumber offset', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const folds: FoldRegion[] = [{ id: 'a', startLine: 101, endLine: 115 }];
    const result = validateFolds(folds, 10, 100);
    expect(result).toEqual([]);
    warn.mockRestore();
  });

  it('allows adjacent (non-overlapping) folds', () => {
    const folds: FoldRegion[] = [
      { id: 'a', startLine: 1, endLine: 3 },
      { id: 'b', startLine: 4, endLine: 6 },
    ];
    const result = validateFolds(folds, 10);

    expect(result).toHaveLength(2);
  });
});

describe('buildDisplayItems', () => {
  it('returns all lines when no folds', () => {
    const items = buildDisplayItems(5, [], new Set(), 1);

    expect(items).toEqual([
      { type: 'line', index: 0, lineNumber: 1 },
      { type: 'line', index: 1, lineNumber: 2 },
      { type: 'line', index: 2, lineNumber: 3 },
      { type: 'line', index: 3, lineNumber: 4 },
      { type: 'line', index: 4, lineNumber: 5 },
    ]);
  });

  it('replaces collapsed fold lines with fold-summary', () => {
    const folds: FoldRegion[] = [{ id: 'a', startLine: 2, endLine: 4 }];
    const items = buildDisplayItems(6, folds, new Set(['a']), 1);

    expect(items).toEqual([
      { type: 'line', index: 0, lineNumber: 1 },
      { type: 'fold-summary', fold: folds[0], lineCount: 3 },
      { type: 'line', index: 4, lineNumber: 5 },
      { type: 'line', index: 5, lineNumber: 6 },
    ]);
  });

  it('shows all lines for expanded folds', () => {
    const folds: FoldRegion[] = [{ id: 'a', startLine: 2, endLine: 4 }];
    const items = buildDisplayItems(6, folds, new Set(), 1);

    expect(items).toHaveLength(6);
    expect(items.every(item => item.type === 'line')).toBe(true);
  });

  it('handles multiple folds', () => {
    const folds: FoldRegion[] = [
      { id: 'a', startLine: 2, endLine: 3 },
      { id: 'b', startLine: 5, endLine: 6 },
    ];
    const collapsed = new Set(['a', 'b']);
    const items = buildDisplayItems(8, folds, collapsed, 1);

    expect(items).toEqual([
      { type: 'line', index: 0, lineNumber: 1 },
      { type: 'fold-summary', fold: folds[0], lineCount: 2 },
      { type: 'line', index: 3, lineNumber: 4 },
      { type: 'fold-summary', fold: folds[1], lineCount: 2 },
      { type: 'line', index: 6, lineNumber: 7 },
      { type: 'line', index: 7, lineNumber: 8 },
    ]);
  });

  it('handles fold at first line', () => {
    const folds: FoldRegion[] = [{ id: 'a', startLine: 1, endLine: 3 }];
    const items = buildDisplayItems(5, folds, new Set(['a']), 1);

    expect(items[0]).toEqual({ type: 'fold-summary', fold: folds[0], lineCount: 3 });
    expect(items[1]).toEqual({ type: 'line', index: 3, lineNumber: 4 });
  });

  it('handles fold at last line', () => {
    const folds: FoldRegion[] = [{ id: 'a', startLine: 4, endLine: 5 }];
    const items = buildDisplayItems(5, folds, new Set(['a']), 1);

    expect(items).toEqual([
      { type: 'line', index: 0, lineNumber: 1 },
      { type: 'line', index: 1, lineNumber: 2 },
      { type: 'line', index: 2, lineNumber: 3 },
      { type: 'fold-summary', fold: folds[0], lineCount: 2 },
    ]);
  });

  it('respects startingLineNumber offset', () => {
    const folds: FoldRegion[] = [{ id: 'a', startLine: 12, endLine: 14 }];
    const items = buildDisplayItems(5, folds, new Set(['a']), 10);

    // Lines 10-14, fold covers 12-14 (indices 2-4), so only lines 10,11 + fold summary
    expect(items).toEqual([
      { type: 'line', index: 0, lineNumber: 10 },
      { type: 'line', index: 1, lineNumber: 11 },
      { type: 'fold-summary', fold: folds[0], lineCount: 3 },
    ]);
  });

  it('reports correct lineCount in fold-summary', () => {
    const folds: FoldRegion[] = [{ id: 'a', startLine: 1, endLine: 1 }];
    const items = buildDisplayItems(3, folds, new Set(['a']), 1);

    const summary = items.find(i => i.type === 'fold-summary') as Extract<
      DisplayItem,
      { type: 'fold-summary' }
    >;
    expect(summary.lineCount).toBe(1);
  });
});

describe('getFoldSummaryLabel', () => {
  it('returns explicit label when provided', () => {
    const fold: FoldRegion = { id: 'a', startLine: 1, endLine: 5, label: 'Headers' };
    expect(getFoldSummaryLabel(fold, 5)).toBe('Headers');
  });

  it('returns auto-generated label when no label', () => {
    const fold: FoldRegion = { id: 'a', startLine: 1, endLine: 5 };
    expect(getFoldSummaryLabel(fold, 5)).toBe('5 lines');
  });

  it('returns "1 lines" for single line fold', () => {
    const fold: FoldRegion = { id: 'a', startLine: 3, endLine: 3 };
    expect(getFoldSummaryLabel(fold, 1)).toBe('1 lines');
  });
});
