import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Card } from '../Card';
import {
  CodeSnippetActions,
  CodeSnippetCopyButton,
  CodeSnippetFullscreenButton,
  CodeSnippetHeader,
  CodeSnippetWrapButton,
} from '../CodeSnippet';
import type { FoldRegion } from '../CodeSnippet/lib/foldUtils';
import { Popover } from '../Popover/Popover';
import { PopoverContent } from '../Popover/PopoverContent';
import { PopoverTrigger } from '../Popover/PopoverTrigger';
import { CodeEditorContent, CodeEditorRoot } from './index';

/**
 * CodeEditor counterpart of the CodeSnippet M50 suite. No DS code calls
 * `stopPropagation()`, so clicks reach document-level analytics SDKs, and:
 *  (a) analytics still resolves via `closest('[data-analytics-id]')`;
 *  (b) an enclosing clickable Card stays inert — toolbar/fold buttons via its
 *      interactive-selector gate, the editor surface (contenteditable, no tabindex)
 *      via `data-ds-suppress-parent-click` on the CodeEditorContent wrapper;
 *  (c) an open Popover is not dismissed by clicks inside the editor.
 */

const REQUEST = ['GET /api HTTP/1.1', 'Host: example.com', 'Accept: */*', 'X-Id: 1', ''].join('\n');

const HEADERS_FOLD: FoldRegion[] = [
  {
    id: 'headers',
    startLine: 2,
    endLine: 4,
    label: 'Headers',
    toggleProps: { 'data-analytics-id': 'FOLD_HEADERS' },
  },
];

describe('CodeEditor inside a clickable Card', () => {
  it('toolbar button clicks resolve analytics without firing the Card onClick', async () => {
    const cardClick = vi.fn();
    const captured = captureAnalyticsClicks();

    render(
      <Card onClick={cardClick}>
        <CodeEditorRoot data-testid='ed' defaultValue={REQUEST}>
          <CodeSnippetHeader>
            <CodeSnippetActions>
              <CodeSnippetCopyButton data-analytics-id='COPY_CODE' />
              <CodeSnippetWrapButton data-analytics-id='TOGGLE_WRAP' />
              <CodeSnippetFullscreenButton data-analytics-id='TOGGLE_FULLSCREEN' />
            </CodeSnippetActions>
          </CodeSnippetHeader>
          <CodeEditorContent aria-label='Request' />
        </CodeEditorRoot>
      </Card>,
    );
    await screen.findByTestId('ed--editor');

    await userEvent.click(screen.getByTestId('ed--copy-button'));
    await userEvent.click(screen.getByTestId('ed--wrap-button'));
    await userEvent.click(screen.getByTestId('ed--fullscreen-button'));

    expect(captured).toHaveBeenCalledWith('COPY_CODE');
    expect(captured).toHaveBeenCalledWith('TOGGLE_WRAP');
    expect(captured).toHaveBeenCalledWith('TOGGLE_FULLSCREEN');
    expect(cardClick).not.toHaveBeenCalled();
  });

  it('clicking into the editor or its gutter does not activate the Card', async () => {
    const cardClick = vi.fn();
    const captured = captureAnalyticsClicks();

    render(
      <Card onClick={cardClick}>
        <CodeEditorRoot data-testid='ed' defaultValue={REQUEST}>
          <CodeEditorContent aria-label='Request' lineNumbers data-analytics-id='REQUEST_EDITOR' />
        </CodeEditorRoot>
      </Card>,
    );
    const editor = await screen.findByTestId('ed--editor');

    await userEvent.click(editor);
    await userEvent.click(screen.getByTestId('ed--gutter'));

    // (a) the typing surface resolves to its own analytics id
    expect(captured).toHaveBeenCalledWith('REQUEST_EDITOR');
    // (b) the wrapper's data-ds-suppress-parent-click keeps the Card inert
    expect(screen.getByTestId('ed--content')).toHaveAttribute('data-ds-suppress-parent-click');
    expect(cardClick).not.toHaveBeenCalled();
  });

  it('fold toggle clicks resolve analytics without firing the Card onClick', async () => {
    const cardClick = vi.fn();
    const captured = captureAnalyticsClicks();

    render(
      <Card onClick={cardClick}>
        <CodeEditorRoot data-testid='ed' defaultValue={REQUEST} folds={HEADERS_FOLD}>
          <CodeEditorContent aria-label='Request' />
        </CodeEditorRoot>
      </Card>,
    );

    await userEvent.click(await screen.findByTestId('ed--fold-toggle'));

    expect(captured).toHaveBeenCalledWith('FOLD_HEADERS');
    expect(screen.getByTestId('ed--fold-summary')).toBeInTheDocument();
    expect(cardClick).not.toHaveBeenCalled();
  });

  it('still activates the Card for clicks outside the editor', async () => {
    const cardClick = vi.fn();

    render(
      <Card onClick={cardClick}>
        <span data-testid='card-text'>Rule request</span>
        <CodeEditorRoot data-testid='ed' defaultValue={REQUEST}>
          <CodeEditorContent aria-label='Request' />
        </CodeEditorRoot>
      </Card>,
    );
    await screen.findByTestId('ed--editor');

    await userEvent.click(screen.getByTestId('card-text'));

    // the suppression is scoped to the editor wrapper, not the whole Card
    expect(cardClick).toHaveBeenCalledTimes(1);
  });
});

describe('CodeEditor inside an open Popover', () => {
  it('editor and toolbar clicks resolve analytics and do not dismiss the Popover', async () => {
    // Controlled `open` keeps the content mounted; the spy detects any dismissal.
    const onOpenChange = vi.fn();

    render(
      <Popover open onOpenChange={onOpenChange}>
        <PopoverTrigger data-testid='trigger'>Open</PopoverTrigger>
        <PopoverContent>
          <CodeEditorRoot data-testid='ed' defaultValue={REQUEST}>
            <CodeSnippetHeader>
              <CodeSnippetActions>
                <CodeSnippetCopyButton data-analytics-id='COPY_CODE' />
              </CodeSnippetActions>
            </CodeSnippetHeader>
            <CodeEditorContent aria-label='Request' data-analytics-id='REQUEST_EDITOR' />
          </CodeEditorRoot>
        </PopoverContent>
      </Popover>,
    );
    const editor = await screen.findByTestId('ed--editor');
    const captured = captureAnalyticsClicks();

    await userEvent.click(editor);
    await userEvent.click(screen.getByTestId('ed--copy-button'));

    expect(captured).toHaveBeenCalledWith('REQUEST_EDITOR');
    expect(captured).toHaveBeenCalledWith('COPY_CODE');
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
