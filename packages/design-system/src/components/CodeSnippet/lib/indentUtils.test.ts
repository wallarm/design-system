import { describe, expect, it } from 'vitest';
import type { FoldRegion } from './foldUtils';
import { computeFoldGuides, leadingIndentColumn } from './indentUtils';

describe('leadingIndentColumn', () => {
  it('returns 0 for flush-left content', () => {
    expect(leadingIndentColumn('hello', 2)).toBe(0);
  });

  it('counts space-only indent', () => {
    expect(leadingIndentColumn('    x', 2)).toBe(4);
  });

  it('expands a single tab to tabSize', () => {
    expect(leadingIndentColumn('\tx', 4)).toBe(4);
  });

  it('expands tabs to the next tab-stop boundary', () => {
    expect(leadingIndentColumn(' \tx', 4)).toBe(4);
    expect(leadingIndentColumn('  \tx', 4)).toBe(4);
    expect(leadingIndentColumn('\t\tx', 4)).toBe(8);
  });

  it('mixes tabs and spaces', () => {
    expect(leadingIndentColumn('\t  x', 4)).toBe(6);
  });

  it('returns 0 when tabSize is invalid', () => {
    expect(leadingIndentColumn('    x', 0)).toBe(0);
  });
});

describe('computeFoldGuides', () => {
  const mkFold = (overrides: Partial<FoldRegion>): FoldRegion => ({
    id: 'f',
    startLine: 1,
    endLine: 3,
    ...overrides,
  });

  it('uses header indent as guide column (Python-style)', () => {
    const code = ['    def foo():', '        return 1', '        return 2'].join('\n');
    const folds = [mkFold({ id: 'foo', startLine: 1, endLine: 3 })];
    const guides = computeFoldGuides(code, folds, 1, 4);
    expect(guides.get('foo')).toEqual({ column: 4, headerIndent: 4, firstLine: 2, lastLine: 3 });
  });

  it('bumps top-level (col 0) headers to col 1 so guide stays visible', () => {
    const code = ['{', '  "a": 1,', '  "b": 2', '}'].join('\n');
    const folds = [mkFold({ id: 'obj', startLine: 1, endLine: 4 })];
    const guides = computeFoldGuides(code, folds, 1, 2);
    // Header `{` col 0 → bumped to 1; closing `}` dedents → excluded
    expect(guides.get('obj')).toEqual({ column: 1, headerIndent: 0, firstLine: 2, lastLine: 3 });
  });

  it('excludes the closing-bracket line for brace/HTML blocks', () => {
    const code = ['  <body>', '    <h1>Hi</h1>', '    <p>x</p>', '  </body>'].join('\n');
    const folds = [mkFold({ id: 'body', startLine: 1, endLine: 4 })];
    const guides = computeFoldGuides(code, folds, 1, 2);
    // Header col 2; content col 4 indented; closing col 2 dedents → excluded
    expect(guides.get('body')).toEqual({ column: 2, headerIndent: 2, firstLine: 2, lastLine: 3 });
  });

  it('keeps all rows when every content row stays deeper than the header', () => {
    const code = ['def f():', '    a = 1', '    b = 2'].join('\n');
    const folds = [mkFold({ id: 'f', startLine: 1, endLine: 3 })];
    const guides = computeFoldGuides(code, folds, 1, 4);
    // Header col 0 → bumped to 1; no dedent → lastLine = endLine
    expect(guides.get('f')).toEqual({ column: 1, headerIndent: 0, firstLine: 2, lastLine: 3 });
  });

  it('respects startingLineNumber offset', () => {
    const code = ['a', '    def f():', '        x = 1'].join('\n');
    const folds = [mkFold({ id: 'f', startLine: 101, endLine: 102 })];
    const guides = computeFoldGuides(code, folds, 100, 4);
    expect(guides.get('f')).toEqual({ column: 4, headerIndent: 4, firstLine: 102, lastLine: 102 });
  });

  it('handles multiple independent folds', () => {
    const code = [
      'class A:',
      '    def foo():',
      '        return 1',
      '    def bar():',
      '        return 2',
    ].join('\n');
    const folds = [
      mkFold({ id: 'foo', startLine: 2, endLine: 3 }),
      mkFold({ id: 'bar', startLine: 4, endLine: 5 }),
    ];
    const guides = computeFoldGuides(code, folds, 1, 4);
    expect(guides.get('foo')).toEqual({ column: 4, headerIndent: 4, firstLine: 3, lastLine: 3 });
    expect(guides.get('bar')).toEqual({ column: 4, headerIndent: 4, firstLine: 5, lastLine: 5 });
  });

  it('expands tabs for header', () => {
    const code = ['fn main() {', '\tfor x {', '\t\tdo()', '\t}', '}'].join('\n');
    const folds = [mkFold({ id: 'for', startLine: 2, endLine: 4 })];
    const guides = computeFoldGuides(code, folds, 1, 4);
    // Header `\tfor` col 4; closing `\t}` col 4 dedents to header → excluded
    expect(guides.get('for')).toEqual({ column: 4, headerIndent: 4, firstLine: 3, lastLine: 3 });
  });

  it('falls back when content is entirely blank', () => {
    const code = ['    if x:', '', ''].join('\n');
    const folds = [mkFold({ id: 'if', startLine: 1, endLine: 3 })];
    const guides = computeFoldGuides(code, folds, 1, 4);
    // No indented content — column = header indent; lastLine = header (no guide rows)
    expect(guides.get('if')).toEqual({ column: 4, headerIndent: 4, firstLine: 2, lastLine: 1 });
  });
});
