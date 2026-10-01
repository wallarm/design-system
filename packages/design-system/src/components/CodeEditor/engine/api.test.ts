import { undo } from '@codemirror/commands';
import { searchPanelOpen } from '@codemirror/search';
import { afterEach, describe, expect, it } from '@rstest/core';
import { mountEngine, typeAt, unmountAllEngines } from '../../../testUtils/codeEditorEngine';

afterEach(() => {
  unmountAllEngines();
});

describe('createEditor — api', () => {
  it('getValue returns the current document', () => {
    const { handle } = mountEngine({ value: 'abc' });
    typeAt(handle.view, 3, 'd');

    expect(handle.api.getValue()).toBe('abcd');
  });

  it('insertText replaces the selection as an undoable user edit', () => {
    const { handle, callbacks } = mountEngine({ value: 'hello world' });
    handle.view.dispatch({ selection: { anchor: 0, head: 5 } });

    handle.api.insertText('bye');

    expect(handle.api.getValue()).toBe('bye world');
    expect(handle.view.state.selection.main.head).toBe(3);
    expect(callbacks.onChange).toHaveBeenLastCalledWith('bye world');
    expect(undo(handle.view)).toBe(true);
    expect(handle.api.getValue()).toBe('hello world');
  });

  it('insertText inserts at the cursor', () => {
    const { handle } = mountEngine({ value: 'ac' });
    handle.view.dispatch({ selection: { anchor: 1 } });

    handle.api.insertText('b');

    expect(handle.api.getValue()).toBe('abc');
  });

  it('insertText respects readOnly', () => {
    const { handle, callbacks } = mountEngine({ value: 'abc', readOnly: true });

    handle.api.insertText('x');

    expect(handle.api.getValue()).toBe('abc');
    expect(callbacks.onChange).not.toHaveBeenCalled();
  });

  it('focus focuses the typing surface', () => {
    const { handle } = mountEngine({ value: 'abc' });

    handle.api.focus();

    expect(document.activeElement).toBe(handle.view.contentDOM);
  });

  it('focus does nothing in readOnly mode', () => {
    const { handle } = mountEngine({ value: 'abc', readOnly: true });

    handle.api.focus();

    expect(document.activeElement).not.toBe(handle.view.contentDOM);
  });

  it('openSearch opens the DS panel, not the built-in CodeMirror one', () => {
    const { handle } = mountEngine({ value: 'abc' });

    handle.api.openSearch();

    expect(searchPanelOpen(handle.view.state)).toBe(true);
    expect(handle.view.dom.querySelector('.cm-search')).toBeNull();
  });

  it('foldAll / unfoldAll are safe with no foldable ranges', () => {
    const { handle } = mountEngine({ value: '{\n  "a": 1\n}' });

    expect(() => {
      handle.api.foldAll();
      handle.api.unfoldAll();
    }).not.toThrow();
    expect(handle.api.getValue()).toBe('{\n  "a": 1\n}');
  });
});
