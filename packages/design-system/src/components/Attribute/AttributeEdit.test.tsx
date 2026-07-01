import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AttributeEdit } from './AttributeEdit';
import { useAttributeEdit } from './AttributeEditContext';

// Harness exposes context actions as buttons + text.
function Harness() {
  const { editing, value, committedValue, status, invalid, edit, submit, cancel, setValue } =
    useAttributeEdit<string>();
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
      <button type='button' onClick={() => submit()}>
        submit
      </button>
      <button type='button' onClick={() => cancel()}>
        cancel
      </button>
    </div>
  );
}

describe('AttributeEdit', () => {
  it('enters edit mode and seeds the draft from the committed value', async () => {
    render(
      <AttributeEdit defaultValue='hello'>
        <Harness />
      </AttributeEdit>,
    );
    expect(screen.getByTestId('editing')).toHaveTextContent('false');
    await userEvent.click(screen.getByText('edit'));
    expect(screen.getByTestId('editing')).toHaveTextContent('true');
    expect(screen.getByTestId('value')).toHaveTextContent('hello');
  });

  it('commits the draft synchronously and exits edit', async () => {
    const onCommit = vi.fn();
    render(
      <AttributeEdit defaultValue='hello' onValueCommit={onCommit}>
        <Harness />
      </AttributeEdit>,
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
      <AttributeEdit defaultValue='hello' onValueRevert={onRevert}>
        <Harness />
      </AttributeEdit>,
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
      <AttributeEdit defaultValue='hello' onValueCommit={onCommit} savedDuration={20}>
        <Harness />
      </AttributeEdit>,
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
      <AttributeEdit defaultValue='hello' onValueCommit={onCommit}>
        <Harness />
      </AttributeEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('submit'));
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('error'));
    expect(screen.getByTestId('editing')).toHaveTextContent('true');
    expect(screen.getByTestId('invalid')).toHaveTextContent('true');
  });

  it('lets explicit status/error props override the internal machine', () => {
    render(
      <AttributeEdit defaultValue='hello' status='error' error='bad'>
        <Harness />
      </AttributeEdit>,
    );
    expect(screen.getByTestId('status')).toHaveTextContent('error');
    expect(screen.getByTestId('invalid')).toHaveTextContent('true');
  });

  it('ignores submit while a commit is already in flight', async () => {
    const onCommit = vi.fn(() => new Promise<void>(() => {})); // never resolves → stays loading
    render(
      <AttributeEdit defaultValue='hello' onValueCommit={onCommit}>
        <Harness />
      </AttributeEdit>,
    );
    await userEvent.click(screen.getByText('edit'));
    await userEvent.click(screen.getByText('submit')); // → loading
    await userEvent.click(screen.getByText('submit')); // ignored
    expect(onCommit).toHaveBeenCalledTimes(1);
  });
});
