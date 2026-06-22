import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Card } from '../Card';
import { Popover } from '../Popover/Popover';
import { PopoverContent } from '../Popover/PopoverContent';
import { PopoverTrigger } from '../Popover/PopoverTrigger';
import { CodeSnippetActions } from './CodeSnippetActions';
import { CodeSnippetCopyButton } from './CodeSnippetCopyButton';
import { CodeSnippetFullscreenButton } from './CodeSnippetFullscreenButton';
import { CodeSnippetRoot } from './CodeSnippetRoot';
import { CodeSnippetWrapButton } from './CodeSnippetWrapButton';
import { InlineCodeSnippet } from './InlineCodeSnippet';

/**
 * M50 regression suite: the `event.stopPropagation()` calls removed from
 * `CodeSnippetCopyButton`, `CodeSnippetWrapButton`, `CodeSnippetFullscreenButton`,
 * and the shared `useCopyTooltip.handleCopy` (M24) let toolbar/inline clicks
 * bubble to document-level analytics SDKs. These tests prove the removal did
 * not regress the surrounding parent / overlay behavior:
 *  (a) the analytics path still resolves via `closest('[data-analytics-id]')`, and
 *  (b) the enclosing clickable Card / open Popover behaves correctly.
 */
describe('CodeSnippet toolbar inside a clickable Card', () => {
  it('toolbar button clicks resolve analytics without firing the Card onClick', async () => {
    const cardClick = vi.fn();
    const captured = captureAnalyticsClicks();

    render(
      <Card onClick={cardClick}>
        <CodeSnippetRoot code='hello'>
          <CodeSnippetActions>
            <CodeSnippetCopyButton data-testid='copy' data-analytics-id='COPY_CODE' />
            <CodeSnippetWrapButton data-testid='wrap' data-analytics-id='TOGGLE_WRAP' />
            <CodeSnippetFullscreenButton data-testid='fs' data-analytics-id='TOGGLE_FULLSCREEN' />
          </CodeSnippetActions>
        </CodeSnippetRoot>
      </Card>,
    );

    await userEvent.click(screen.getByTestId('copy'));
    await userEvent.click(screen.getByTestId('wrap'));
    await userEvent.click(screen.getByTestId('fs'));

    // (a) each toolbar button resolves to its own analytics id
    expect(captured).toHaveBeenCalledWith('COPY_CODE');
    expect(captured).toHaveBeenCalledWith('TOGGLE_WRAP');
    expect(captured).toHaveBeenCalledWith('TOGGLE_FULLSCREEN');
    // (b) the Card's delegated onClick is shielded by its INTERACTIVE_SELECTORS gate
    expect(cardClick).not.toHaveBeenCalled();
  });
});

describe('CodeSnippet toolbar inside an open Popover', () => {
  it('copy click resolves analytics and does not dismiss the Popover', async () => {
    // Controlled `open` keeps the content mounted; the `onOpenChange` spy
    // detects any dismissal Ark UI would attempt. The DS Popover only exposes
    // controlled `open`, so this is the faithful way to assert "stays open".
    const onOpenChange = vi.fn();

    render(
      <Popover open onOpenChange={onOpenChange}>
        <PopoverTrigger data-testid='trigger'>Open</PopoverTrigger>
        <PopoverContent>
          <CodeSnippetRoot code='hello'>
            <CodeSnippetActions>
              <CodeSnippetCopyButton data-testid='copy' data-analytics-id='COPY_CODE' />
            </CodeSnippetActions>
          </CodeSnippetRoot>
        </PopoverContent>
      </Popover>,
    );

    const copy = await screen.findByTestId('copy');
    const captured = captureAnalyticsClicks();

    await userEvent.click(copy);

    // (a) analytics resolves
    expect(captured).toHaveBeenCalledWith('COPY_CODE');
    // (b) clicking a toolbar button inside the portalled content does not
    // trigger Ark UI's outside-click dismissal — no close is requested
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});

describe('InlineCodeSnippet inside a clickable Card', () => {
  it('copy click resolves analytics without firing the Card onClick', async () => {
    const cardClick = vi.fn();
    const captured = captureAnalyticsClicks();

    render(
      <Card onClick={cardClick}>
        <InlineCodeSnippet
          code='npm install'
          data-testid='inline'
          data-analytics-id='COPY_INLINE'
        />
      </Card>,
    );

    await userEvent.click(screen.getByTestId('inline'));

    // (a) analytics resolves on the inline copy affordance
    expect(captured).toHaveBeenCalledWith('COPY_INLINE');
    // (b) the inline copy affordance is an interactive control, so a click on it
    // must not also fire the enclosing Card's delegated onClick
    expect(cardClick).not.toHaveBeenCalled();
  });
});
