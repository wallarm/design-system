import { describe, expect, it, rs } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTitle } from '../Drawer';
import { CodeSnippetActions } from './CodeSnippetActions';
import { CodeSnippetCode } from './CodeSnippetCode';
import { CodeSnippetContent } from './CodeSnippetContent';
import { CodeSnippetCopyButton } from './CodeSnippetCopyButton';
import { CodeSnippetFullscreenButton } from './CodeSnippetFullscreenButton';
import { CodeSnippetRoot } from './CodeSnippetRoot';

const renderInDrawer = (onCopy = rs.fn()) =>
  render(
    <Drawer open>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <CodeSnippetRoot code='const a = 1;' data-testid='snippet'>
            <CodeSnippetActions>
              <CodeSnippetFullscreenButton />
              <CodeSnippetCopyButton data-testid='copy' onClick={onCopy} />
            </CodeSnippetActions>
            <CodeSnippetContent>
              <CodeSnippetCode />
            </CodeSnippetContent>
          </CodeSnippetRoot>
        </DrawerBody>
      </DrawerContent>
    </Drawer>,
  );

/**
 * Both focus traps activate in a requestAnimationFrame: the drawer's on open,
 * the fullscreen frame's on entering fullscreen. focus-trap puts the one
 * activated last on top, so on a loaded runner the drawer's could land after
 * the frame's and pull Tab back to the dialog. Each wait below lets one trap
 * activate before the next step, as a user's pace does:
 * - the drawer's trap moves focus into the dialog when it activates;
 * - the frame's trap does not move focus (the button keeps it), and frames run
 *   in order, so one frame after entering fullscreen it is in place.
 */
const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

/** The modal drawer sets `pointer-events: none` on <body> in a microtask after opening. */
const waitForModal = async () => {
  await waitFor(() => expect(document.body.style.pointerEvents).toBe('none'));
  await waitFor(() =>
    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement),
  );
};

describe('CodeSnippet fullscreen inside a modal Drawer', () => {
  it('keeps the header buttons clickable (user-event refuses pointer-events: none)', async () => {
    const user = userEvent.setup();
    const onCopy = rs.fn();
    renderInDrawer(onCopy);
    await waitForModal();

    await user.click(screen.getByTestId('snippet--fullscreen-button'));
    expect(screen.getByTestId('snippet')).toHaveClass('fixed');

    await user.click(screen.getByTestId('copy'));
    expect(onCopy).toHaveBeenCalledOnce();

    await user.click(screen.getByTestId('snippet--fullscreen-button'));
    expect(screen.getByTestId('snippet')).not.toHaveClass('fixed');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('Escape exits fullscreen only; the drawer stays open', async () => {
    const user = userEvent.setup();
    renderInDrawer();
    await waitForModal();

    await user.click(screen.getByTestId('snippet--fullscreen-button'));
    await user.keyboard('{Escape}');

    expect(screen.getByTestId('snippet')).not.toHaveClass('fixed');
    expect(screen.getByRole('dialog')).toHaveAttribute('data-state', 'open');
  });

  it('keeps Tab inside the fullscreen frame and returns focus to the button on exit', async () => {
    const user = userEvent.setup();
    renderInDrawer();
    await waitForModal();

    await user.click(screen.getByTestId('snippet--fullscreen-button'));
    await nextFrame();
    const frame = screen.getByTestId('snippet');
    for (let i = 0; i < 4; i++) {
      await user.tab();
      expect(frame).toContainElement(document.activeElement as HTMLElement);
    }

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.getByTestId('snippet--fullscreen-button')).toHaveFocus());
  });

  it('a backdrop click exits fullscreen without closing the drawer', async () => {
    const user = userEvent.setup();
    renderInDrawer();
    await waitForModal();

    await user.click(screen.getByTestId('snippet--fullscreen-button'));
    await user.click(screen.getByTestId('snippet--backdrop'));

    expect(screen.getByTestId('snippet')).not.toHaveClass('fixed');
    expect(screen.getByRole('dialog')).toHaveAttribute('data-state', 'open');
  });

  it('leaves fullscreen when the drawer is closed from outside', async () => {
    const user = userEvent.setup();
    const { rerender } = renderInDrawer();
    await waitForModal();
    await user.click(screen.getByTestId('snippet--fullscreen-button'));

    rerender(
      <Drawer open={false}>
        <DrawerContent>
          <DrawerBody>
            <CodeSnippetRoot code='const a = 1;' data-testid='snippet'>
              <CodeSnippetActions>
                <CodeSnippetFullscreenButton />
              </CodeSnippetActions>
              <CodeSnippetContent>
                <CodeSnippetCode />
              </CodeSnippetContent>
            </CodeSnippetRoot>
          </DrawerBody>
        </DrawerContent>
      </Drawer>,
    );

    await waitFor(() => expect(screen.queryByTestId('snippet--backdrop')).not.toBeInTheDocument());
    await waitFor(() => expect(document.body.style.pointerEvents).toBe(''));
  });
});
