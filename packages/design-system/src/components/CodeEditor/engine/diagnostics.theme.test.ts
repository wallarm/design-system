import { afterEach, describe, expect, it } from '@rstest/core';
import {
  destroyLintedViews,
  flushLint,
  mountLinted,
} from '../../../testUtils/codeEditorDiagnostics';

/** All CSS CodeMirror (style-mod) has mounted into the document. */
const mountedCss = (): string =>
  Array.from(document.querySelectorAll('style'))
    .map(style => style.textContent ?? '')
    .join('\n');

afterEach(() => {
  destroyLintedViews();
});

describe('diagnosticsExtension — rendering', () => {
  it('underlines with wavy indicator tokens instead of the default SVG squiggle', async () => {
    const { view } = mountLinted('{"a" 1}', { language: 'json' });
    await flushLint(view);

    const mark = view.contentDOM.querySelector('.cm-lintRange-error');
    expect(mark?.textContent).toBe('1');

    const css = mountedCss();
    expect(css).toMatch(/\.cm-lintRange-error \{[^}]*background-image: none/);
    expect(css).toMatch(/\.cm-lintRange-error \{[^}]*text-decoration-style: wavy/);
    expect(css).toContain('text-decoration-color: var(--color-syntax-highlight-error-indicator)');
    expect(css).toContain('text-decoration-color: var(--color-syntax-highlight-warning-indicator)');
    expect(css).toContain('text-decoration-color: var(--color-syntax-highlight-info-indicator)');
  });

  it('puts hover tooltips on the DS Tooltip surface', () => {
    mountLinted('{}', { language: 'json' });
    const css = mountedCss();

    expect(css).toContain('background-color: var(--color-component-tooltip-bg)');
    expect(css).toContain('color: var(--color-text-primary-alt)');
    expect(css).toContain('border-radius: var(--radius-8)');
    expect(css).toContain('font-size: var(--text-xs)');
    expect(css).toContain('z-index: var(--tooltip-z-index)');
  });

  it('renders no lint gutter and no lint panel', async () => {
    const { view } = mountLinted('{"a" 1}', { language: 'json' });
    await flushLint(view);

    expect(view.dom.querySelector('.cm-gutter-lint')).toBeNull();
    expect(view.dom.querySelector('.cm-panel-lint')).toBeNull();
  });
});
