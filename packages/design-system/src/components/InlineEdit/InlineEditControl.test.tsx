// InlineEditControl.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InlineEdit } from './InlineEdit';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditPreview } from './InlineEditPreview';

function ControlledInput() {
  return <input data-testid='editor' defaultValue='hello' />;
}

describe('InlineEditControl', () => {
  it('renders nothing when not editing', () => {
    render(
      <InlineEdit defaultValue='hello' data-testid='attr'>
        <InlineEditControl>
          <ControlledInput />
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.queryByTestId('attr--control')).toBeNull();
  });

  it('focuses the editor on entering edit mode', () => {
    render(
      <InlineEdit defaultEdit data-testid='attr'>
        <InlineEditControl>
          <ControlledInput />
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.getByTestId('editor')).toHaveFocus();
  });

  it('submits on Enter', async () => {
    const onCommit = vi.fn();
    render(
      <InlineEdit defaultEdit onValueCommit={onCommit} data-testid='attr'>
        <InlineEditControl>
          <ControlledInput />
        </InlineEditControl>
      </InlineEdit>,
    );
    await userEvent.keyboard('{Enter}');
    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it('cancels on Escape', async () => {
    const onRevert = vi.fn();
    render(
      <InlineEdit defaultEdit onValueRevert={onRevert} data-testid='attr'>
        <InlineEditControl>
          <ControlledInput />
        </InlineEditControl>
      </InlineEdit>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onRevert).toHaveBeenCalledTimes(1);
  });

  it('focuses the editor when entering edit via the preview (click flow)', async () => {
    render(
      <InlineEdit defaultValue='hello' data-testid='attr'>
        <InlineEditPreview>hello</InlineEditPreview>
        <InlineEditControl>
          <input data-testid='editor' defaultValue='hello' />
        </InlineEditControl>
      </InlineEdit>,
    );
    await userEvent.click(screen.getByTestId('attr--preview'));
    expect(screen.getByTestId('editor')).toHaveFocus();
  });

  it('does not cancel on blur when submitMode is "none"', async () => {
    const onRevert = vi.fn();
    render(
      <InlineEdit defaultEdit submitMode='none' onValueRevert={onRevert} data-testid='attr'>
        <InlineEditControl>
          <ControlledInput />
        </InlineEditControl>
        <button type='button'>outside</button>
      </InlineEdit>,
    );
    screen.getByTestId('editor').focus();
    await userEvent.click(screen.getByText('outside'));
    expect(onRevert).not.toHaveBeenCalled();
    // still editing — the control stays mounted
    expect(screen.getByTestId('attr--control')).toBeInTheDocument();
  });
});
