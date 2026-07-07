import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InlineEdit } from './InlineEdit';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditError } from './InlineEditError';
import { InlineEditInput } from './InlineEditInput';
import { InlineEditPreview } from './InlineEditPreview';

function Example({
  onCommit,
  onRevert,
}: {
  onCommit?: (v: string) => void;
  onRevert?: (v: string) => void;
}) {
  return (
    <InlineEdit
      defaultValue='Checkout API'
      onValueCommit={onCommit}
      onValueRevert={onRevert}
      data-testid='ie'
    >
      <InlineEditPreview>Checkout API</InlineEditPreview>
      <InlineEditControl>
        <InlineEditInput />
      </InlineEditControl>
      <InlineEditError />
    </InlineEdit>
  );
}

describe('InlineEdit standalone integration', () => {
  it('click → type → Enter commits the new value', async () => {
    const onCommit = vi.fn();
    render(<Example onCommit={onCommit} />);
    await userEvent.click(screen.getByTestId('ie--preview'));
    const input = screen.getByTestId('ie--input') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, 'Payments API{Enter}');
    expect(onCommit).toHaveBeenCalledWith('Payments API');
    expect(screen.getByTestId('ie--preview')).toBeInTheDocument();
  });

  it('Escape reverts, calls onValueRevert, and does not commit', async () => {
    const onCommit = vi.fn();
    const onRevert = vi.fn();
    render(<Example onCommit={onCommit} onRevert={onRevert} />);
    await userEvent.click(screen.getByTestId('ie--preview'));
    await userEvent.type(screen.getByTestId('ie--input'), 'x');
    await userEvent.keyboard('{Escape}');
    expect(onCommit).not.toHaveBeenCalled();
    expect(onRevert).toHaveBeenCalledWith('Checkout API');
  });

  it('render-prop editor commits through the same lifecycle', async () => {
    const onCommit = vi.fn();
    render(
      <InlineEdit defaultValue='v' onValueCommit={onCommit} data-testid='rp'>
        <InlineEditPreview>v</InlineEditPreview>
        <InlineEditControl>
          {({ value, setValue }) => (
            <input
              aria-label='raw'
              value={(value as string) ?? ''}
              onChange={e => setValue(e.target.value)}
            />
          )}
        </InlineEditControl>
      </InlineEdit>,
    );
    await userEvent.click(screen.getByTestId('rp--preview'));
    await userEvent.type(screen.getByRole('textbox', { name: 'raw' }), '2{Enter}');
    expect(onCommit).toHaveBeenCalledWith('v2');
  });
});

function deferredBoolean() {
  let resolve!: (ok: boolean) => void;
  const promise = new Promise<boolean>(r => {
    resolve = r;
  });
  return { promise, resolve };
}

