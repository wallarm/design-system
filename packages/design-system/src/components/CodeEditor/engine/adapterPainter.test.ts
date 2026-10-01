import { EditorState, Text } from '@codemirror/state';
import { type DecorationSet, EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { plainAdapter } from '../../CodeSnippet/adapters/plain';
import type { HighlightResult, SyntaxAdapter, Token } from '../../CodeSnippet/adapters/types';
import { adapterPainter, buildTokenDecorations, getPaintedDecorations } from './adapterPainter';

type PaintedRange = { from: number; to: number; className: string };

const collect = (set: DecorationSet): PaintedRange[] => {
  const ranges: PaintedRange[] = [];
  set.between(0, Number.MAX_SAFE_INTEGER, (from, to, value) => {
    ranges.push({ from, to, className: String(value.spec.class) });
  });
  return ranges;
};

/** Splits every line into words (keyword) and runs of spaces (plain). */
const wordTokens = (code: string): HighlightResult => ({
  tokens: code.split('\n').map(line =>
    (line.match(/\s+|\S+/g) ?? []).map(
      (content): Token => ({
        content,
        type: /\s/.test(content) ? 'plain' : 'keyword',
      }),
    ),
  ),
});

const wordAdapter = () => {
  const highlight = vi.fn<SyntaxAdapter<string>['highlight']>(async code => wordTokens(code));
  const adapter: SyntaxAdapter<string> = {
    name: 'words',
    highlight,
    getSupportedLanguages: () => ['words'],
  };
  return { adapter, highlight };
};

const mount = (doc: string, extension: ReturnType<typeof adapterPainter>): EditorView => {
  const parent = document.createElement('div');
  document.body.append(parent);
  return new EditorView({ state: EditorState.create({ doc, extensions: [extension] }), parent });
};

describe('buildTokenDecorations', () => {
  it('maps per-line tokens to document offsets with TOKEN_CLASSES', () => {
    const doc = Text.of(['GET /a', 'Host: x']);
    const result: HighlightResult = {
      tokens: [
        [
          { content: 'GET', type: 'function' },
          { content: ' ', type: 'plain' },
          { content: '/a', type: 'string' },
        ],
        [
          { content: 'Host', type: 'attr-name' },
          { content: ': ', type: 'punctuation' },
          { content: 'x', type: 'attr-value' },
        ],
      ],
    };

    expect(collect(buildTokenDecorations(doc, result))).toEqual([
      { from: 0, to: 3, className: 'text-syntax-function' },
      { from: 4, to: 6, className: 'text-syntax-string' },
      { from: 7, to: 11, className: 'text-syntax-attr-name' },
      { from: 11, to: 13, className: 'text-syntax-punctuation' },
      { from: 13, to: 14, className: 'text-syntax-attr-value' },
    ]);
  });

  it('prefers token.className over the type class, and keeps plain tokens that carry a className', () => {
    const doc = Text.of(['ab']);
    const result: HighlightResult = {
      tokens: [
        [
          { content: 'a', type: 'keyword', className: 'text-syntax-string' },
          { content: 'b', type: 'plain', className: 'text-syntax-comment italic' },
        ],
      ],
    };

    expect(collect(buildTokenDecorations(doc, result))).toEqual([
      { from: 0, to: 1, className: 'text-syntax-string' },
      { from: 1, to: 2, className: 'text-syntax-comment italic' },
    ]);
  });

  it('clamps tokens and lines that run past the document', () => {
    const doc = Text.of(['abc']);
    const result: HighlightResult = {
      tokens: [
        [
          { content: 'ab', type: 'keyword' },
          { content: 'cdef', type: 'string' },
          { content: 'zz', type: 'number' },
        ],
        [{ content: 'extra', type: 'keyword' }],
      ],
    };

    expect(collect(buildTokenDecorations(doc, result))).toEqual([
      { from: 0, to: 2, className: 'text-syntax-keyword' },
      { from: 2, to: 3, className: 'text-syntax-string' },
    ]);
  });
});

describe('adapterPainter — initial paint', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('highlights on create and applies classes to the right ranges', async () => {
    vi.useFakeTimers();
    const { adapter, highlight } = wordAdapter();
    const view = mount('GET /a\nHost: x', adapterPainter({ adapter, language: 'http' }));

    expect(highlight).toHaveBeenCalledTimes(1);
    expect(highlight).toHaveBeenCalledWith('GET /a\nHost: x', 'http');

    await vi.advanceTimersByTimeAsync(0);

    expect(collect(getPaintedDecorations(view))).toEqual([
      { from: 0, to: 3, className: 'text-syntax-keyword' },
      { from: 4, to: 6, className: 'text-syntax-keyword' },
      { from: 7, to: 12, className: 'text-syntax-keyword' },
      { from: 13, to: 14, className: 'text-syntax-keyword' },
    ]);
    expect(view.contentDOM.querySelectorAll('.text-syntax-keyword')).toHaveLength(4);
    view.destroy();
  });

  it('plainAdapter produces no marks', async () => {
    vi.useFakeTimers();
    const highlight = vi.spyOn(plainAdapter, 'highlight');
    // Same cast CodeSnippetRoot applies to its plainAdapter fallback.
    const adapter = plainAdapter as SyntaxAdapter<string>;
    const view = mount('line one\nline two', adapterPainter({ adapter, language: 'text' }));

    await vi.advanceTimersByTimeAsync(0);

    expect(highlight).toHaveBeenCalledTimes(1);
    expect(getPaintedDecorations(view).size).toBe(0);
    highlight.mockRestore();
    view.destroy();
  });

  it('returns an empty set when the painter is not installed', () => {
    const parent = document.createElement('div');
    const view = new EditorView({ state: EditorState.create({ doc: 'x' }), parent });

    expect(getPaintedDecorations(view).size).toBe(0);
    view.destroy();
  });
});
