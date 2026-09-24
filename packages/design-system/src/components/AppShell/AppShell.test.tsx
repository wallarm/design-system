import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppShell } from './AppShell';
import { AppShellRemote } from './AppShellRemote';

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
