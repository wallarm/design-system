import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AttributeEdit } from './AttributeEdit';
import { AttributeEditControl } from './AttributeEditControl';
import { AttributeEditInput } from './AttributeEditInput';
import { AttributeEditNumber } from './AttributeEditNumber';
import { AttributeEditTextarea } from './AttributeEditTextarea';

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

describe('AttributeEditTextarea', () => {
  it('forwards arbitrary data-* to the real textarea node (metrics)', () => {
    render(
      <AttributeEdit defaultEdit defaultValue='ab' data-testid='attr'>
        <AttributeEditControl>
          <AttributeEditTextarea data-analytics-id='ATTR_TEXTAREA' />
        </AttributeEditControl>
      </AttributeEdit>,
    );
    const node = screen.getByTestId('attr--edit-input');
    expect(node.tagName).toBe('TEXTAREA');
    expect(node).toHaveAttribute('data-analytics-id', 'ATTR_TEXTAREA');
  });
});

describe('AttributeEditNumber', () => {
  // Documented closed-target gap: NumberInput forwards consumer props to its
  // Ark `Root` wrapper, not the inner `<input>`. Click analytics still resolve
  // via `closest('[data-analytics-id]')`, but the attribute is not on the real
  // focusable node. See ANALYTICS_GAPS.md — the durable fix lives in NumberInput.
  it('forwards arbitrary data-* (currently to the NumberInput wrapper)', () => {
    render(
      <AttributeEdit defaultEdit defaultValue='8443' data-testid='attr'>
        <AttributeEditControl>
          <AttributeEditNumber data-analytics-id='ATTR_NUMBER' />
        </AttributeEditControl>
      </AttributeEdit>,
    );
    expect(screen.getByTestId('attr--edit-input')).toHaveAttribute(
      'data-analytics-id',
      'ATTR_NUMBER',
    );
  });
});
