import { EditorState } from '@codemirror/state';
import { type DecorationSet, EditorView } from '@codemirror/view';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HighlightResult, SyntaxAdapter, Token } from '../../CodeSnippet/adapters/types';
import { adapterPainter, getPaintedDecorations } from './adapterPainter';

type PaintedRange = { from: number; to: number; className: string };

const collect = (set: DecorationSet): PaintedRange[] => {
  const ranges: PaintedRange[] = [];
  set.between(0, Number.MAX_SAFE_INTEGER, (from, to, value) => {
    ranges.push({ from, to, className: String(value.spec.class) });
  });
  return ranges;
};

/** Every non-space run is a keyword; spaces are plain. */
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

type Deferred = {
  code: string;
  resolve: (result: HighlightResult) => void;
  reject: (error: unknown) => void;
};

/** Adapter whose every highlight() call stays pending until the test settles it. */
const deferredAdapter = () => {
  const calls: Deferred[] = [];
  const highlight = vi.fn<SyntaxAdapter<string>['highlight']>(
    code =>
      new Promise<HighlightResult>((resolve, reject) => {
        calls.push({ code, resolve, reject });
      }),
  );
  const adapter: SyntaxAdapter<string> = {
    name: 'deferred',
    highlight,
    getSupportedLanguages: () => ['words'],
  };
  return { adapter, highlight, calls };
};

const mount = (doc: string, adapter: SyntaxAdapter<string>): EditorView => {
  const parent = document.createElement('div');
  document.body.append(parent);
  return new EditorView({
    state: EditorState.create({
      doc,
      extensions: [adapterPainter({ adapter, language: 'words' })],
    }),
    parent,
  });
};

describe('adapterPainter — typing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('maps existing decorations through changes immediately (no flash) and re-highlights after 100ms', async () => {
    const { adapter, highlight, calls } = deferredAdapter();
    const view = mount('foo bar', adapter);
    calls[0]?.resolve(wordTokens('foo bar'));
    await vi.advanceTimersByTimeAsync(0);
    expect(collect(getPaintedDecorations(view))).toEqual([
      { from: 0, to: 3, className: 'text-syntax-keyword' },
      { from: 4, to: 7, className: 'text-syntax-keyword' },
    ]);

    view.dispatch({ changes: { from: 0, insert: 'xx ' } });

    // Before the debounce fires the old colours follow their text.
    expect(collect(getPaintedDecorations(view))).toEqual([
      { from: 3, to: 6, className: 'text-syntax-keyword' },
      { from: 7, to: 10, className: 'text-syntax-keyword' },
    ]);
    await vi.advanceTimersByTimeAsync(99);
    expect(highlight).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(highlight).toHaveBeenCalledTimes(2);
    expect(calls[1]?.code).toBe('xx foo bar');

    calls[1]?.resolve(wordTokens('xx foo bar'));
    await vi.advanceTimersByTimeAsync(0);
    expect(collect(getPaintedDecorations(view))).toEqual([
      { from: 0, to: 2, className: 'text-syntax-keyword' },
      { from: 3, to: 6, className: 'text-syntax-keyword' },
      { from: 7, to: 10, className: 'text-syntax-keyword' },
    ]);
    view.destroy();
  });

  it('restarts the debounce on every keystroke', async () => {
    const { adapter, highlight, calls } = deferredAdapter();
    const view = mount('a', adapter);
    calls[0]?.resolve(wordTokens('a'));
    await vi.advanceTimersByTimeAsync(0);

    view.dispatch({ changes: { from: 1, insert: 'b' } });
    await vi.advanceTimersByTimeAsync(60);
    view.dispatch({ changes: { from: 2, insert: 'c' } });
    await vi.advanceTimersByTimeAsync(60);
    expect(highlight).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(40);
    expect(highlight).toHaveBeenCalledTimes(2);
    expect(calls[1]?.code).toBe('abc');
    view.destroy();
  });

  it('drops a result when the document changed while the highlight was pending', async () => {
    const { adapter, calls } = deferredAdapter();
    const view = mount('one', adapter);

    view.dispatch({ changes: { from: 0, to: 3, insert: 'two words' } });
    // The stale result describes 'one' — applying it would paint the wrong ranges.
    calls[0]?.resolve({ tokens: [[{ content: 'one', type: 'string' }]] });
    await vi.advanceTimersByTimeAsync(0);
    expect(getPaintedDecorations(view).size).toBe(0);

    await vi.advanceTimersByTimeAsync(100);
    expect(calls[1]?.code).toBe('two words');
    calls[1]?.resolve(wordTokens('two words'));
    await vi.advanceTimersByTimeAsync(0);
    expect(collect(getPaintedDecorations(view))).toEqual([
      { from: 0, to: 3, className: 'text-syntax-keyword' },
      { from: 4, to: 9, className: 'text-syntax-keyword' },
    ]);
    view.destroy();
  });

  it('ignores transactions that do not change the document', async () => {
    const { adapter, highlight, calls } = deferredAdapter();
    const view = mount('abc', adapter);
    calls[0]?.resolve(wordTokens('abc'));
    await vi.advanceTimersByTimeAsync(0);

    view.dispatch({ selection: { anchor: 2 } });
    await vi.advanceTimersByTimeAsync(200);

    expect(highlight).toHaveBeenCalledTimes(1);
    expect(getPaintedDecorations(view).size).toBe(1);
    view.destroy();
  });
});
