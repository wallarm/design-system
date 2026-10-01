import { EditorSelection, EditorState, type EditorStateConfig } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it } from 'vitest';
import { editorTheme, maxHeightTheme } from './theme';

const mountedViews: EditorView[] = [];

const mountView = (doc: string, config: EditorStateConfig = {}) => {
  const parent = document.createElement('div');
  document.body.append(parent);
  const view = new EditorView({ parent, state: EditorState.create({ doc, ...config }) });
  mountedViews.push(view);
  return view;
};

/** All CSS CodeMirror (style-mod) has mounted into the document. */
const mountedCss = (): string =>
  Array.from(document.querySelectorAll('style'))
    .map(style => style.textContent ?? '')
    .join('\n');

afterEach(() => {
  for (const view of mountedViews.splice(0)) {
    view.dom.parentElement?.remove();
    view.destroy();
  }
});

describe('editorTheme', () => {
  it('maps CodeSnippet metrics and syntax tokens onto CodeMirror', () => {
    mountView('a', { extensions: editorTheme });
    const css = mountedCss();

    expect(css).toContain('font-family: inherit');
    expect(css).toContain('line-height: 20px');
    expect(css).toMatch(/\.cm-content \{[^}]*padding: 8px 0;/);
    expect(css).toMatch(/\.cm-line \{padding: 0 12px;?\}/);
    expect(css).toMatch(/:has\(\.cm-gutters\) \.cm-line \{padding-left: 8px;?\}/);
    expect(css).not.toContain(':not(:has(.cm-gutters))');
    expect(css).toContain('caret-color: var(--color-syntax-no-syntax)');
    expect(css).toContain('border-left-color: var(--color-syntax-no-syntax)');
    expect(css).toContain('background: var(--color-syntax-highlight-selected-highlight)');
    expect(css).toContain('background-color: var(--color-syntax-highlight-neutral-highlight)');
    expect(css).toContain('word-break: break-all');
    expect(css).toContain('var(--color-component-code-snippet-bg)');
    expect(css).not.toMatch(/\.cm-gutters \{[^}]*margin-right/);
    expect(css).toMatch(/\.cm-focused \{outline: none;?\}/);
  });

  it('gives selected text the selected-code colour', () => {
    const view = mountView('hello world', {
      extensions: editorTheme,
      selection: EditorSelection.single(0, 5),
    });

    const marked = view.contentDOM.querySelector('.text-syntax-highlight-selected-code\\!');
    expect(marked?.textContent).toBe('hello');

    view.dispatch({ selection: { anchor: 0 } });
    expect(view.contentDOM.querySelector('.text-syntax-highlight-selected-code\\!')).toBeNull();
  });
});

describe('maxHeightTheme', () => {
  it('returns no extension without a clamp', () => {
    expect(maxHeightTheme(null)).toEqual([]);
  });

  it('returns the same extension for the same height, so toggling the clamp adds no new rules', () => {
    expect(maxHeightTheme(216)).toBe(maxHeightTheme(216));
    expect(maxHeightTheme(216)).not.toBe(maxHeightTheme(236));
  });

  it('clamps and scrolls .cm-scroller', () => {
    mountView('a', { extensions: maxHeightTheme(216) });
    const css = mountedCss();

    expect(css).toMatch(/\.cm-scroller \{max-height: 216px;\s*overflow-y: auto;?\}/);
  });
});
