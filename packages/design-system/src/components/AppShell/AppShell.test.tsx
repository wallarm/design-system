import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppShell } from './AppShell';
import { AppShellAside } from './AppShellAside';
import { AppShellRemote } from './AppShellRemote';
import { ASIDE_SLIDE_EASE, ASIDE_SLIDE_MS } from './constants';

describe('AppShell ambient', () => {
  it('renders the Frame ambient layer by default, hidden from assistive tech', () => {
    render(
      <AppShell data-testid='shell'>
        <AppShellRemote>content</AppShellRemote>
      </AppShell>,
    );

    const ambient = screen.getByTestId('shell--ambient');
    expect(ambient).toHaveAttribute('aria-hidden', 'true');
    // Decorative only: nothing inside is focusable or reachable by pointer.
    expect(ambient.querySelector('button, a, [tabindex]')).toBeNull();
    // Painted under the regions: it precedes them in DOM order.
    const shell = screen.getByTestId('shell');
    expect(shell.firstElementChild).toBe(ambient);
  });

  it('omits the ambient layer when ambient={false}', () => {
    render(
      <AppShell data-testid='shell' ambient={false}>
        <AppShellRemote>content</AppShellRemote>
      </AppShell>,
    );

    expect(screen.queryByTestId('shell--ambient')).toBeNull();
  });

  it('keeps the ambient test id derived from the shell test id only', () => {
    const { container } = render(
      <AppShell>
        <AppShellRemote>content</AppShellRemote>
      </AppShell>,
    );

    const ambient = container.firstElementChild?.firstElementChild;
    expect(ambient).toHaveAttribute('aria-hidden', 'true');
    expect(ambient).not.toHaveAttribute('data-testid');
  });
});

describe('AppShellAside', () => {
  it('renders children in an aside landmark when open', () => {
    render(
      <AppShell data-testid='shell'>
        <AppShellRemote />
        <AppShellAside open aria-label='AI Assistant'>
          panel
        </AppShellAside>
      </AppShell>,
    );

    const aside = screen.getByRole('complementary', { name: 'AI Assistant' });
    expect(aside).toHaveTextContent('panel');
    expect(screen.getByTestId('shell--aside')).toBe(aside);
  });

  it('hides the region but keeps children mounted while closed', async () => {
    const user = userEvent.setup();
    const shell = (open: boolean) => (
      <AppShell data-testid='shell'>
        <AppShellRemote />
        <AppShellAside open={open} aria-label='AI Assistant'>
          <input data-testid='field' />
        </AppShellAside>
      </AppShell>
    );
    const { rerender } = render(shell(true));
    const field = screen.getByTestId('field');
    await user.type(field, 'abc');

    rerender(shell(false));
    const aside = screen.getByTestId('shell--aside');
    expect(aside).toHaveAttribute('hidden');
    // Out of reach the moment it starts closing, not when its exit transition ends.
    expect(aside).toHaveAttribute('inert');
    expect(screen.queryByRole('complementary')).toBeNull();
    // Same node, so whatever state the panel holds survives the close.
    expect(screen.getByTestId('field')).toBe(field);

    rerender(shell(true));
    expect(aside).not.toHaveAttribute('hidden');
    expect(aside).not.toHaveAttribute('inert');
    expect(screen.getByTestId('field')).toHaveValue('abc');
  });

  it('leaves the closed region to the browser [hidden] rule', () => {
    render(
      <AppShell data-testid='shell'>
        <AppShellRemote />
        <AppShellAside open={false}>panel</AppShellAside>
      </AppShell>,
    );

    // No unconditional display utility: one would beat the UA [hidden] rule wherever
    // Tailwind preflight (its display:none !important) is missing.
    const classes = screen.getByTestId('shell--aside').className.split(' ');
    expect(classes).not.toContain('flex');
    expect(classes).toContain('data-[state=open]:flex');
  });

  it('times its slide with the shell motion constants', () => {
    render(
      <AppShell data-testid='shell'>
        <AppShellRemote />
        <AppShellAside open>panel</AppShellAside>
      </AppShell>,
    );

    const shell = screen.getByTestId('shell');
    expect(shell.style.getPropertyValue('--app-shell-aside-duration')).toBe(`${ASIDE_SLIDE_MS}ms`);
    expect(shell.style.getPropertyValue('--app-shell-aside-ease')).toBe(ASIDE_SLIDE_EASE);
  });

  it('sizes the panel from --app-shell-aside-width, which the shell className overrides', () => {
    const shell = (className?: string) => (
      <AppShell data-testid='shell' className={className}>
        <AppShellRemote />
        <AppShellAside open>panel</AppShellAside>
      </AppShell>
    );
    const { rerender } = render(shell());
    // One variable feeds both the panel's width and the shell's track.
    expect(screen.getByTestId('shell--aside').className.split(' ')).toContain(
      'w-(--app-shell-aside-width)',
    );
    expect(screen.getByTestId('shell').className.split(' ')).toContain(
      '[--app-shell-aside-width:--spacing(480)]',
    );

    rerender(shell('[--app-shell-aside-width:400px]'));
    const classes = screen.getByTestId('shell').className.split(' ');
    expect(classes).toContain('[--app-shell-aside-width:400px]');
    expect(classes).not.toContain('[--app-shell-aside-width:--spacing(480)]');
  });

  it('exposes the open state the remote styles against', () => {
    const shell = (open: boolean) => (
      <AppShell data-testid='shell'>
        <AppShellRemote />
        <AppShellAside open={open}>panel</AppShellAside>
      </AppShell>
    );
    const { rerender } = render(shell(true));
    const aside = screen.getByTestId('shell--aside');
    expect(aside).toHaveAttribute('data-state', 'open');

    rerender(shell(false));
    expect(aside).toHaveAttribute('data-state', 'closed');

    // jsdom cannot evaluate the CSS, so pin the hook: the remote restyles itself
    // against an open aside sibling through :has() on that very state.
    expect(screen.getByTestId('shell--remote').className).toContain(
      '[data-slot=app-shell-aside][data-state=open]',
    );
  });

  it('renders no aside region when none is composed', () => {
    render(
      <AppShell data-testid='shell'>
        <AppShellRemote>content</AppShellRemote>
      </AppShell>,
    );

    expect(screen.queryByTestId('shell--aside')).toBeNull();
    expect(screen.queryByRole('complementary')).toBeNull();
  });

  it('keeps the two-column grid unless an aside is composed', () => {
    render(
      <AppShell data-testid='shell'>
        <AppShellRemote>content</AppShellRemote>
      </AppShell>,
    );

    const classes = screen.getByTestId('shell').className.split(' ');
    expect(classes).toContain('[grid-template-areas:"header_header""rail_remote"]');
    expect(classes).toContain('[grid-template-columns:auto_1fr]');
    // The aside's third area and track exist only behind a composed aside, so an extra in-flow
    // child of an aside-less shell still lands in a new row, not a 0px cell at the window edge.
    for (const token of classes.filter(c => c.includes('aside') && c.includes('grid-template'))) {
      expect(token.startsWith('has-[>[data-slot=app-shell-aside]')).toBe(true);
    }
  });

  it('keeps a consumer style next to its own motion variables', () => {
    render(
      <AppShell data-testid='shell' style={{ minWidth: 1024 }}>
        <AppShellRemote />
      </AppShell>,
    );

    const shell = screen.getByTestId('shell');
    expect(shell.style.minWidth).toBe('1024px');
    expect(shell.style.getPropertyValue('--app-shell-aside-duration')).toBe(`${ASIDE_SLIDE_MS}ms`);
  });
});
