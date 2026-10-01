import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { Decoration, EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it } from '@rstest/core';
import type { LineConfig } from '../../CodeSnippet/CodeSnippetContext';
import { getLineDecorations, linesExtension } from './lines';

interface CollectedDecoration {
  from: number;
  to: number;
  kind: 'line' | 'mark';
  className: string;
  style: string | undefined;
}

const collect = (state: EditorState): CollectedDecoration[] => {
  const result: CollectedDecoration[] = [];
  getLineDecorations(state).between(0, state.doc.length, (from, to, value) => {
    const spec = value.spec as { class?: string; attributes?: Record<string, string> };
    result.push({
      from,
      to,
      kind: from === to ? 'line' : 'mark',
      className: spec.class ?? '',
      style: spec.attributes?.style,
    });
  });
  return result;
};

const createState = (
  doc: string,
  lines: Record<number, LineConfig>,
  startingLineNumber = 1,
  extra: Extension = [],
): EditorState =>
  EditorState.create({ doc, extensions: [linesExtension({ lines, startingLineNumber }), extra] });

let view: EditorView | null = null;
afterEach(() => {
  view?.destroy();
  view = null;
});

describe('linesExtension', () => {
  it('returns an empty set when the extension is not installed', () => {
    const state = EditorState.create({ doc: 'a' });
    expect(getLineDecorations(state).size).toBe(0);
  });

  it('decorates a coloured line by absolute line number (startingLineNumber 10)', () => {
    const state = createState('first\nsecond\nthird', { 11: { color: 'danger' } }, 10);
    const decorations = collect(state);

    const line = decorations.find(d => d.kind === 'line');
    expect(line?.from).toBe(6);
    expect(line?.className).toContain('bg-syntax-highlight-error-highlight');
    expect(line?.className).toContain('text-syntax-highlight-error-code');

    // Whole-line text colour is also an innermost mark so it beats token colours
    const mark = decorations.find(d => d.kind === 'mark');
    expect(mark).toMatchObject({ from: 6, to: 12 });
    expect(mark?.className).toContain('text-syntax-highlight-error-code');
  });

  it('ignores line numbers outside the document', () => {
    const state = createState('only', { 0: { color: 'info' }, 5: { color: 'info' } });
    expect(collect(state)).toEqual([]);
  });

  it('applies textStyle, className and serialized style on the line', () => {
    const state = createState('code', {
      1: { textStyle: 'italic', className: 'my-line', style: { paddingLeft: 4, opacity: 0.5 } },
    });
    const [line] = collect(state);
    expect(line?.kind).toBe('line');
    expect(line?.className).toContain('italic');
    expect(line?.className).toContain('my-line');
    expect(line?.style).toBe('padding-left: 4px; opacity: 0.5');
  });

  it('maps ranges to marks at line-relative offsets, clamped to the line length', () => {
    const state = createState('skip\nabcdef', {
      2: {
        color: 'warning',
        ranges: [
          { start: 1, end: 3 },
          { start: 4, end: 99, color: 'info' },
          { start: -5, end: 1, color: 'success' },
        ],
      },
    });
    const marks = collect(state).filter(d => d.kind === 'mark');
    expect(marks).toEqual([
      expect.objectContaining({
        from: 5,
        to: 6,
        className: 'text-syntax-highlight-success-code font-medium',
      }),
      expect.objectContaining({
        from: 6,
        to: 8,
        className: 'text-syntax-highlight-warning-code font-medium',
      }),
      expect.objectContaining({
        from: 9,
        to: 11,
        className: 'text-syntax-highlight-info-code font-medium',
      }),
    ]);
  });

  it('suppresses the whole-line text colour when ranges exist, keeping the background', () => {
    const state = createState('abcdef', {
      1: { color: 'warning', ranges: [{ start: 0, end: 2 }] },
    });
    const line = collect(state).find(d => d.kind === 'line');
    expect(line?.className).toContain('bg-syntax-highlight-warning-highlight');
    expect(line?.className).not.toContain('text-syntax-highlight-warning-code');
    const marks = collect(state).filter(d => d.kind === 'mark');
    expect(marks).toHaveLength(1);
    expect(marks[0]).toMatchObject({ from: 0, to: 2 });
  });

  it('skips ranges without a colour on uncoloured lines and empty ranges', () => {
    const state = createState('abcdef', {
      1: {
        ranges: [
          { start: 0, end: 3 },
          { start: 3, end: 3, color: 'danger' },
        ],
      },
    });
    expect(collect(state)).toEqual([]);
  });

  it('recomputes by absolute line number after a document change (no mapping)', () => {
    const state = createState('a\nb', { 2: { color: 'danger' } });
    expect(collect(state).find(d => d.kind === 'line')?.from).toBe(2);

    const next = state.update({ changes: { from: 0, insert: 'x\n' } }).state;
    // Mapping would have moved it to 4 ("b" on line 3); line 2 is now "a" at offset 2
    expect(collect(next).find(d => d.kind === 'line')?.from).toBe(2);
    expect(next.doc.line(2).text).toBe('a');
  });

  it('rebuilds when the extension is reconfigured', () => {
    const compartment = new Compartment();
    const state = EditorState.create({
      doc: 'a\nb',
      extensions: compartment.of(
        linesExtension({ lines: { 1: { color: 'info' } }, startingLineNumber: 1 }),
      ),
    });
    const next = state.update({
      effects: compartment.reconfigure(
        linesExtension({ lines: { 2: { color: 'brand' } }, startingLineNumber: 1 }),
      ),
    }).state;
    const line = collect(next).find(d => d.kind === 'line');
    expect(line?.from).toBe(2);
    expect(line?.className).toContain('bg-syntax-highlight-brand-highlight');
  });

  it('renders line classes and style on .cm-line and nests range marks inside painter marks', () => {
    // Simulates the adapter painter: a default-precedence token mark over the whole line
    const painter = EditorView.decorations.of(
      Decoration.set([Decoration.mark({ class: 'text-syntax-keyword' }).range(0, 6)]),
    );
    view = new EditorView({
      state: createState(
        'abcdef',
        { 1: { color: 'warning', ranges: [{ start: 1, end: 3 }], style: { opacity: 0.5 } } },
        1,
        painter,
      ),
      parent: document.body,
    });

    const line = view.dom.querySelector('.cm-line');
    expect(line?.className).toContain('bg-syntax-highlight-warning-highlight');
    expect(line?.getAttribute('style')).toContain('opacity: 0.5');

    const range = line?.querySelector('.text-syntax-keyword > .text-syntax-highlight-warning-code');
    expect(range?.textContent).toBe('bc');
  });
});
