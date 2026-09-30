import { EditorState, type Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it, onTestFinished } from 'vitest';
import type { LineConfig } from '../../CodeSnippet/CodeSnippetContext';
import { LINE_COLOR_STYLES } from '../../CodeSnippet/lib/lineStyles';
import { createPortalRegistry } from '../lib/portalRegistry';
import { DIFF_CHANGED_CLASS, DIFF_DELETED_CLASS, DIFF_INSERTED_CLASS, diffExtension } from './diff';
import { guttersExtension, PREFIX_GUTTER_CLASS, STICK_GUTTER_CLASS } from './gutters';

const views: EditorView[] = [];

afterEach(() => {
  for (const view of views.splice(0)) {
    view.destroy();
    view.dom.remove();
  }
});

interface SetupOptions {
  original: string;
  value: string;
  lineNumbers?: boolean;
  lines?: Record<number, LineConfig>;
  startingLineNumber?: number;
}

const setup = ({
  original,
  value,
  lineNumbers = true,
  lines = {},
  startingLineNumber = 1,
}: SetupOptions): EditorView => {
  const portals = createPortalRegistry();
  const extensions: Extension[] = [
    diffExtension({ original, portals }),
    guttersExtension({
      lines,
      startingLineNumber,
      lineNumbers,
      foldGutter: null,
      portals,
      testId: undefined,
      diff: true,
    }),
  ];
  const parent = document.createElement('div');
  document.body.append(parent);
  const view = new EditorView({ parent, state: EditorState.create({ doc: value, extensions }) });
  views.push(view);
  return view;
};

const contentLines = (view: EditorView): HTMLElement[] =>
  Array.from(view.contentDOM.querySelectorAll<HTMLElement>(':scope > .cm-line'));

const gutterCells = (view: EditorView, gutterClass: string): HTMLElement[] =>
  Array.from(
    view.dom.querySelectorAll<HTMLElement>(`.cm-gutter.${gutterClass} > .cm-gutterElement`),
  ).filter(cell => cell.style.visibility !== 'hidden'); // skip the width spacer

const ORIGINAL = 'const a = 1;\nconsole.log("old message");\nexport default a;';
const MODIFIED =
  'const a = 1;\nconsole.log("new message");\nconsole.log("another");\nexport default a;';

describe('diffExtension — inserted lines', () => {
  it('gives inserted and changed lines the success line classes', () => {
    const view = setup({ original: ORIGINAL, value: MODIFIED });
    const [first, changed, added, last] = contentLines(view);

    expect(first?.classList.contains(DIFF_INSERTED_CLASS)).toBe(false);
    expect(last?.classList.contains(DIFF_INSERTED_CLASS)).toBe(false);
    for (const line of [changed, added]) {
      expect(line?.classList.contains(DIFF_INSERTED_CLASS)).toBe(true);
      expect(line?.classList.contains(LINE_COLOR_STYLES.success.bg)).toBe(true);
      // Line text colour as an inner mark, so it beats token colours.
      const mark = line?.querySelector(`span.${LINE_COLOR_STYLES.success.text.split(' ')[0]}`);
      expect(mark).not.toBeNull();
    }
    // The chunk replaces a line → it is a "changed" chunk (intra-line changes are emphasised).
    expect(changed?.classList.contains(DIFF_CHANGED_CLASS)).toBe(true);
  });

  it('marks intra-line changes with .cm-changedText', () => {
    const view = setup({ original: ORIGINAL, value: MODIFIED });
    const changed = contentLines(view)[1];
    const changedText = Array.from(changed?.querySelectorAll('.cm-changedText') ?? []).map(
      node => node.textContent,
    );
    expect(changedText.join('')).toContain('new');
    expect(changedText.join('')).not.toContain('console');
  });

  it('does not mark a wholly added block as changed', () => {
    const view = setup({ original: 'a\nc', value: 'a\nb\nc' });
    const added = contentLines(view)[1];
    expect(added?.classList.contains(DIFF_INSERTED_CLASS)).toBe(true);
    expect(added?.classList.contains(DIFF_CHANGED_CLASS)).toBe(false);
  });

  it('puts a success "+" prefix and a success stick next to inserted lines', () => {
    const view = setup({ original: 'a\nc', value: 'a\nb\nc' });
    const prefixes = gutterCells(view, PREFIX_GUTTER_CLASS);
    expect(prefixes).toHaveLength(1);
    expect(prefixes[0]?.textContent).toBe('+');
    expect(prefixes[0]?.className).toContain(LINE_COLOR_STYLES.success.text.split(' ')[0]);

    const sticks = gutterCells(view, STICK_GUTTER_CLASS);
    expect(sticks.map(cell => cell.classList.contains(LINE_COLOR_STYLES.success.border))).toEqual([
      false,
      true,
      false,
    ]);
  });

  it('colours the line number of an inserted line', () => {
    const view = setup({ original: 'a\nc', value: 'a\nb\nc' });
    const numbers = gutterCells(view, 'cm-lineNumbers');
    expect(numbers.map(cell => cell.textContent)).toEqual(['1', '2', '3']);
    expect(numbers[1]?.classList.contains(DIFF_INSERTED_CLASS)).toBe(true);
    expect(numbers[1]?.className).toContain(LINE_COLOR_STYLES.success.bg);
  });
});

