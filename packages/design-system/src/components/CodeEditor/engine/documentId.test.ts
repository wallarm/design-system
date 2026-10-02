import { undo } from '@codemirror/commands';
import { afterEach, describe, expect, it } from '@rstest/core';
import { mountEngine, typeAt, unmountAllEngines } from '../../../testUtils/codeEditorEngine';

afterEach(() => {
  unmountAllEngines();
});

describe('createEditor — documentId state cache', () => {
  it('keeps undo history per document', () => {
    const { handle, rerender } = mountEngine({ value: 'aaa', documentId: 'a' });
    typeAt(handle.view, 3, '1');

    rerender({ documentId: 'b', value: 'bbb' });
    expect(handle.view.state.doc.toString()).toBe('bbb');
    // A fresh document has no history of its own.
    expect(undo(handle.view)).toBe(false);
    typeAt(handle.view, 3, '2');

    rerender({ documentId: 'a', value: 'aaa1' });
    expect(handle.view.state.doc.toString()).toBe('aaa1');
    expect(undo(handle.view)).toBe(true);
    expect(handle.view.state.doc.toString()).toBe('aaa');
    expect(undo(handle.view)).toBe(false);

    rerender({ documentId: 'b', value: 'bbb2' });
    expect(handle.view.state.doc.toString()).toBe('bbb2');
    expect(undo(handle.view)).toBe(true);
    expect(handle.view.state.doc.toString()).toBe('bbb');
  });

  it('restores the selection of a cached document', () => {
    const { handle, rerender } = mountEngine({ value: 'first doc', documentId: 'a' });
    handle.view.dispatch({ selection: { anchor: 2, head: 5 } });

    rerender({ documentId: 'b', value: 'second' });
    expect(handle.view.state.selection.main.head).toBe(0);

    rerender({ documentId: 'a', value: 'first doc' });
    expect(handle.view.state.selection.main.anchor).toBe(2);
    expect(handle.view.state.selection.main.head).toBe(5);
  });

  it('syncs a value that changed while the document was hidden, without onChange or history', () => {
    const { handle, callbacks, rerender } = mountEngine({ value: 'aaa', documentId: 'a' });

    rerender({ documentId: 'b', value: 'bbb' });
    rerender({ documentId: 'a', value: 'aaa (updated elsewhere)' });

    expect(handle.view.state.doc.toString()).toBe('aaa (updated elsewhere)');
    expect(callbacks.onChange).not.toHaveBeenCalled();
    expect(undo(handle.view)).toBe(false);
  });

  it('applies options that changed while a document was cached', () => {
    const { handle, rerender } = mountEngine({ value: 'aaa', documentId: 'a' });

    rerender({ documentId: 'b', value: 'bbb' });
    rerender({ readOnly: true, wrapLines: true });
    rerender({ documentId: 'a', value: 'aaa' });

    expect(handle.view.state.readOnly).toBe(true);
    expect(handle.view.contentDOM.classList.contains('cm-lineWrapping')).toBe(true);
  });

  it('reports the row count of the document swapped in', () => {
    const { callbacks, rerender } = mountEngine({ value: 'a', documentId: 'a' });

    rerender({ documentId: 'b', value: 'b\nb\nb' });
    expect(callbacks.onVisibleRowCountChange).toHaveBeenLastCalledWith(3);

    rerender({ documentId: 'a', value: 'a' });
    expect(callbacks.onVisibleRowCountChange).toHaveBeenLastCalledWith(1);
  });

  it('treats a switch to no documentId as a fresh document', () => {
    const { handle, rerender } = mountEngine({ value: 'aaa', documentId: 'a' });
    typeAt(handle.view, 3, '1');

    rerender({ documentId: undefined, value: 'plain' });

    expect(handle.view.state.doc.toString()).toBe('plain');
    expect(undo(handle.view)).toBe(false);
  });
});
