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
import type { AttributeOrientation } from './AttributeOrientationContext';
import { Attribute, AttributeLabel, AttributeValue } from './index';

function Example({
  onCommit,
  orientation,
}: {
  onCommit: (v: string) => void;
  orientation?: AttributeOrientation;
}) {
  return (
    <Attribute data-testid='attr' orientation={orientation}>
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
    // Same seam, horizontal axis — AttributeValue is the sole owner of the
    // -ml-7 hit-target offset; InlineEditPreview/InlineEditControl no
    // longer carry it themselves (see AttributeValue.tsx). Gated on
    // AttributeValue's own box via has-[], not a descendant selector, so the
    // same rule also covers AttributeActionsTarget (see next test file).
    expect(value.className).toContain('has-[[data-slot=inline-edit]]:-ml-7');
    expect(value.className).toContain('has-[[data-slot=attribute-actions-target]]:-ml-7');
    // Regression: the -ml-7 above pulls the whole AttributeValue box left,
    // including InlineEditError — cancel it there so the error message
    // stays flush with the label instead of overhanging its left edge.
    expect(value.className).toContain('[&_[data-slot=inline-edit-error]]:ml-7');
    expect(value.className).toContain('has-[[data-slot=inline-edit]]:overflow-visible');
  });

  it('keeps the -ml-7 hit-target pulls in horizontal orientation', () => {
    // Both pulls apply in both orientations so the guest's text lines up
    // where a plain value would sit (see AttributeValue.tsx).
    render(<Example onCommit={() => {}} orientation='horizontal' />);
    const value = screen.getByTestId('attr--value');
    expect(value.className).toContain('has-[[data-slot=inline-edit]]:-ml-7');
    expect(value.className).toContain('has-[[data-slot=attribute-actions-target]]:-ml-7');
    // The pull is active for the hosted InlineEdit, so its error cancel
    // must follow in horizontal too.
    expect(value.className).toContain('[&_[data-slot=inline-edit-error]]:ml-7');
    // The vertical-axis cancellation still applies regardless of orientation.
    expect(value.className).toContain('[&_[data-slot=inline-edit-preview]]:-my-4');
    expect(value.className).toContain('[&_[data-slot=inline-edit-control]]:-my-4');
  });
});
