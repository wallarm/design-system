import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { afterEach, describe, expect, it } from 'vitest';
import { createPortalRegistry } from '../lib/portalRegistry';
import { searchExtension } from './search';

const views: EditorView[] = [];

afterEach(() => {
  for (const view of views.splice(0)) view.destroy();
});

const mountedCss = (): string =>
  Array.from(document.querySelectorAll('style'))
    .map(style => style.textContent ?? '')
    .join('\n');

describe('searchExtension — match highlight theme', () => {
  it('uses visible warning-indicator mixes for matches and the current match', () => {
    const view = new EditorView({
      state: EditorState.create({
        doc: 'foo',
        extensions: [
          searchExtension({ portals: createPortalRegistry(), readOnly: false, testId: undefined }),
        ],
      }),
      parent: document.body,
    });
    views.push(view);

    const css = mountedCss();
    const indicator = 'var(--color-syntax-highlight-warning-indicator)';
    expect(css).toMatch(
      new RegExp(
        String.raw`\.cm-searchMatch \{[^}]*background-color: color-mix\(in oklab, ${indicator.replace(/[()]/g, '\\$&')} 24%, transparent\)`,
      ),
    );
    expect(css).toMatch(
      new RegExp(
        String.raw`\.cm-searchMatch\.cm-searchMatch-selected \{[^}]*background-color: color-mix\(in oklab, ${indicator.replace(/[()]/g, '\\$&')} 48%, transparent\)`,
      ),
    );
    expect(css).toContain(`outline: 1px solid ${indicator}`);
    expect(css).not.toContain('--color-syntax-highlight-warning-highlight');
    expect(css).not.toContain('--color-syntax-highlight-selected-highlight');
  });
});
