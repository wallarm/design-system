import { SearchQuery, setSearchQuery } from '@codemirror/search';
import type { EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { engineOptions } from '../../../testUtils/codeEditorEngine';
import { PortalOutlet } from '../lib/PortalOutlet';
import { createPortalRegistry } from '../lib/portalRegistry';
import { createEditor } from './index';
import type { EditorHandle } from './types';

const handles: EditorHandle[] = [];

const mount = (value: string): EditorHandle => {
  const portals = createPortalRegistry();
  const { container } = render(<PortalOutlet registry={portals} />);
  let handle: EditorHandle | undefined;
  act(() => {
    handle = createEditor(container, engineOptions({ value, testId: 'editor' }), {
      onChange: rs.fn(),
      onDiagnosticsChange: rs.fn(),
      onVisibleRowCountChange: rs.fn(),
      portals,
    });
  });
  if (!handle) throw new Error('editor not created');
  handles.push(handle);
  return handle;
};

/** CodeMirror's live region (engine test: CM class names allowed). Read synchronously. */
const announcements = (view: EditorView): string[] =>
  Array.from(view.dom.querySelectorAll('.cm-announced > div'), node => node.textContent ?? '');

afterEach(() => {
  for (const handle of handles.splice(0)) act(() => handle.destroy());
});

describe('search panel — replace all announcement (spec §7.16)', () => {
  it('announces "Occurrences replaced: N" once when Replace all is clicked', () => {
    const handle = mount('foo bar foo baz foo');
    act(() => handle.api.openSearch());
    act(() => {
      handle.view.dispatch({
        effects: setSearchQuery.of(new SearchQuery({ search: 'foo', replace: 'x' })),
      });
    });

    // fireEvent is synchronous: CM resets the live region 200 ms after an announce.
    fireEvent.click(screen.getByTestId('editor--replace-all'));

    expect(handle.view.state.doc.toString()).toBe('x bar x baz x');
    expect(announcements(handle.view)).toEqual(['Occurrences replaced: 3.']);
  });

  it('announces nothing when there is nothing to replace', () => {
    const handle = mount('foo bar');
    act(() => handle.api.openSearch());
    act(() => {
      handle.view.dispatch({
        effects: setSearchQuery.of(new SearchQuery({ search: 'zzz', replace: 'x' })),
      });
    });
    const before = announcements(handle.view);

    fireEvent.click(screen.getByTestId('editor--replace-all'));

    expect(handle.view.state.doc.toString()).toBe('foo bar');
    expect(announcements(handle.view)).toEqual(before);
    expect(announcements(handle.view)).not.toContain('Occurrences replaced: 0.');
  });
});
