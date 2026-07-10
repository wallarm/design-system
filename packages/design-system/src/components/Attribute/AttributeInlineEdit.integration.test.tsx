import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  InlineEdit,
  InlineEditControl,
  InlineEditError,
  InlineEditInput,
  InlineEditPreview,
} from '../InlineEdit';
import { Attribute, AttributeLabel, AttributeValue } from './index';

function Example({ onCommit }: { onCommit: (v: string) => void }) {
  return (
    <Attribute data-testid='attr'>
      <AttributeLabel>Name</AttributeLabel>
      <AttributeValue>
        <InlineEdit defaultValue='Checkout API' onValueCommit={onCommit}>
          <InlineEditPreview>Checkout API</InlineEditPreview>
          <InlineEditControl>
            <InlineEditInput />
          </InlineEditControl>
          <InlineEditError />
        </InlineEdit>
      </AttributeValue>
    </Attribute>
  );
}

describe('InlineEdit integration', () => {
  it('click → type → Enter commits the new value', async () => {
    const onCommit = vi.fn();
    render(<Example onCommit={onCommit} />);
    await userEvent.click(screen.getByTestId('attr--preview'));
    const input = screen.getByTestId('attr--input') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, 'Payments API{Enter}');
    expect(onCommit).toHaveBeenCalledWith('Payments API');
    expect(screen.getByTestId('attr--preview')).toBeInTheDocument();
  });

  it('Escape reverts without committing', async () => {
    const onCommit = vi.fn();
    render(<Example onCommit={onCommit} />);
    await userEvent.click(screen.getByTestId('attr--preview'));
    await userEvent.type(screen.getByTestId('attr--input'), 'x');
    await userEvent.keyboard('{Escape}');
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('attr--preview')).toBeInTheDocument();
  });

  it('AttributeValue carries the InlineEdit seam classes for both preview and control', () => {
    render(<Example onCommit={() => {}} />);
    const value = screen.getByTestId('attr--value');
    expect(value.className).toContain('[&_[data-slot=inline-edit-preview]]:-my-4');
    // Regression: the control's own box must get the same row-height
    // cancellation as the preview's, or the row grows by 4px (pt-4 no
    // longer absorbed) the moment editing starts.
    expect(value.className).toContain('[&_[data-slot=inline-edit-control]]:-my-4');
    expect(value.className).toContain('has-[[data-slot=inline-edit]]:overflow-visible');
  });
});
