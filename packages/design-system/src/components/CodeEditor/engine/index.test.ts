import { insertNewlineAndIndent, undo } from '@codemirror/commands';
import { EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  engineOptions,
  mountEngine,
  typeAt,
  unmountAllEngines,
} from '../../../testUtils/codeEditorEngine';
import { createPortalRegistry } from '../lib/portalRegistry';
import { createEditor } from './index';
import type { EditorHandle, EngineCallbacks } from './types';

const keydown = (target: HTMLElement, key: string, keyCode: number) =>
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key, keyCode, bubbles: true, cancelable: true }),
  );

afterEach(() => {
  unmountAllEngines();
});

describe('createEditor — lifecycle', () => {
  it('mounts an editor with the initial value into the parent', () => {
    const { handle, parent } = mountEngine({ value: 'GET / HTTP/1.1' });

    expect(parent.querySelector('.cm-editor')).toBe(handle.view.dom);
    expect(handle.view.state.doc.toString()).toBe('GET / HTTP/1.1');
  });

  it('destroy removes the editor DOM', () => {
    const { handle, parent } = mountEngine({ value: 'a' });

    handle.destroy();

    expect(parent.querySelector('.cm-editor')).toBeNull();
  });
});

describe('createEditor — value sync', () => {
  it('fires onChange for user edits', () => {
    const { handle, callbacks } = mountEngine({ value: 'abc' });

    typeAt(handle.view, 3, 'd');

    expect(callbacks.onChange).toHaveBeenCalledTimes(1);
    expect(callbacks.onChange).toHaveBeenLastCalledWith('abcd');
  });

  it('does not fire onChange when the value prop is synced in', () => {
    const { handle, callbacks, rerender } = mountEngine({ value: 'abc' });

    rerender({ value: 'abc!' });

    expect(handle.view.state.doc.toString()).toBe('abc!');
    expect(callbacks.onChange).not.toHaveBeenCalled();
  });

  it('does nothing when the value prop equals the document (controlled echo)', () => {
    const { handle, callbacks, rerender } = mountEngine({ value: 'abc' });
    typeAt(handle.view, 3, 'd');
    const stateBefore = handle.view.state;

    rerender({ value: 'abcd' });

    expect(handle.view.state).toBe(stateBefore);
    expect(callbacks.onChange).toHaveBeenCalledTimes(1);
  });

  it('keeps the cursor when the external change is after it', () => {
    const { handle, rerender } = mountEngine({ value: 'hello world' });
    handle.view.dispatch({ selection: { anchor: 5 } });

    rerender({ value: 'hello world, again' });

    expect(handle.view.state.selection.main.head).toBe(5);
  });

  it('maps the cursor when the external change is before it', () => {
    const { handle, rerender } = mountEngine({ value: 'hello world' });
    handle.view.dispatch({ selection: { anchor: 5 } });

    rerender({ value: '>> hello world' });

    expect(handle.view.state.selection.main.head).toBe(8);
  });

  it('keeps external syncs out of the undo history', () => {
    const { handle, rerender } = mountEngine({ value: 'abc' });
    typeAt(handle.view, 3, 'd');
    rerender({ value: 'abcd + external' });

    expect(undo(handle.view)).toBe(true);
    expect(handle.view.state.doc.toString()).toBe('abc + external');
    expect(undo(handle.view)).toBe(false);
  });
});

describe('createEditor — controlled transform in onChange (E-RF1)', () => {
  it('syncs the transformed value once, without a loop, and keeps the cursor', async () => {
    const parent = document.createElement('div');
    document.body.append(parent);
    const options = engineOptions({ value: '' });
    let stored = options.value;
    let handle: EditorHandle | null = null;
    // Like a React parent: store the transformed value, re-render (update) later —
    // CodeMirror forbids dispatching while an update is in progress.
    const onChange = vi.fn<EngineCallbacks['onChange']>(value => {
      stored = value.toUpperCase();
      queueMicrotask(() => handle?.update({ ...options, value: stored }));
    });
    handle = createEditor(parent, options, {
      onChange,
      onDiagnosticsChange: vi.fn(),
      onVisibleRowCountChange: vi.fn(),
      portals: createPortalRegistry(),
    });

    try {
      typeAt(handle.view, 0, 'a');
      await Promise.resolve();

      expect(handle.view.state.doc.toString()).toBe('A');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(handle.view.state.selection.main.head).toBe(1);
    } finally {
      handle.destroy();
      parent.remove();
    }
  });
});

