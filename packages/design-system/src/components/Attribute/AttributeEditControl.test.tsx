// AttributeEditControl.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AttributeEdit } from './AttributeEdit';
import { AttributeEditControl } from './AttributeEditControl';

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

  it('submits on Enter and cancels on Escape', async () => {
    const onCommit = vi.fn();
    const onRevert = vi.fn();
    render(
      <AttributeEdit
        defaultEdit
        onValueCommit={onCommit}
        onValueRevert={onRevert}
        data-testid='attr'
      >
        <AttributeEditControl>
          <ControlledInput />
        </AttributeEditControl>
      </AttributeEdit>,
    );
    await userEvent.keyboard('{Enter}');
    expect(onCommit).toHaveBeenCalledTimes(1);

    // re-open and Escape
    // (component exits edit on submit; render a fresh tree)
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
});
