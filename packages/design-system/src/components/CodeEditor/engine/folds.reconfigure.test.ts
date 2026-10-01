import { Compartment, EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it } from 'vitest';
import type { FoldRegion } from '../../CodeSnippet/lib/foldUtils';
import { createPortalRegistry } from '../lib/portalRegistry';
import type { CodeEditorFolds } from '../types';
import { foldsExtension, getCollapsedFoldIds, getVisibleRowCount, toggleFoldRegion } from './folds';

const DOC = ['a', 'b', 'c', 'd', 'e', 'f'].join('\n');
const portals = createPortalRegistry();
const views: EditorView[] = [];

const build = (folds: CodeEditorFolds | undefined) =>
  foldsExtension({ folds, startingLineNumber: 1, portals, testId: undefined }).extension;

afterEach(() => {
  for (const view of views.splice(0)) view.destroy();
});

describe('foldsExtension — reconfigure', () => {
  it('keeps collapsed ids across a static-array reconfigure and applies new defaults once', () => {
    const compartment = new Compartment();
    const first: FoldRegion[] = [{ id: 'a', startLine: 1, endLine: 2 }];
    const view = new EditorView({
      state: EditorState.create({ doc: DOC, extensions: [compartment.of(build(first))] }),
    });
    views.push(view);
    toggleFoldRegion(view, 'a');

    view.dispatch({
      effects: compartment.reconfigure(
        build([
          { id: 'a', startLine: 1, endLine: 3 },
          { id: 'b', startLine: 5, endLine: 6, defaultCollapsed: true },
        ]),
      ),
    });

    expect([...getCollapsedFoldIds(view.state)].sort()).toEqual(['a', 'b']);
    expect(getVisibleRowCount(view.state)).toBe(3);

    view.dispatch({
      effects: compartment.reconfigure(build([{ id: 'b', startLine: 5, endLine: 6 }])),
    });
    expect([...getCollapsedFoldIds(view.state)]).toEqual(['b']);

    view.dispatch({ effects: compartment.reconfigure(build(undefined)) });
    expect(getCollapsedFoldIds(view.state).size).toBe(0);
    expect(getVisibleRowCount(view.state)).toBe(6);
  });

  it('returns the plain line count when the extension is absent', () => {
    expect(getVisibleRowCount(EditorState.create({ doc: DOC }))).toBe(6);
    expect(getCollapsedFoldIds(EditorState.create({ doc: DOC })).size).toBe(0);
  });
});