describe('diffExtension — deleted chunks', () => {
  it('renders deleted lines in a .cm-deletedChunk widget without syntax spans', () => {
    const view = setup({ original: 'a\nold 1\nold 2\nc', value: 'a\nc' });
    const chunk = view.contentDOM.querySelector('.cm-deletedChunk');
    expect(chunk).not.toBeNull();
    const deletedLines = Array.from(chunk?.querySelectorAll('.cm-deletedLine') ?? []);
    expect(deletedLines.map(line => line.textContent)).toEqual(['old 1', 'old 2']);
    // mergeControls: false → no accept / reject buttons.
    expect(chunk?.querySelector('button')).toBeNull();
  });

  it('puts one danger "-" per deleted row and a danger stick next to the widget', () => {
    const view = setup({ original: 'a\nold 1\nold 2\nc', value: 'a\nc' });
    const prefixes = gutterCells(view, PREFIX_GUTTER_CLASS);
    expect(prefixes).toHaveLength(1);
    expect(prefixes[0]?.className).toContain(LINE_COLOR_STYLES.danger.text.split(' ')[0]);
    expect(
      Array.from(prefixes[0]?.querySelectorAll('div') ?? []).map(row => row.textContent),
    ).toEqual(['-', '-']);

    const sticks = gutterCells(view, STICK_GUTTER_CLASS);
    // a, deleted widget, c
    expect(sticks).toHaveLength(3);
    expect(sticks[1]?.classList.contains(LINE_COLOR_STYLES.danger.border)).toBe(true);
    expect(sticks[1]?.classList.contains(DIFF_DELETED_CLASS)).toBe(true);
  });

  it('shows no line number on the deleted row, and numbers stay continuous', () => {
    const view = setup({
      original: 'a\nold\nc',
      value: 'a\nc',
      startingLineNumber: 10,
    });
    const numbers = gutterCells(view, 'cm-lineNumbers');
    expect(numbers.map(cell => cell.textContent)).toEqual(['10', '', '11']);
    expect(numbers[1]?.classList.contains(DIFF_DELETED_CLASS)).toBe(true);
    expect(numbers[1]?.className).toContain(LINE_COLOR_STYLES.danger.bg);
  });

  it('adds no gutter cells for the empty widget of a pure insertion', () => {
    const view = setup({ original: 'a\nc', value: 'a\nb\nc' });
    expect(gutterCells(view, 'cm-lineNumbers').map(cell => cell.textContent)).toEqual([
      '1',
      '2',
      '3',
    ]);
  });
});

