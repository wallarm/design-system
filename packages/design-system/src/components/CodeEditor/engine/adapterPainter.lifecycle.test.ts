import { Compartment, EditorState } from '@codemirror/state';
import { type DecorationSet, EditorView } from '@codemirror/view';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HighlightResult, SyntaxAdapter } from '../../CodeSnippet/adapters/types';
import { adapterPainter, getPaintedDecorations } from './adapterPainter';

type PaintedRange = { from: number; to: number; className: string };

const collect = (set: DecorationSet): PaintedRange[] => {
  const ranges: PaintedRange[] = [];
  set.between(0, Number.MAX_SAFE_INTEGER, (from, to, value) => {
    ranges.push({ from, to, className: String(value.spec.class) });
  });
  return ranges;
};

/** Paints each whole line with one token of the given type. */
const lineAdapter = (name: string, type: 'keyword' | 'string') => {
  const highlight = vi.fn<SyntaxAdapter<string>['highlight']>(
    async (code): Promise<HighlightResult> => ({
      tokens: code.split('\n').map(line => [{ content: line, type }]),
    }),
  );
  const adapter: SyntaxAdapter<string> = {
    name,
    highlight,
    getSupportedLanguages: () => ['json', 'yaml'],
  };
  return { adapter, highlight };
};

const mount = (
  doc: string,
  extension: ReturnType<typeof adapterPainter>,
  compartment: Compartment,
): EditorView => {
  const parent = document.createElement('div');
  document.body.append(parent);
  return new EditorView({
    state: EditorState.create({ doc, extensions: [compartment.of(extension)] }),
    parent,
  });
};

describe('adapterPainter — lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('keeps the previous (mapped) marks and logs once when highlight rejects', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let fail = false;
    const highlight = vi.fn<SyntaxAdapter<string>['highlight']>(async code => {
      if (fail) throw new Error('tokenizer crashed');
      return {
        tokens: code.split('\n').map(line => [{ content: line, type: 'keyword' as const }]),
      };
    });
    const adapter: SyntaxAdapter<string> = {
      name: 'flaky',
      highlight,
      getSupportedLanguages: () => ['json'],
    };
    const painter = new Compartment();
    const view = mount('abc', adapterPainter({ adapter, language: 'json' }), painter);
    await vi.advanceTimersByTimeAsync(0);
    expect(collect(getPaintedDecorations(view))).toEqual([
      { from: 0, to: 3, className: 'text-syntax-keyword' },
    ]);

    fail = true;
    view.dispatch({ changes: { from: 0, insert: 'z' } });
    await vi.advanceTimersByTimeAsync(100);
    view.dispatch({ changes: { from: 0, insert: 'y' } });
    await vi.advanceTimersByTimeAsync(100);

    expect(highlight).toHaveBeenCalledTimes(3);
    expect(collect(getPaintedDecorations(view))).toEqual([
      { from: 2, to: 5, className: 'text-syntax-keyword' },
    ]);
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(String(consoleError.mock.calls[0]?.[0])).toContain('flaky');
    view.destroy();
  });

  it('treats a synchronous throw like a rejection', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const adapter: SyntaxAdapter<string> = {
      name: 'throws',
      highlight: () => {
        throw new Error('sync failure');
      },
      getSupportedLanguages: () => ['json'],
    };
    const view = mount('abc', adapterPainter({ adapter, language: 'json' }), new Compartment());
    await vi.advanceTimersByTimeAsync(0);

    expect(getPaintedDecorations(view).size).toBe(0);
    expect(consoleError).toHaveBeenCalledTimes(1);
    view.destroy();
  });

  it('re-highlights with the new adapter and language when the compartment is reconfigured', async () => {
    const first = lineAdapter('first', 'keyword');
    const second = lineAdapter('second', 'string');
    const painter = new Compartment();
    const view = mount(
      'key: 1',
      adapterPainter({ adapter: first.adapter, language: 'json' }),
      painter,
    );
    await vi.advanceTimersByTimeAsync(0);
    expect(collect(getPaintedDecorations(view))).toEqual([
      { from: 0, to: 6, className: 'text-syntax-keyword' },
    ]);

    view.dispatch({
      effects: painter.reconfigure(adapterPainter({ adapter: second.adapter, language: 'yaml' })),
    });
    await vi.advanceTimersByTimeAsync(0);

    expect(second.highlight).toHaveBeenCalledWith('key: 1', 'yaml');
    expect(collect(getPaintedDecorations(view))).toEqual([
      { from: 0, to: 6, className: 'text-syntax-string' },
    ]);
    expect(first.highlight).toHaveBeenCalledTimes(1);
    view.destroy();
  });

  it('ignores a result that arrives after the old painter instance was replaced', async () => {
    let resolveFirst: (result: HighlightResult) => void = () => undefined;
    const slow: SyntaxAdapter<string> = {
      name: 'slow',
      highlight: () =>
        new Promise<HighlightResult>(resolve => {
          resolveFirst = resolve;
        }),
      getSupportedLanguages: () => ['json'],
    };
    const fast = lineAdapter('fast', 'string');
    const painter = new Compartment();
    const view = mount('abc', adapterPainter({ adapter: slow, language: 'json' }), painter);

    view.dispatch({
      effects: painter.reconfigure(adapterPainter({ adapter: fast.adapter, language: 'json' })),
    });
    await vi.advanceTimersByTimeAsync(0);
    resolveFirst({ tokens: [[{ content: 'abc', type: 'keyword' }]] });
    await vi.advanceTimersByTimeAsync(0);

    expect(collect(getPaintedDecorations(view))).toEqual([
      { from: 0, to: 3, className: 'text-syntax-string' },
    ]);
    view.destroy();
  });

  it('cancels the pending debounce on destroy', async () => {
    const { adapter, highlight } = lineAdapter('lines', 'keyword');
    const view = mount('abc', adapterPainter({ adapter, language: 'json' }), new Compartment());
    await vi.advanceTimersByTimeAsync(0);

    view.dispatch({ changes: { from: 0, insert: 'x' } });
    view.destroy();
    await vi.advanceTimersByTimeAsync(500);

    expect(highlight).toHaveBeenCalledTimes(1);
  });
});
