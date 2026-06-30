// AttributeEdit.integration.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Attribute,
  AttributeEdit,
  AttributeEditControl,
  AttributeEditError,
  AttributeEditInput,
  AttributeEditPreview,
  AttributeLabel,
  AttributeValue,
} from './index';

function Example({ onCommit }: { onCommit: (v: string) => void }) {
  return (
    <Attribute data-testid='attr'>
      <AttributeLabel>Name</AttributeLabel>
      <AttributeValue>
        <AttributeEdit defaultValue='Checkout API' onValueCommit={onCommit}>
          <AttributeEditPreview>Checkout API</AttributeEditPreview>
          <AttributeEditControl>
            <AttributeEditInput />
          </AttributeEditControl>
          <AttributeEditError />
        </AttributeEdit>
      </AttributeValue>
    </Attribute>
  );
}

describe('AttributeEdit integration', () => {
  it('click → type → Enter commits the new value', async () => {
    const onCommit = vi.fn();
    render(<Example onCommit={onCommit} />);
    await userEvent.click(screen.getByTestId('attr--edit-preview'));
    const input = screen.getByTestId('attr--edit-input') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, 'Payments API{Enter}');
    expect(onCommit).toHaveBeenCalledWith('Payments API');
    expect(screen.getByTestId('attr--edit-preview')).toBeInTheDocument();
  });

  it('Escape reverts without committing', async () => {
    const onCommit = vi.fn();
    render(<Example onCommit={onCommit} />);
    await userEvent.click(screen.getByTestId('attr--edit-preview'));
    await userEvent.type(screen.getByTestId('attr--edit-input'), 'x');
    await userEvent.keyboard('{Escape}');
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('attr--edit-preview')).toBeInTheDocument();
  });
});