describe('diffExtension — live updates', () => {
  it('re-diffs when the document is edited', () => {
    const view = setup({ original: 'a\nb', value: 'a\nb' });
    expect(view.contentDOM.querySelector(`.${DIFF_INSERTED_CLASS}`)).toBeNull();
    view.dispatch({ changes: { from: 2, insert: 'new\n' } });
    const lines = contentLines(view);
    expect(lines[1]?.textContent).toBe('new');
    expect(lines[1]?.classList.contains(DIFF_INSERTED_CLASS)).toBe(true);
    expect(gutterCells(view, PREFIX_GUTTER_CLASS).map(cell => cell.textContent)).toEqual(['+']);
  });

  it('diff styling wins over a `lines` colour on the same line', () => {
    const view = setup({
      original: 'a\nc',
      value: 'a\nb\nc',
      lines: { 2: { color: 'warning', prefix: '!' } },
    });
    const prefixes = gutterCells(view, PREFIX_GUTTER_CLASS);
    expect(prefixes.map(cell => cell.textContent)).toEqual(['+']);
    const sticks = gutterCells(view, STICK_GUTTER_CLASS);
    expect(sticks[1]?.classList.contains(LINE_COLOR_STYLES.success.border)).toBe(true);
    expect(sticks[1]?.classList.contains(LINE_COLOR_STYLES.warning.border)).toBe(false);
  });
});

describe('diffExtension — theme', () => {
  it('pads deleted rows like `.cm-line`, so their text lines up with the code', () => {
    setup({ original: 'a\nold\nc', value: 'a\nc' });
    const css = Array.from(document.querySelectorAll('style'))
      .map(style => style.textContent ?? '')
      .join('\n');
    // `.cm-deletedLine` is not a `.cm-line`: it needs the same 12px right edge and 8px gutter gap.
    expect(css).toMatch(/\.cm-deletedChunk \.cm-deletedLine \{padding: 0 12px;?\}/);
    expect(css).toMatch(
      /:has\(\.cm-gutters\) \.cm-deletedChunk \.cm-deletedLine \{padding-left: 8px;?\}/,
    );
  });
});

describe('diffExtension — font weights', () => {
  it('bolds the innermost text of an inserted-side intra-line change', () => {
    // Stand-in for Tailwind's `font-medium` utility (not loaded in jsdom).
    const utility = document.head.appendChild(document.createElement('style'));
    utility.textContent = '.font-medium { font-weight: 450; }';
    onTestFinished(() => utility.remove());
    const view = setup({ original: ORIGINAL, value: MODIFIED });
    const changedText = contentLines(view)[1]?.querySelector('.cm-changedText');
    expect(changedText).not.toBeNull();
    // Innermost element: the success text mark (`font-medium`) must not win over the bold.
    let innermost = changedText as Element;
    while (innermost.firstElementChild) innermost = innermost.firstElementChild;
    expect(innermost).not.toBe(changedText);
    expect(getComputedStyle(innermost).fontWeight).toBe('var(--font-weight-bold, 700)');
  });

  it('bolds deleted-side intra-line changes', () => {
    const view = setup({ original: ORIGINAL, value: MODIFIED });
    const deletedText = view.contentDOM.querySelector('.cm-deletedChunk .cm-deletedText');
    expect(deletedText).not.toBeNull();
    expect(getComputedStyle(deletedText as Element).fontWeight).toBe(
      'var(--font-weight-bold, 700)',
    );
  });

  it('uses the `font-medium` token for deleted rows, like LINE_COLOR_STYLES text', () => {
    const view = setup({ original: 'a\nold\nc', value: 'a\nc' });
    const chunk = view.contentDOM.querySelector('.cm-deletedChunk');
    expect(chunk).not.toBeNull();
    expect(getComputedStyle(chunk as Element).fontWeight).toBe('var(--font-weight-medium, 450)');
    expect(LINE_COLOR_STYLES.danger.text).toContain('font-medium');
  });
});
