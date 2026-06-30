import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AttributeEdit } from './AttributeEdit';
import { AttributeEditControl } from './AttributeEditControl';
import { AttributeEditInput } from './AttributeEditInput';

describe('AttributeEditInput', () => {
  it('binds the draft value and updates it on typing', async () => {
    const onChange = vi.fn();
    render(
      <AttributeEdit defaultEdit defaultValue='ab' onValueChange={onChange} data-testid='attr'>
        <AttributeEditControl>
          <AttributeEditInput />
        </AttributeEditControl>
      </AttributeEdit>,
    );
    const input = screen.getByTestId('attr--edit-input') as HTMLInputElement;
    expect(input.value).toBe('ab');
    await userEvent.type(input, 'c');
    expect(onChange).toHaveBeenLastCalledWith('abc');
  });

  it('forwards arbitrary data-* to the real input node (metrics)', () => {
    render(
      <AttributeEdit defaultEdit defaultValue='ab' data-testid='attr'>
        <AttributeEditControl>
          <AttributeEditInput data-analytics-id='ATTR_INPUT' />
        </AttributeEditControl>
      </AttributeEdit>,
    );
    expect(screen.getByTestId('attr--edit-input')).toHaveAttribute(
      'data-analytics-id',
      'ATTR_INPUT',
    );
  });

  it('marks the input invalid when the edit is in error', () => {
    render(
      <AttributeEdit defaultEdit defaultValue='ab' status='error' error='bad' data-testid='attr'>
        <AttributeEditControl>
          <AttributeEditInput />
        </AttributeEditControl>
      </AttributeEdit>,
    );
    expect(screen.getByTestId('attr--edit-input')).toHaveAttribute('aria-invalid', 'true');
  });
});
