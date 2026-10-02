import type { ReactElement } from 'react';
import { describe, expect, it } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { CodeSnippetActions, CodeSnippetFullscreenButton, CodeSnippetHeader } from '../CodeSnippet';
import type { FoldRegion } from '../CodeSnippet/lib/foldUtils';
import { CodeEditorContent, CodeEditorRoot } from './index';

/** Characters an SDK payload may contain — must reach the DOM byte-for-byte. */
const PAYLOAD = '{"rule":"r-1","path":"/api/v1?x=1&y=\\"2\\"","tags":["a","b"],"n":0.5}';
const FIVE_LINES = ['line 1', 'line 2', 'line 3', 'line 4', 'line 5'].join('\n');

const editorUi = (readOnly: boolean): ReactElement => (
  <CodeEditorRoot
    data-testid='ed'
    defaultValue={FIVE_LINES}
    readOnly={readOnly}
    data-analytics-id='RULE_EDITOR'
  >
    <CodeSnippetHeader>
      <CodeSnippetActions>
        <CodeSnippetFullscreenButton data-analytics-id='TOGGLE_FULLSCREEN' />
      </CodeSnippetActions>
    </CodeSnippetHeader>
    <CodeEditorContent
      aria-label='Request'
      data-analytics-id='REQUEST_EDITOR'
      data-analytics-props={PAYLOAD}
    />
  </CodeEditorRoot>
);

describe('CodeEditor analytics attributes', () => {
  it('lands data-analytics-* from CodeEditorContent on the editor node, unchanged', async () => {
    const captured = captureAnalyticsClicks();
    render(editorUi(false));
    const editor = await screen.findByTestId('ed--editor');

    expect(editor).toHaveAttribute('data-analytics-id', 'REQUEST_EDITOR');
    expect(editor.getAttribute('data-analytics-props')).toBe(PAYLOAD);
    expect(screen.getByTestId('ed--content')).not.toHaveAttribute('data-analytics-id');
    expect(screen.getByTestId('ed--content')).not.toHaveAttribute('data-analytics-props');

    await userEvent.click(editor);

    // the nearest id wins over the root's container-level id
    expect(captured).toHaveBeenLastCalledWith('REQUEST_EDITOR');
  });

  it('keeps the attributes on the same node across a readOnly toggle', async () => {
    const captured = captureAnalyticsClicks();
    const { rerender } = render(editorUi(false));
    const editor = await screen.findByTestId('ed--editor');

    rerender(editorUi(true));
    await waitFor(() => expect(editor).toHaveAttribute('aria-readonly', 'true'));

    expect(screen.getByTestId('ed--editor')).toBe(editor);
    expect(editor).toHaveAttribute('data-analytics-id', 'REQUEST_EDITOR');
    expect(editor.getAttribute('data-analytics-props')).toBe(PAYLOAD);

    rerender(editorUi(false));
    await waitFor(() => expect(editor).not.toHaveAttribute('aria-readonly'));
    expect(editor).toHaveAttribute('data-analytics-id', 'REQUEST_EDITOR');
    expect(editor.getAttribute('data-analytics-props')).toBe(PAYLOAD);

    await userEvent.click(editor);
    expect(captured).toHaveBeenLastCalledWith('REQUEST_EDITOR');
  });

  it('keeps editor and root attributes through a fullscreen round trip', async () => {
    const captured = captureAnalyticsClicks();
    render(editorUi(false));
    const editor = await screen.findByTestId('ed--editor');

    await userEvent.click(screen.getByTestId('ed--fullscreen-button'));
    expect(captured).toHaveBeenLastCalledWith('TOGGLE_FULLSCREEN');
    expect(screen.getByTestId('ed--fullscreen-button')).toHaveAccessibleName('Exit full screen');

    expect(screen.getByTestId('ed--editor')).toBe(editor);
    expect(editor).toHaveAttribute('data-analytics-id', 'REQUEST_EDITOR');
    expect(editor.getAttribute('data-analytics-props')).toBe(PAYLOAD);
    expect(screen.getByTestId('ed')).toHaveAttribute('data-analytics-id', 'RULE_EDITOR');

    await userEvent.click(editor);
    expect(captured).toHaveBeenLastCalledWith('REQUEST_EDITOR');

    await userEvent.click(screen.getByTestId('ed--fullscreen-button'));
    expect(screen.getByTestId('ed--fullscreen-button')).toHaveAccessibleName('Enter full screen');
    expect(editor).toHaveAttribute('data-analytics-id', 'REQUEST_EDITOR');
    expect(editor.getAttribute('data-analytics-props')).toBe(PAYLOAD);
  });
});

describe('CodeEditor fold analytics (toggleProps / summaryProps)', () => {
  const FOLDS: FoldRegion[] = [
    {
      id: 'headers',
      startLine: 2,
      endLine: 4,
      label: 'Headers',
      toggleProps: { 'data-analytics-id': 'FOLD_HEADERS', 'data-analytics-props': PAYLOAD },
      summaryProps: { 'data-analytics-id': 'EXPAND_HEADERS', 'data-analytics-props': PAYLOAD },
    },
  ];

  it('forwards toggleProps and summaryProps analytics attributes to the real buttons', async () => {
    const captured = captureAnalyticsClicks();
    render(
      <CodeEditorRoot data-testid='ed' defaultValue={FIVE_LINES} folds={FOLDS}>
        <CodeEditorContent aria-label='Request' data-analytics-id='REQUEST_EDITOR' />
      </CodeEditorRoot>,
    );

    const toggle = await screen.findByTestId('ed--fold-toggle');
    expect(toggle.tagName).toBe('BUTTON');
    expect(toggle).toHaveAttribute('data-analytics-id', 'FOLD_HEADERS');
    expect(toggle.getAttribute('data-analytics-props')).toBe(PAYLOAD);
    expect(toggle).toHaveAttribute('aria-label', 'Collapse Headers');

    await userEvent.click(toggle);
    expect(captured).toHaveBeenLastCalledWith('FOLD_HEADERS');

    // attributes survive the collapsed-state re-render of the toggle
    const collapsedToggle = screen.getByTestId('ed--fold-toggle');
    expect(collapsedToggle).toHaveAttribute('aria-label', 'Expand Headers');
    expect(collapsedToggle).toHaveAttribute('data-analytics-id', 'FOLD_HEADERS');

    const summary = screen.getByTestId('ed--fold-summary');
    expect(summary.tagName).toBe('BUTTON');
    expect(summary).toHaveAttribute('data-analytics-id', 'EXPAND_HEADERS');
    expect(summary.getAttribute('data-analytics-props')).toBe(PAYLOAD);

    await userEvent.click(summary);
    expect(captured).toHaveBeenLastCalledWith('EXPAND_HEADERS');
    expect(screen.queryByTestId('ed--fold-summary')).not.toBeInTheDocument();
  });
});
