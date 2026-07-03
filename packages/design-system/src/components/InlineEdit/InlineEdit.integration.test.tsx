import { render, screen } from '@testing-library/react';
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