describe('InlineEdit commit guard integration', () => {
  function GuardedExample({
    guard,
    onCommit,
    onRevert,
    submitMode,
  }: {
    guard: (value: string, committed: string) => Promise<boolean>;
    onCommit?: (v: string) => void;
    onRevert?: (v: string) => void;
    submitMode?: 'enter' | 'blur' | 'both' | 'none';
  }) {
    return (
      <>
        <InlineEdit
          defaultValue='a@x.io'
          submitMode={submitMode}
          onBeforeValueCommit={guard}
          onValueCommit={onCommit}
          onValueRevert={onRevert}
          data-testid='g'
        >
          <InlineEditPreview>a@x.io</InlineEditPreview>
          <InlineEditControl>
            <InlineEditInput />
          </InlineEditControl>
        </InlineEdit>
        <button type='button'>outside</button>
      </>
    );
  }

  it('ignores focus loss while the guard is pending (submitMode enter would cancel)', async () => {
    const d = deferredBoolean();
    const guard = vi.fn(() => d.promise);
    const onCommit = vi.fn();
    const onRevert = vi.fn();
    render(
      <GuardedExample guard={guard} onCommit={onCommit} onRevert={onRevert} submitMode='enter' />,
    );
    await userEvent.click(screen.getByTestId('g--preview'));
    const input = screen.getByTestId('g--input');
    await userEvent.clear(input);
    await userEvent.type(input, 'b@x.io{Enter}');
    expect(guard).toHaveBeenCalledWith('b@x.io', 'a@x.io');
    await userEvent.click(screen.getByText('outside')); // the dialog stealing focus
    expect(onRevert).not.toHaveBeenCalled();
    expect(screen.getByTestId('g--input')).toHaveValue('b@x.io');
    await act(async () => {
      d.resolve(true);
      await Promise.resolve();
    });
    expect(onCommit).toHaveBeenCalledWith('b@x.io');
  });

  it('does not re-submit on blur while the guard is pending (submitMode both)', async () => {
    const d = deferredBoolean();
    const guard = vi.fn(() => d.promise);
    const onCommit = vi.fn();
    render(<GuardedExample guard={guard} onCommit={onCommit} submitMode='both' />);
    await userEvent.click(screen.getByTestId('g--preview'));
    const input = screen.getByTestId('g--input');
    await userEvent.clear(input);
    await userEvent.type(input, 'b@x.io{Enter}');
    await userEvent.click(screen.getByText('outside'));
    expect(guard).toHaveBeenCalledTimes(1);
    await act(async () => {
      d.resolve(false);
      await Promise.resolve();
    });
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('g--input')).toHaveValue('b@x.io');
  });

  it('leaves focus to the confirmation surface when the guard declines', async () => {
    // The DS does not force focus back to the editor on decline: a modal
    // dialog restores focus to the editor on close, and forcing it here would
    // race that restore and wedge the dialog open. This example's plain button
    // is a non-restoring surface, so focus stays where it left — the field
    // simply remains in edit mode with the draft intact.
    const d = deferredBoolean();
    const guard = vi.fn(() => d.promise);
    render(<GuardedExample guard={guard} />);
    await userEvent.click(screen.getByTestId('g--preview'));
    const input = screen.getByTestId('g--input');
    await userEvent.clear(input);
    await userEvent.type(input, 'b@x.io{Enter}');
    const outside = screen.getByText('outside');
    await userEvent.click(outside); // focus leaves, like a dialog opening
    await act(async () => {
      d.resolve(false);
      await Promise.resolve();
    });
    expect(input).toHaveValue('b@x.io'); // still editing, draft kept
    expect(input).not.toHaveFocus(); // DS did not pull focus back
    expect(outside).toHaveFocus();
  });

  it('invokes the guard once even when it synchronously steals focus', async () => {
    // A guard that opens a dialog imperatively (showModal/.focus()) moves
    // focus inside its own invocation — the resulting blur-submit fires in
    // the same tick, before any re-render. The token is set before the guard
    // runs, so the re-entrant submit must be a no-op.
    const guard = vi.fn(() => {
      screen.getByText('outside').focus();
      return new Promise<boolean>(() => {}); // never settles
    });
    render(<GuardedExample guard={guard} submitMode='both' />);
    await userEvent.click(screen.getByTestId('g--preview'));
    const input = screen.getByTestId('g--input');
    await userEvent.clear(input);
    await userEvent.type(input, 'b@x.io{Enter}');
    expect(guard).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('g--input')).toHaveValue('b@x.io');
  });

  it('Escape during a pending guard cancels and defuses the resolution', async () => {
    const d = deferredBoolean();
    const guard = vi.fn(() => d.promise);
    const onCommit = vi.fn();
    const onRevert = vi.fn();
    render(<GuardedExample guard={guard} onCommit={onCommit} onRevert={onRevert} />);
    await userEvent.click(screen.getByTestId('g--preview'));
    const input = screen.getByTestId('g--input');
    await userEvent.clear(input);
    await userEvent.type(input, 'b@x.io{Enter}');
    await userEvent.keyboard('{Escape}');
    expect(onRevert).toHaveBeenCalledWith('a@x.io');
    await act(async () => {
      d.resolve(true);
      await Promise.resolve();
    });
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('g--preview')).toBeInTheDocument();
  });
});
