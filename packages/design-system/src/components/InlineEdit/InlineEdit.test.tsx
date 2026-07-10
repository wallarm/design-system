import { StrictMode } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InlineEdit } from './InlineEdit';
import { useInlineEdit } from './InlineEditContext';
import { InlineEditPreview } from './InlineEditPreview';

// Harness exposes context actions as buttons + text.
function Harness() {
  const { editing, value, committedValue, status, invalid, edit, submit, cancel, setValue } =
    useInlineEdit<string>();
  return (
    <div>
      <span data-testid='editing'>{String(editing)}</span>
      <span data-testid='value'>{value}</span>
      <span data-testid='committed'>{committedValue}</span>
      <span data-testid='status'>{status}</span>
      <span data-testid='invalid'>{String(invalid)}</span>
      <button type='button' onClick={() => edit()}>
        edit
      </button>
      <button type='button' onClick={() => setValue('draft')}>
        setDraft
      </button>
      <button type='button' onClick={() => setValue('draft-2')}>
        setDraft2
      </button>
      <button type='button' onClick={() => submit()}>
        submit
      </button>
      <button type='button' onClick={() => cancel()}>
        cancel
      </button>
    </div>
  );
}

describe('InlineEdit', () => {
  it('enters edit mode and seeds the draft from the committed value', async () => {
    render(
      <InlineEdit defaultValue='hello'>
        <Harness />
      </InlineEdit>,
    );
    expect(screen.getByTestId('editing')).toHaveTextContent('false');
    await userEvent.click(screen.getByText('edit'));
    expect(screen.getByTestId('editing')).toHaveTextContent('true');
    expect(screen.getByTestId('value')).toHaveTextContent('hello');
  });

  it('commits the draft synchronously and exits edit', async () => {
    const onCommit = vi.fn();
    render(
      <InlineEdit defaultValue='hello' onValueCommit={onCommit}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit'));
    expect(onCommit).toHaveBeenCalledWith('draft');
    expect(screen.getByTestId('editing')).toHaveTextContent('false');
    expect(screen.getByTestId('committed')).toHaveTextContent('draft');
  });

  it('reverts the draft on cancel', async () => {
    const onRevert = vi.fn();
    render(
      <InlineEdit defaultValue='hello' onValueRevert={onRevert}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('cancel'));
    expect(onRevert).toHaveBeenCalledWith('hello');
    expect(screen.getByTestId('editing')).toHaveTextContent('false');
    expect(screen.getByTestId('committed')).toHaveTextContent('hello');
  });

  it('runs the async lifecycle: loading then saved then idle', async () => {
    let resolve!: () => void;
    const onCommit = vi.fn(
      () =>
        new Promise<void>(r => {
          resolve = r;
        }),
    );
    render(
      <InlineEdit defaultValue='hello' onValueCommit={onCommit} savedDuration={20}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('submit'));
    expect(screen.getByTestId('status')).toHaveTextContent('loading');
    resolve();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('saved'));
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('idle'));
  });

  it('surfaces error and stays editing when the commit rejects', async () => {
    const onCommit = vi.fn(() => Promise.reject(new Error('save failed')));
    render(
      <InlineEdit defaultValue='hello' onValueCommit={onCommit}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('submit'));
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('error'));
    expect(screen.getByTestId('editing')).toHaveTextContent('true');
    expect(screen.getByTestId('invalid')).toHaveTextContent('true');
  });

  it('lets an explicit status prop override the internal machine', () => {
    render(
      <InlineEdit defaultValue='hello' status='error'>
        <Harness />
      </InlineEdit>,
    );
    expect(screen.getByTestId('status')).toHaveTextContent('error');
    expect(screen.getByTestId('invalid')).toHaveTextContent('true');
  });

  it('ignores submit while a commit is already in flight', async () => {
    const onCommit = vi.fn(() => new Promise<void>(() => {})); // never resolves → stays loading
    render(
      <InlineEdit defaultValue='hello' onValueCommit={onCommit}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('submit')); // → loading
    await userEvent.click(screen.getByText('submit')); // ignored
    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it('completes an async commit under StrictMode', async () => {
    const onCommit = vi.fn(() => Promise.resolve());
    render(
      <StrictMode>
        <InlineEdit defaultValue='hello' onValueCommit={onCommit} savedDuration={20}>
          <Harness />
        </InlineEdit>
      </StrictMode>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('submit'));
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('saved'));
    await waitFor(() => expect(screen.getByTestId('editing')).toHaveTextContent('false'));
  });

  it('drops a late async commit resolution after cancel', async () => {
    let resolve!: () => void;
    const onCommit = vi.fn(
      () =>
        new Promise<void>(r => {
          resolve = r;
        }),
    );
    const onRevert = vi.fn();
    render(
      <InlineEdit defaultValue='hello' onValueCommit={onCommit} onValueRevert={onRevert}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit')); // → loading
    await userEvent.click(screen.getByText('cancel')); // user gives up mid-flight
    expect(onRevert).toHaveBeenCalledWith('hello');
    await act(async () => {
      resolve();
      await Promise.resolve();
    });
    // The late resolution must not resurrect the cancelled edit.
    expect(screen.getByTestId('committed')).toHaveTextContent('hello');
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
    expect(screen.getByTestId('editing')).toHaveTextContent('false');
  });
});

