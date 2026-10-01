import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CodeEditorContent, CodeEditorRoot } from './index';

describe('CodeEditor — diff mode (original)', () => {
  it('shows deleted rows and +/- prefixes against `original`, and drops them without it', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <CodeEditorRoot data-testid='ed' value={'a\nb\nc'} onChange={onChange} original={'a\nold\nc'}>
        <CodeEditorContent aria-label='Diff' lineNumbers />
      </CodeEditorRoot>,
    );

    const editor = await screen.findByTestId('ed--editor');
    await waitFor(() => expect(screen.getByTestId('ed--gutter')).toHaveTextContent('-'));
    expect(screen.getByTestId('ed--gutter')).toHaveTextContent('+');
    // The deleted original line is rendered (as a read-only widget) inside the editor.
    expect(editor).toHaveTextContent('old');

    rerender(
      <CodeEditorRoot data-testid='ed' value={'a\nb\nc'} onChange={onChange}>
        <CodeEditorContent aria-label='Diff' lineNumbers />
      </CodeEditorRoot>,
    );

    await waitFor(() => expect(screen.getByTestId('ed--editor')).not.toHaveTextContent('old'));
    expect(screen.getByTestId('ed--gutter')).not.toHaveTextContent('+');
    expect(screen.getByTestId('ed--gutter')).not.toHaveTextContent('-');
    // Diffing never edits the value.
    expect(onChange).not.toHaveBeenCalled();
  });
});
