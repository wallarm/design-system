// @rstest-environment node

import { describe, expect, it } from '@rstest/core';
import { renderToString } from 'react-dom/server';
import { CodeEditorContent } from './CodeEditorContent';
import { CodeEditorRoot } from './CodeEditorRoot';

describe('CodeEditor SSR', () => {
  it('renders the fallback on the server without touching the DOM', () => {
    expect(typeof document).toBe('undefined');

    let html = '';
    expect(() => {
      html = renderToString(
        <CodeEditorRoot defaultValue='a' data-testid='ssr'>
          <CodeEditorContent aria-label='x' />
        </CodeEditorRoot>,
      );
    }).not.toThrow();

    expect(html).toContain('ssr--fallback');
  });
});
