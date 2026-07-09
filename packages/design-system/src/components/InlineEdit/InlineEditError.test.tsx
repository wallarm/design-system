import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InlineEdit } from './InlineEdit';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditError } from './InlineEditError';
import { InlineEditInput } from './InlineEditInput';

describe('InlineEditError', () => {
  it('renders nothing when valid', () => {
    render(
      <InlineEdit defaultValue='x' data-testid='attr'>
        <InlineEditError />
      </InlineEdit>,
    );
    expect(screen.queryByTestId('attr--error')).toBeNull();
  });

  it('renders the auto-error message from a rejected commit when no children are given', async () => {
    const onCommit = vi.fn(() => Promise.reject(new Error('An error message.')));
    render(
      <InlineEdit defaultValue='x' onValueCommit={onCommit} defaultEdit data-testid='attr'>
        <InlineEditControl>
          <InlineEditInput />
        </InlineEditControl>
        <InlineEditError />
      </InlineEdit>,
    );
    await userEvent.type(screen.getByTestId('attr--input'), '{Enter}');
    await waitFor(() =>
      expect(screen.getByTestId('attr--error')).toHaveTextContent('An error message.'),
    );
  });

  it('prefers explicit children over the auto-error message', async () => {
    const onCommit = vi.fn(() => Promise.reject(new Error('ctx')));
    render(
      <InlineEdit defaultValue='x' onValueCommit={onCommit} defaultEdit data-testid='attr'>
        <InlineEditControl>
          <InlineEditInput />
        </InlineEditControl>
        <InlineEditError>custom</InlineEditError>
      </InlineEdit>,
    );
    await userEvent.type(screen.getByTestId('attr--input'), '{Enter}');
    await waitFor(() => expect(screen.getByTestId('attr--error')).toHaveTextContent('custom'));
  });
});