describe('createEditor — visible rows', () => {
  it('reports the line count on create and when it changes', () => {
    const { handle, callbacks, rerender } = mountEngine({ value: 'a\nb' });
    expect(callbacks.onVisibleRowCountChange).toHaveBeenLastCalledWith(2);

    typeAt(handle.view, 3, '\nc');
    expect(callbacks.onVisibleRowCountChange).toHaveBeenLastCalledWith(3);

    rerender({ value: 'a' });
    expect(callbacks.onVisibleRowCountChange).toHaveBeenLastCalledWith(1);
  });

  it('does not re-report an unchanged count', () => {
    const { handle, callbacks } = mountEngine({ value: 'a' });

    typeAt(handle.view, 1, 'bc');

    expect(callbacks.onVisibleRowCountChange).toHaveBeenCalledTimes(1);
  });
});

describe('createEditor — readOnly (EditorState.readOnly, D11)', () => {
  it('blocks editing commands but keeps the content focusable', () => {
    const { handle } = mountEngine({ value: 'abc', readOnly: true });
    handle.view.dispatch({ selection: { anchor: 3 } });

    expect(handle.view.state.readOnly).toBe(true);
    expect(insertNewlineAndIndent(handle.view)).toBe(false);
    expect(handle.view.state.doc.toString()).toBe('abc');
    expect(handle.view.contentDOM.getAttribute('contenteditable')).toBe('true');
    expect(handle.view.contentDOM.getAttribute('aria-readonly')).toBe('true');
  });

  it('toggles through update without recreating the view', () => {
    const { handle, rerender } = mountEngine({ value: 'abc' });
    const view = handle.view;

    rerender({ readOnly: true });
    expect(view.state.readOnly).toBe(true);

    rerender({ readOnly: false });
    expect(view.state.readOnly).toBe(false);
    expect(handle.view).toBe(view);
  });
});

describe('createEditor — wrap', () => {
  it('toggles CodeMirror line wrapping', () => {
    const { handle, rerender } = mountEngine({ value: 'a' });
    expect(handle.view.contentDOM.classList.contains('cm-lineWrapping')).toBe(false);

    rerender({ wrapLines: true });
    expect(handle.view.contentDOM.classList.contains('cm-lineWrapping')).toBe(true);

    rerender({ wrapLines: false });
    expect(handle.view.contentDOM.classList.contains('cm-lineWrapping')).toBe(false);
  });
});

describe('createEditor — keymaps', () => {
  it('Tab indents, and Escape then Tab leaves focus handling to the browser', () => {
    const { handle } = mountEngine({ value: 'a' });
    const content = handle.view.contentDOM;
    handle.view.dispatch({ selection: { anchor: 0 } });

    keydown(content, 'Tab', 9);
    expect(handle.view.state.doc.toString()).toBe('  a');

    keydown(content, 'Escape', 27);
    keydown(content, 'Tab', 9);
    expect(handle.view.state.doc.toString()).toBe('  a');
  });

  it('Mod-z undoes the last user edit', () => {
    const { handle } = mountEngine({ value: 'a' });
    typeAt(handle.view, 1, 'b');

    // jsdom reports a non-mac platform, so Mod = Ctrl.
    handle.view.contentDOM.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'z',
        keyCode: 90,
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );

    expect(handle.view.state.doc.toString()).toBe('a');
  });

  it('auto-closes brackets on typed input', () => {
    const { handle } = mountEngine({ value: '' });
    const view = handle.view;
    const defaultInsert = () => view.state.update({ changes: { from: 0, insert: '(' } });

    // The DOM layer offers typed text to every EditorView.inputHandler first.
    const handled = view.state
      .facet(EditorView.inputHandler)
      .some(handler => handler(view, 0, 0, '(', defaultInsert));

    expect(handled).toBe(true);
    expect(view.state.doc.toString()).toBe('()');
  });
});
