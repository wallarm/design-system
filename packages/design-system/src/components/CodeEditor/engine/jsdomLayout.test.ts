import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it } from 'vitest';

describe('jsdom layout stubs (vitest.setup.ts)', () => {
  let parent: HTMLElement | null = null;
  let view: EditorView | null = null;

  afterEach(() => {
    view?.destroy();
    parent?.remove();
    view = null;
    parent = null;
  });

  it('gives Range zero-size client rects', () => {
    const range = document.createRange();
    expect(range.getClientRects()).toHaveLength(0);
    expect([...range.getClientRects()]).toEqual([]);
    expect(range.getBoundingClientRect().width).toBe(0);
    expect(range.getBoundingClientRect().height).toBe(0);
  });

  it('lets CodeMirror measure positions without throwing', () => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
    view = new EditorView({ state: EditorState.create({ doc: 'abc\ndef' }), parent });
    const mounted = view;

    expect(() => mounted.coordsAtPos(2)).not.toThrow();
  });
});
