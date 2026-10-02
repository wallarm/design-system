import type { EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it } from '@rstest/core';
import { mountEngine, unmountAllEngines } from '../../../testUtils/codeEditorEngine';
import { toggleFoldRegion } from './folds';

const FIVE_LINES = ['line 1', 'line 2', 'line 3', 'line 4', 'line 5'].join('\n');

/**
 * CodeMirror's `aria-live="polite"` region. Each `EditorView.announce` effect of the
 * last update becomes one child `<div>`; CM clears it 200 ms later, so read synchronously.
 */
const announcements = (view: EditorView): string[] =>
  Array.from(view.dom.querySelectorAll('.cm-announced > div'), node => node.textContent ?? '');

afterEach(() => {
  unmountAllEngines();
});

describe('folds — screen-reader announcements (spec §7.16)', () => {
  it('announces "Folded {label}" and "Unfolded {label}" when a region is toggled', () => {
    const { handle } = mountEngine({
      value: FIVE_LINES,
      folds: [{ id: 'headers', startLine: 2, endLine: 4, label: 'Headers' }],
    });

    expect(toggleFoldRegion(handle.view, 'headers')).toBe(true);
    expect(announcements(handle.view)).toEqual(['Folded Headers']);

    expect(toggleFoldRegion(handle.view, 'headers')).toBe(true);
    expect(announcements(handle.view)).toEqual(['Unfolded Headers']);
  });

  it('falls back to the CodeSnippet line-count label when the region has no label', () => {
    const { handle } = mountEngine({
      value: FIVE_LINES,
      folds: [{ id: 'middle', startLine: 2, endLine: 4 }],
    });

    toggleFoldRegion(handle.view, 'middle');

    expect(announcements(handle.view)).toEqual(['Folded 3 lines']);
  });

  it('uses absolute line numbers with startingLineNumber', () => {
    const { handle } = mountEngine({
      value: FIVE_LINES,
      startingLineNumber: 41,
      folds: [{ id: 'middle', startLine: 42, endLine: 45 }],
    });

    toggleFoldRegion(handle.view, 'middle');

    expect(announcements(handle.view)).toEqual(['Folded 4 lines']);
  });

  it('announces nothing for an unknown region id', () => {
    const { handle } = mountEngine({
      value: FIVE_LINES,
      folds: [{ id: 'headers', startLine: 2, endLine: 4, label: 'Headers' }],
    });

    expect(toggleFoldRegion(handle.view, 'missing')).toBe(false);
    expect(announcements(handle.view)).toEqual([]);
  });
});
