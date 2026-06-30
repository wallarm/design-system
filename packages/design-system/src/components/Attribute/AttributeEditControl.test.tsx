// AttributeEditControl.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AttributeEdit } from './AttributeEdit';
import { AttributeEditControl } from './AttributeEditControl';
import { AttributeEditPreview } from './AttributeEditPreview';

function ControlledInput() {
  return <input data-testid='editor' defaultValue='hello' />;
}

describe('AttributeEditControl', () => {
  it('renders nothing when not editing', () => {
    render(
      <AttributeEdit defaultValue='hello' data-testid='attr'>
        <AttributeEditControl>
          <ControlledInput />
        </AttributeEditControl>
      </AttributeEdit>,
    );
    expect(screen.queryByTestId('attr--edit-control')).toBeNull();
  });

  it('focuses the editor on entering edit mode', () => {
    render(
      <AttributeEdit defaultEdit data-testid='attr'>
        <AttributeEditControl>
          <ControlledInput />
        </AttributeEditControl>
      </AttributeEdit>,
    );
    expect(screen.getByTestId('editor')).toHaveFocus();
  });

  it('submits on Enter', async () => {
    const onCommit = vi.fn();
    render(
      <AttributeEdit defaultEdit onValueCommit={onCommit} data-testid='attr'>
        <AttributeEditControl>
          <ControlledInput />
        </AttributeEditControl>
      </AttributeEdit>,
    );
    await userEvent.keyboard('{Enter}');
    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it('cancels on Escape', async () => {
    const onRevert = vi.fn();
    render(
      <AttributeEdit defaultEdit onValueRevert={onRevert} data-testid='attr'>
        <AttributeEditControl>
          <ControlledInput />
        </AttributeEditControl>
      </AttributeEdit>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onRevert).toHaveBeenCalledTimes(1);
  });

  it('focuses the editor when entering edit via the preview (click flow)', async () => {
    render(
      <AttributeEdit defaultValue='hello' data-testid='attr'>
        <AttributeEditPreview>hello</AttributeEditPreview>
        <AttributeEditControl>
          <input data-testid='editor' defaultValue='hello' />
        </AttributeEditControl>
      </AttributeEdit>,
    );
    await userEvent.click(screen.getByTestId('attr--edit-preview'));
    expect(screen.getByTestId('editor')).toHaveFocus();
  });

  it('does not cancel on blur when submitMode is "none"', async () => {
    const onRevert = vi.fn();
    render(
      <AttributeEdit defaultEdit submitMode='none' onValueRevert={onRevert} data-testid='attr'>
        <AttributeEditControl>
          <ControlledInput />
        </AttributeEditControl>
        <button type='button'>outside</button>
      </AttributeEdit>,
    );
    screen.getByTestId('editor').focus();
    await userEvent.click(screen.getByText('outside'));
    expect(onRevert).not.toHaveBeenCalled();
    // still editing — the control stays mounted
    expect(screen.getByTestId('attr--edit-control')).toBeInTheDocument();
  });
});