describe('InlineEdit onBeforeValueCommit', () => {
  it('blocks the commit when the guard returns false', async () => {
    const onCommit = vi.fn();
    const guard = vi.fn(() => false);
    render(
      <InlineEdit defaultValue='hello' onValueCommit={onCommit} onBeforeValueCommit={guard}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit'));
    expect(guard).toHaveBeenCalledWith('draft', 'hello');
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('editing')).toHaveTextContent('true');
    expect(screen.getByTestId('value')).toHaveTextContent('draft');
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
  });

  it('proceeds when the guard returns true', async () => {
    const onCommit = vi.fn();
    render(
      <InlineEdit defaultValue='hello' onValueCommit={onCommit} onBeforeValueCommit={() => true}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit'));
    expect(onCommit).toHaveBeenCalledWith('draft');
    expect(screen.getByTestId('editing')).toHaveTextContent('false');
    expect(screen.getByTestId('committed')).toHaveTextContent('draft');
  });

  it('proceeds when the guard returns nothing — only explicit false blocks', async () => {
    const onCommit = vi.fn();
    const guard = vi.fn(() => undefined);
    render(
      <InlineEdit defaultValue='hello' onValueCommit={onCommit} onBeforeValueCommit={guard}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit'));
    expect(onCommit).toHaveBeenCalledWith('draft');
  });

  it('maps a synchronous guard throw to the error status and stays editing', async () => {
    const onCommit = vi.fn();
    const guard = vi.fn(() => {
      throw new Error('guard blew up');
    });
    render(
      <InlineEdit defaultValue='hello' onValueCommit={onCommit} onBeforeValueCommit={guard}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('submit'));
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('status')).toHaveTextContent('error');
    expect(screen.getByTestId('editing')).toHaveTextContent('true');
  });

  it('commits after the guard resolves true', async () => {
    const onCommit = vi.fn();
    let resolve!: (ok: boolean) => void;
    const guard = vi.fn(
      () =>
        new Promise<boolean>(r => {
          resolve = r;
        }),
    );
    render(
      <InlineEdit defaultValue='hello' onValueCommit={onCommit} onBeforeValueCommit={guard}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit'));
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('status')).toHaveTextContent('idle'); // no loading during guard
    await act(async () => {
      resolve(true);
      await Promise.resolve();
    });
    expect(onCommit).toHaveBeenCalledWith('draft');
    expect(screen.getByTestId('editing')).toHaveTextContent('false');
    expect(screen.getByTestId('committed')).toHaveTextContent('draft');
  });

  it('stays editing with the draft when the guard resolves false', async () => {
    const onCommit = vi.fn();
    let resolve!: (ok: boolean) => void;
    const guard = vi.fn(
      () =>
        new Promise<boolean>(r => {
          resolve = r;
        }),
    );
    render(
      <InlineEdit defaultValue='hello' onValueCommit={onCommit} onBeforeValueCommit={guard}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit'));
    await act(async () => {
      resolve(false);
      await Promise.resolve();
    });
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('editing')).toHaveTextContent('true');
    expect(screen.getByTestId('value')).toHaveTextContent('draft');
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
  });

  it('runs the async commit lifecycle after guard-true (loading then error, stays editing)', async () => {
    const onCommit = vi.fn(() => Promise.reject(new Error('save failed')));
    render(
      <InlineEdit
        defaultValue='hello'
        onValueCommit={onCommit}
        onBeforeValueCommit={() => Promise.resolve(true)}
      >
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('submit'));
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('error'));
    expect(screen.getByTestId('editing')).toHaveTextContent('true');
  });

  it('runs the async commit lifecycle after guard-true (loading then saved, exits edit)', async () => {
    let resolve!: () => void;
    const onCommit = vi.fn(
      () =>
        new Promise<void>(r => {
          resolve = r;
        }),
    );
    render(
      <InlineEdit
        defaultValue='hello'
        onValueCommit={onCommit}
        onBeforeValueCommit={() => Promise.resolve(true)}
        savedDuration={20}
      >
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit'));
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('loading'));
    await act(async () => {
      resolve();
      await Promise.resolve();
    });
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('saved'));
    expect(onCommit).toHaveBeenCalledWith('draft');
    expect(screen.getByTestId('editing')).toHaveTextContent('false');
    expect(screen.getByTestId('committed')).toHaveTextContent('draft');
  });

  it('suppresses duplicate submits while the guard is pending', async () => {
    const guard = vi.fn(() => new Promise<boolean>(() => {})); // never settles
    render(
      <InlineEdit defaultValue='hello' onBeforeValueCommit={guard}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('submit'));
    await userEvent.click(screen.getByText('submit'));
    expect(guard).toHaveBeenCalledTimes(1);
  });

  it('suppresses duplicate submits even when status is consumer-controlled idle', async () => {
    const guard = vi.fn(() => new Promise<boolean>(() => {}));
    render(
      <InlineEdit defaultValue='hello' status='idle' onBeforeValueCommit={guard}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('submit'));
    await userEvent.click(screen.getByText('submit'));
    expect(guard).toHaveBeenCalledTimes(1);
  });

  it('drops a late guard resolution after cancel', async () => {
    const onCommit = vi.fn();
    const onRevert = vi.fn();
    let resolve!: (ok: boolean) => void;
    const guard = vi.fn(
      () =>
        new Promise<boolean>(r => {
          resolve = r;
        }),
    );
    render(
      <InlineEdit
        defaultValue='hello'
        onValueCommit={onCommit}
        onValueRevert={onRevert}
        onBeforeValueCommit={guard}
      >
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit'));
    await userEvent.click(screen.getByText('cancel'));
    expect(onRevert).toHaveBeenCalledWith('hello');
    await act(async () => {
      resolve(true);
      await Promise.resolve();
    });
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('editing')).toHaveTextContent('false');
    expect(screen.getByTestId('committed')).toHaveTextContent('hello');
  });

  it('drops the resolution when the draft changed while the guard was pending', async () => {
    const onCommit = vi.fn();
    let resolve!: (ok: boolean) => void;
    const guard = vi.fn(
      () =>
        new Promise<boolean>(r => {
          resolve = r;
        }),
    );
    render(
      <InlineEdit defaultValue='hello' onValueCommit={onCommit} onBeforeValueCommit={guard}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit'));
    await userEvent.click(screen.getByText('setDraft2')); // keeps typing while pending
    await act(async () => {
      resolve(true);
      await Promise.resolve();
    });
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('editing')).toHaveTextContent('true');
    expect(screen.getByTestId('value')).toHaveTextContent('draft-2');
  });

  it('maps a guard rejection to the error status and stays editing', async () => {
    const onCommit = vi.fn();
    render(
      <InlineEdit
        defaultValue='hello'
        onValueCommit={onCommit}
        onBeforeValueCommit={() => Promise.reject(new Error('confirm failed'))}
      >
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('submit'));
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('error'));
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('editing')).toHaveTextContent('true');
  });

  it('does not commit when unmounted while the guard is pending', async () => {
    const onCommit = vi.fn();
    let resolve!: (ok: boolean) => void;
    const guard = vi.fn(
      () =>
        new Promise<boolean>(r => {
          resolve = r;
        }),
    );
    const { unmount } = render(
      <InlineEdit defaultValue='hello' onValueCommit={onCommit} onBeforeValueCommit={guard}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit'));
    unmount();
    resolve(true);
    await act(async () => {
      await Promise.resolve();
    });
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('fires onEditChange(false) only after the guard resolves true (controlled edit)', async () => {
    const onEditChange = vi.fn();
    let resolve!: (ok: boolean) => void;
    const guard = vi.fn(
      () =>
        new Promise<boolean>(r => {
          resolve = r;
        }),
    );
    render(
      <InlineEdit value='hello' edit onEditChange={onEditChange} onBeforeValueCommit={guard}>
        <Harness />
      </InlineEdit>,
    );
    await userEvent.click(screen.getByText('setDraft'));
    await userEvent.click(screen.getByText('submit'));
    expect(onEditChange).not.toHaveBeenCalled();
    await act(async () => {
      resolve(true);
      await Promise.resolve();
    });
    expect(onEditChange).toHaveBeenCalledWith(false);
  });
});

describe('InlineEditPreview sizing', () => {
  it('sizes the single-line preview row to match the inline-edit control height (28px)', () => {
    render(
      <InlineEdit defaultValue='ab' data-testid='attr'>
        <InlineEditPreview>ab</InlineEditPreview>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--preview')).toHaveClass('h-28');
  });
});
