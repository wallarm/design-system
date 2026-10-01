import { describe, expect, it, rs } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { CodeEditorContent, CodeEditorRoot } from './index';

rs.mock('./lib/loadEngine', () => ({
  loadEngine: () => Promise.reject(new Error('chunk failed')),
}));

describe('CodeEditor engine load failure', () => {
  it('keeps the fallback text and logs the error', async () => {
    const consoleError = rs.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <CodeEditorRoot data-testid='ed' defaultValue={'a\nb'}>
        <CodeEditorContent aria-label='Code' />
      </CodeEditorRoot>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('ed--fallback')).toHaveAttribute('aria-busy', 'false'),
    );
    expect(screen.getByTestId('ed--fallback')).toHaveTextContent('a');
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load the editor engine'),
      expect.any(Error),
    );
    consoleError.mockRestore();
  });
});
