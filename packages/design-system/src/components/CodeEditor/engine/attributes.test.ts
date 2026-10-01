import { StateEffect } from '@codemirror/state';
import { lineNumbers } from '@codemirror/view';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { mountEngine, unmountAllEngines } from '../../../testUtils/codeEditorEngine';

afterEach(() => {
  unmountAllEngines();
  rs.restoreAllMocks();
});

describe('createEditor — content attributes (D10)', () => {
  it('lands consumer attributes on .cm-content unchanged', () => {
    const props = '{"section":"body","nested":{"a":1}}';
    const { handle } = mountEngine({
      contentAttributes: {
        'aria-label': 'Request',
        'data-analytics-id': 'request-editor',
        'data-analytics-props': props,
        id: 'request-editor',
        title: 'Request body',
      },
    });
    const content = handle.view.contentDOM;

    expect(content.getAttribute('aria-label')).toBe('Request');
    expect(content.getAttribute('data-analytics-id')).toBe('request-editor');
    expect(content.getAttribute('data-analytics-props')).toBe(props);
    expect(content.id).toBe('request-editor');
    expect(content.getAttribute('title')).toBe('Request body');
  });

  it('sets data-testid="{testId}--editor" on .cm-content', () => {
    const { handle } = mountEngine({ testId: 'req' });

    expect(handle.view.contentDOM.getAttribute('data-testid')).toBe('req--editor');
  });

  it('merges class instead of replacing CodeMirror classes', () => {
    const { handle } = mountEngine({ contentAttributes: { class: 'consumer-class' } });
    const content = handle.view.contentDOM;

    expect(content.classList.contains('consumer-class')).toBe(true);
    expect(content.classList.contains('cm-content')).toBe(true);
  });

  it('ignores reserved attributes with a warning', () => {
    const warn = rs.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { handle } = mountEngine({
      contentAttributes: { role: 'presentation', spellcheck: 'true', 'aria-label': 'Body' },
    });
    const content = handle.view.contentDOM;

    expect(content.getAttribute('role')).toBe('textbox');
    expect(content.getAttribute('spellcheck')).toBe('false');
    expect(content.getAttribute('aria-label')).toBe('Body');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"role"'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"spellcheck"'));
  });

  it('updates attributes on change and skips reconfigure for shallow-equal records', () => {
    const { handle, rerender } = mountEngine({ contentAttributes: { 'aria-label': 'One' } });
    const dispatch = rs.spyOn(handle.view, 'dispatch');

    rerender({ contentAttributes: { 'aria-label': 'One' } });
    expect(dispatch).not.toHaveBeenCalled();

    rerender({ contentAttributes: { 'aria-label': 'Two', 'data-analytics-id': 'x' } });
    expect(handle.view.contentDOM.getAttribute('aria-label')).toBe('Two');
    expect(handle.view.contentDOM.getAttribute('data-analytics-id')).toBe('x');

    rerender({ contentAttributes: {} });
    expect(handle.view.contentDOM.hasAttribute('aria-label')).toBe(false);
    expect(handle.view.contentDOM.hasAttribute('data-analytics-id')).toBe(false);
  });
});

describe('createEditor — gutter test id', () => {
  it('sets data-testid="{testId}--gutter" once gutters are rendered', () => {
    const { handle } = mountEngine({ testId: 'req' });
    expect(handle.view.dom.querySelector('.cm-gutters')).toBeNull();

    // Stand-in for the lines/gutters compartment (T7): gutters added by a later reconfigure.
    handle.view.dispatch({ effects: StateEffect.appendConfig.of(lineNumbers()) });

    expect(handle.view.dom.querySelector('.cm-gutters')?.getAttribute('data-testid')).toBe(
      'req--gutter',
    );
  });

  it('adds nothing without a testId', () => {
    const { handle } = mountEngine();
    handle.view.dispatch({ effects: StateEffect.appendConfig.of(lineNumbers()) });

    expect(handle.view.dom.querySelector('.cm-gutters')?.hasAttribute('data-testid')).toBe(false);
  });
});

describe('createEditor — cspNonce and maxHeight', () => {
  it('puts the nonce on the style tag CodeMirror injects', () => {
    mountEngine({ cspNonce: 'n0nce-123' });

    expect(document.head.querySelector('style[nonce="n0nce-123"]')).not.toBeNull();
  });

  it('clamps .cm-scroller when maxHeight is set and releases it on null', () => {
    const { handle, rerender } = mountEngine({ value: 'a' });
    const themeClasses = () => handle.view.dom.className;
    const before = themeClasses();

    rerender({ maxHeight: 176 });
    const css = Array.from(document.querySelectorAll('style'))
      .map(style => style.textContent ?? '')
      .join('\n');
    expect(css).toContain('max-height: 176px');
    expect(themeClasses()).not.toBe(before);

    rerender({ maxHeight: null });
    expect(themeClasses()).toBe(before);
  });
});
